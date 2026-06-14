import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import FavoritesGrid, { type FavDisc } from "@/components/FavoritesGrid";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

type Row = {
  disc: {
    id: string;
    slug: string;
    title: string;
    price_cents: number;
    theme: { slug: string; name: string } | null;
    creator: { display_name: string | null } | null;
  } | null;
};

export default async function MesFavorisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data } = await supabase
    .from("favorites")
    .select("disc:discs(id,slug,title,price_cents, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favs: FavDisc[] = ((data ?? []) as unknown as Row[])
    .filter((r) => r.disc)
    .map((r) => {
      const d = r.disc!;
      const v = themeVisual(d.theme?.slug ?? "");
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        theme: d.theme?.name ?? "",
        creator: d.creator?.display_name ?? "Créateur",
        price: (d.price_cents / 100).toFixed(2).replace(".", ",") + " €",
        ...v,
      };
    });

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role="joueur" active="favoris" />
      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "36px 24px 60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
          <span style={{ fontWeight: 800, fontSize: ".82rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#f3a8d8" }}>Ma liste d&apos;envies</span>
          <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.6rem)" }}>Mes favoris</h1>
          <p style={{ margin: 0, color: "#6f6557", maxWidth: 600, fontSize: "1.02rem" }}>Les disques que tu gardes sous le coude. Reviens les découvrir quand tu veux.</p>
        </div>
        <FavoritesGrid initial={favs} userId={user.id} />
      </main>
      <Footer />
    </div>
  );
}
