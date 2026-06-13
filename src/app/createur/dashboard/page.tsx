import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import MyDiscsTable, { type CreatorDisc } from "@/components/MyDiscsTable";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

type DiscRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  status: CreatorDisc["status"];
  theme: { slug: string; name: string } | null;
  reviews: { rating: number }[];
  orders: { amount_cents: number; status: string }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (profile?.role !== "creator") redirect("/");

  const { data } = await supabase
    .from("discs")
    .select("id,slug,title,price_cents,status, theme:themes(slug,name), reviews(rating), orders(amount_cents,status)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as DiscRow[];

  // Stats
  let revenueCents = 0;
  let salesTotal = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  rows.forEach((d) => {
    const paid = (d.orders ?? []).filter((o) => o.status === "paid");
    salesTotal += paid.length;
    revenueCents += paid.reduce((s, o) => s + o.amount_cents, 0);
    (d.reviews ?? []).forEach((r) => {
      ratingSum += r.rating;
      ratingCount += 1;
    });
  });
  const publishedCount = rows.filter((d) => d.status === "published").length;
  const pendingCount = rows.filter((d) => d.status === "pending").length;
  const avgRating = ratingCount ? (ratingSum / ratingCount).toFixed(1).replace(".", ",") : "—";

  const stats = [
    { icon: "€", value: (revenueCents / 100).toFixed(0) + " €", label: "Revenus (total)", color: "#5fae82" },
    { icon: "↗", value: String(salesTotal), label: "Ventes", color: "#ff8a63" },
    { icon: "◉", value: String(publishedCount), label: "Disques publiés", color: "#5aa9f0", note: pendingCount ? `${pendingCount} en attente` : undefined },
    { icon: "★", value: avgRating, label: "Note moyenne", color: "#e0a93a", note: ratingCount ? `${ratingCount} avis` : undefined },
  ];

  const discs: CreatorDisc[] = rows.map((d) => {
    const v = themeVisual(d.theme?.slug ?? "");
    const paid = (d.orders ?? []).filter((o) => o.status === "paid");
    return {
      id: d.id,
      slug: d.slug,
      title: d.title,
      theme: d.theme?.name ?? "",
      price: (d.price_cents / 100).toFixed(2).replace(".", ",") + " €",
      sales: paid.length,
      status: d.status,
      ...v,
    };
  });

  const cardStyle: CSSProperties = { background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 6px 18px rgba(120,90,40,.05)" };

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role="createur" active="dashboard" />

      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "36px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: ".82rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#5fae82" }}>Tableau de bord</span>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.5rem)" }}>
              Bonjour, {profile?.display_name ?? "créateur"} 👋
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 18, marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: "#fff", background: s.color }}>{s.icon}</span>
                {s.note && <span style={{ fontWeight: 800, fontSize: ".8rem", padding: "4px 10px", borderRadius: 999, color: "#9a8f7d", background: "#f4ecdd" }}>{s.note}</span>}
              </div>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "2rem", lineHeight: 1, color: "#36302a" }}>{s.value}</span>
              <span style={{ fontSize: ".88rem", color: "#8a8175", fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <MyDiscsTable discs={discs} />
      </main>

      <Footer />
    </div>
  );
}
