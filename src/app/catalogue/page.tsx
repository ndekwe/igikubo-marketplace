import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogueClient, { type CatalogueDisc, type CatalogueTheme } from "@/components/CatalogueClient";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

type DiscRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  theme: { slug: string; name: string } | null;
  creator: { display_name: string | null } | null;
  reviews: { rating: number }[];
};

export default async function CataloguePage() {
  const supabase = await createClient();

  const [{ data: themesData }, { data: discsData }] = await Promise.all([
    supabase.from("themes").select("slug,name").order("name"),
    supabase
      .from("discs")
      .select("id,slug,title,price_cents, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name), reviews(rating)")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const themes: CatalogueTheme[] = (themesData ?? []).map((t) => ({ slug: t.slug, name: t.name }));

  const discs: CatalogueDisc[] = ((discsData ?? []) as unknown as DiscRow[]).map((d) => {
    const slug = d.theme?.slug ?? "";
    const { color, colorLight, icon } = themeVisual(slug);
    const ratings = d.reviews ?? [];
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    return {
      id: d.id,
      slug: d.slug,
      title: d.title,
      theme: d.theme?.name ?? "",
      themeSlug: slug,
      creator: d.creator?.display_name ?? "Créateur",
      price: d.price_cents / 100,
      rating: Math.round(avg * 10) / 10,
      reviews: ratings.length,
      color,
      colorLight,
      icon,
    };
  });

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh" }}>
      <Header active="catalogue" />

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 24px 10px" }}>
        <div style={{ fontSize: ".86rem", color: "#9a8f7d", fontWeight: 600, marginBottom: 10 }}>
          <Link href="/" style={{ color: "#9a8f7d", textDecoration: "none" }}>Accueil</Link>
          &nbsp;›&nbsp;<span style={{ color: "#36302a" }}>Catalogue</span>
        </div>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-fredoka), sans-serif",
            fontWeight: 600,
            fontSize: "clamp(2rem,4vw,2.8rem)",
          }}
        >
          Le catalogue des disques
        </h1>
        <p style={{ margin: 0, fontSize: "1.05rem", color: "#6f6557", maxWidth: 620 }}>
          Glisse, joue, recommence. Filtre par thème, âge ou budget pour trouver le disque parfait pour ton plateau.
        </p>
      </section>

      <CatalogueClient discs={discs} themes={themes} />

      <Footer />
    </div>
  );
}
