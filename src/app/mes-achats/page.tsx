import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import Disc from "@/components/Disc";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

type Row = {
  id: string;
  created_at: string;
  disc: {
    slug: string;
    title: string;
    theme: { slug: string; name: string } | null;
    creator: { display_name: string | null } | null;
  } | null;
};

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function MesAchatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data } = await supabase
    .from("orders")
    .select("id, created_at, disc:discs(slug,title, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name))")
    .eq("buyer_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const items = ((data ?? []) as unknown as Row[]).filter((r) => r.disc);

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role="joueur" active="achats" />
      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "36px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: ".82rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#ff8a63" }}>Ma bibliothèque</span>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.6rem)" }}>Mes achats</h1>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f0e7d6", borderRadius: 999, padding: "10px 18px", fontWeight: 700, fontSize: ".9rem" }}>
            <strong style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, color: "#5fae82" }}>{items.length}</strong> disques
          </span>
        </div>
        <p style={{ margin: "0 0 26px", color: "#6f6557", maxWidth: 600, fontSize: "1.02rem" }}>Tes disques print-and-play sont à toi pour toujours. Télécharge le PDF, imprime, découpe et glisse-le sur ton plateau.</p>

        {items.length === 0 ? (
          <div style={{ background: "#fff", border: "1px dashed #e7dcc8", borderRadius: 28, padding: "70px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <span style={{ width: 88, height: 88, borderRadius: "50%", background: "#fdeede", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", color: "#ff8a63" }}>⬇</span>
            <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem" }}>Ta bibliothèque est vide</h3>
            <p style={{ margin: 0, color: "#8a8175", maxWidth: 400 }}>Quand tu achèteras un disque, il apparaîtra ici, prêt à télécharger et imprimer.</p>
            <Link href="/catalogue" style={{ marginTop: 6, textDecoration: "none", background: "#ff8a63", color: "#fff", fontWeight: 800, padding: "13px 26px", borderRadius: 999, boxShadow: "0 10px 22px rgba(255,138,99,.35)" }}>Explorer le catalogue</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 20 }}>
            {items.map((r) => {
              const d = r.disc!;
              const v = themeVisual(d.theme?.slug ?? "");
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 86, flexShrink: 0 }}>
                      <Disc color={v.color} colorLight={v.colorLight} icon={v.icon} size="86px" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
                      <span style={{ alignSelf: "flex-start", background: v.colorLight, color: "#5a4a2e", fontWeight: 800, fontSize: ".72rem", padding: "4px 11px", borderRadius: 999 }}>{d.theme?.name}</span>
                      <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.15rem", lineHeight: 1.2 }}>{d.title}</h3>
                      <span style={{ fontSize: ".86rem", color: "#8a8175", fontWeight: 600 }}>par {d.creator?.display_name}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: ".82rem", color: "#9a8f7d", fontWeight: 700, borderTop: "1px dashed #efe5d3", paddingTop: 13 }}>
                    <span>Acheté le {dateFr(r.created_at)}</span>
                    <span>PDF</span>
                  </div>
                  {/* Le téléchargement sécurisé (URL signée) sera branché en Phase 4 avec le paiement. */}
                  <Link href={`/disque/${d.slug}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", background: "#36302a", color: "#fff", fontWeight: 800, fontSize: ".92rem", padding: 12, borderRadius: 14 }}>
                    <span style={{ fontSize: "1.05rem" }}>⬇</span> Télécharger
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
