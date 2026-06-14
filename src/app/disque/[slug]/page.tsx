import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscCard from "@/components/DiscCard";
import ProductGallery from "@/components/ProductGallery";
import AddToCartBox from "@/components/AddToCartBox";
import FavoriteButton from "@/components/FavoriteButton";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

const AVATAR_COLORS = ["#ff9e7d", "#7ec99a", "#b8a7f0", "#5aa9f0", "#e0a93a", "#e07ec0"];

type ReviewRow = { rating: number; comment: string | null; buyer: { display_name: string | null } | null };
type DiscRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_cents: number;
  age_min: number | null;
  players_min: number | null;
  players_max: number | null;
  duration_min: number | null;
  theme: { slug: string; name: string } | null;
  creator: { display_name: string | null } | null;
  reviews: ReviewRow[];
};
type SimilarRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  theme: { slug: string; name: string } | null;
  creator: { display_name: string | null } | null;
  reviews: { rating: number }[];
};

const stars = (r: number) => Array.from({ length: 5 }, (_, i) => (i < Math.round(r) ? "★" : "☆")).join("");

export default async function DisquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("discs")
    .select(
      "id,slug,title,description,price_cents,age_min,players_min,players_max,duration_min, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name), reviews(rating,comment, buyer:profiles!reviews_buyer_id_fkey(display_name))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();
  const disc = data as unknown as DiscRow;

  // Session + état favori du joueur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isFavorited = false;
  if (user) {
    const { data: favRow } = await supabase
      .from("favorites")
      .select("disc_id")
      .eq("user_id", user.id)
      .eq("disc_id", disc.id)
      .maybeSingle();
    isFavorited = !!favRow;
  }

  const themeSlug = disc.theme?.slug ?? "";
  const themeName = disc.theme?.name ?? "";
  const { color, colorLight, icon } = themeVisual(themeSlug);
  const priceLabel = (disc.price_cents / 100).toFixed(2).replace(".", ",") + " €";

  const reviews = disc.reviews ?? [];
  const reviewCount = reviews.length;
  const avg = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const avgLabel = reviewCount ? avg.toFixed(1).replace(".", ",") : "—";

  // Distribution 5 -> 1 étoiles
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return { star: `${star}★`, pct: reviewCount ? Math.round((n / reviewCount) * 100) : 0 };
  });

  const meta = [
    { label: "Joueurs", value: disc.players_min && disc.players_max ? `${disc.players_min} – ${disc.players_max}` : "—" },
    { label: "Âge", value: disc.age_min ? `${disc.age_min} ans +` : "—" },
    { label: "Durée", value: disc.duration_min ? `${disc.duration_min} min` : "—" },
  ];

  // Disques similaires (autres disques publiés)
  const { data: similarData } = await supabase
    .from("discs")
    .select("id,slug,title,price_cents, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name), reviews(rating)")
    .eq("status", "published")
    .neq("id", disc.id)
    .limit(4);

  const similar = ((similarData ?? []) as unknown as SimilarRow[]).map((d) => {
    const v = themeVisual(d.theme?.slug ?? "");
    const rs = d.reviews ?? [];
    const a = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
    return {
      id: d.id,
      slug: d.slug,
      title: d.title,
      theme: d.theme?.name ?? "",
      creator: d.creator?.display_name ?? "Créateur",
      price: d.price_cents / 100,
      rating: Math.round(a * 10) / 10,
      reviews: rs.length,
      ...v,
    };
  });

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh" }}>
      <Header active="catalogue" />

      {/* Fil d'Ariane */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 8px" }}>
        <div style={{ fontSize: ".86rem", color: "#9a8f7d", fontWeight: 600 }}>
          <Link href="/" style={{ color: "#9a8f7d", textDecoration: "none" }}>Accueil</Link>
          &nbsp;›&nbsp;
          <Link href="/catalogue" style={{ color: "#9a8f7d", textDecoration: "none" }}>Catalogue</Link>
          &nbsp;›&nbsp;<span style={{ color: "#9a8f7d" }}>{themeName}</span>
          &nbsp;›&nbsp;<span style={{ color: "#36302a" }}>{disc.title}</span>
        </div>
      </section>

      {/* Galerie + infos */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px 50px", display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
        <ProductGallery color={color} colorLight={colorLight} icon={icon} theme={themeName} />

        <div style={{ flex: "1 1 380px", minWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(2rem,4vw,2.8rem)", lineHeight: 1.08 }}>{disc.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#36302a" }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600 }}>
                {(disc.creator?.display_name ?? "C").charAt(0).toUpperCase()}
              </span>
              <span style={{ fontWeight: 700 }}>
                par <span style={{ color, textDecoration: "underline" }}>{disc.creator?.display_name ?? "Créateur"}</span>
              </span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <span style={{ color: "#f5b73d", letterSpacing: "1px" }}>{stars(avg)}</span> {avgLabel}
              <span style={{ color: "#9a8f7d", fontWeight: 600 }}>({reviewCount} avis)</span>
            </span>
          </div>

          {disc.description && (
            <p style={{ margin: 0, fontSize: "1.08rem", lineHeight: 1.65, color: "#5f5648" }}>{disc.description}</p>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {meta.map((m) => (
              <div key={m.label} style={{ flex: "1 1 120px", background: "#fff", border: "1px solid #f0e7d6", borderRadius: 18, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: ".78rem", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#9a8f7d" }}>{m.label}</span>
                <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.18rem", color: "#36302a" }}>{m.value}</span>
              </div>
            ))}
          </div>

          <AddToCartBox priceLabel={priceLabel} />

          <FavoriteButton discId={disc.id} userId={user?.id ?? null} initialFavorited={isFavorited} />
        </div>
      </section>

      {/* Le jeu en bref + bon à savoir */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: "30px 30px" }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem" }}>Le jeu en bref</h2>
            <p style={{ margin: 0, lineHeight: 1.7, color: "#5f5648" }}>{disc.description ?? "La description de ce disque arrive bientôt."}</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: "30px 30px" }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem" }}>Bon à savoir</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {["Disque compatible avec le plateau octogonal Igikubo", "Format numérique : un PDF à imprimer chez toi", "Accès à vie et re-téléchargement depuis ton compte", "Chaque achat soutient directement le créateur"].map((t, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", lineHeight: 1.55, color: "#5f5648" }}>
                  <span style={{ flex: "0 0 auto", width: 26, height: 26, borderRadius: "50%", background: colorLight, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".85rem" }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Avis */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 40px" }}>
        <h2 style={{ margin: "0 0 22px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.8rem" }}>Avis des joueurs</h2>
        {reviewCount === 0 ? (
          <div style={{ background: "#fff", border: "1px dashed #e7dcc8", borderRadius: 24, padding: "40px 24px", textAlign: "center", color: "#8a8175" }}>
            Ce disque n&apos;a pas encore d&apos;avis. Sois le premier à le noter après ton achat !
          </div>
        ) : (
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 250px", background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", gap: 14, alignItems: "center", textAlign: "center" }}>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "3.2rem", lineHeight: 1, color: "#36302a" }}>{avgLabel}</span>
              <span style={{ color: "#f5b73d", fontSize: "1.2rem", letterSpacing: "2px" }}>{stars(avg)}</span>
              <span style={{ color: "#9a8f7d", fontWeight: 700 }}>{reviewCount} avis vérifiés</span>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
                {dist.map((b) => (
                  <div key={b.star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".8rem", color: "#6f6557", fontWeight: 700 }}>
                    <span style={{ width: 14 }}>{b.star}</span>
                    <span style={{ flex: 1, height: 8, borderRadius: 999, background: "#f0e7d6", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", background: "#ffce5c", width: `${b.pct}%` }} />
                    </span>
                    <span style={{ width: 34, textAlign: "right", color: "#9a8f7d" }}>{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
              {reviews.map((r, i) => {
                const name = r.buyer?.display_name ?? "Joueur";
                const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div key={i} style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 22, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span style={{ width: 40, height: 40, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, color: "#fff", background: c }}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                        <strong>{name}</strong>
                        <span style={{ color: "#f5b73d", fontSize: ".82rem", letterSpacing: "1px" }}>{stars(r.rating)}</span>
                      </span>
                    </div>
                    {r.comment && <p style={{ margin: 0, lineHeight: 1.6, color: "#5f5648", fontSize: ".96rem" }}>“{r.comment}”</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Similaires */}
      {similar.length > 0 && (
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 70px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.8rem" }}>Tu aimeras aussi</h2>
            <Link href="/catalogue" style={{ textDecoration: "none", color: "#36302a", fontWeight: 800, fontSize: ".95rem", padding: "11px 20px", borderRadius: 999, border: "1.5px solid #e7dcc8", background: "#fff" }}>
              Voir plus →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))", gap: 20 }}>
            {similar.map((d) => (
              <DiscCard key={d.id} {...d} href={`/disque/${d.slug}`} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
