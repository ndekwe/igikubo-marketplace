import Link from "next/link";
import type { CSSProperties } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentCaMarche from "@/components/CommentCaMarche";
import DiscCard from "@/components/DiscCard";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";

type DiscRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  creator_id: string;
  theme: { slug: string; name: string } | null;
  creator: { display_name: string | null } | null;
  reviews: { rating: number }[];
};

const TESTIMONIALS = [
  { quote: "Mon fils révise les maths sans s'en rendre compte. On change de disque chaque semaine, c'est devenu notre rituel du dimanche.", name: "Aline M.", role: "Joueuse · maman de 2", color: "#ff9e7d" },
  { quote: "J'ai publié mon disque d'histoire en une après-midi. En trois mois, plus de 200 ventes et des messages du monde entier.", name: "Jean-Bosco K.", role: "Créateur · enseignant", color: "#7ec99a" },
  { quote: "Un seul plateau et toute la famille y trouve son jeu. La forme octogonale plaît énormément aux enfants.", name: "Sofia R.", role: "Joueuse · animatrice", color: "#b8a7f0" },
];

const OCTAGON = "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)";

// Petit disque flottant décoratif du hero (rotation statique + flottement vertical).
function FloatingDisc({ size, color, light, icon, rot, top, bottom, left, right, delay, dur }: { size: number; color: string; light: string; icon: string; rot: string; top?: string; bottom?: string; left?: string; right?: string; delay: string; dur: string }) {
  const wedge = `conic-gradient(from -22.5deg,${color} 0 45deg,${light} 45deg 90deg,${color} 90deg 135deg,${light} 135deg 180deg,${color} 180deg 225deg,${light} 225deg 270deg,${color} 270deg 315deg,${light} 0)`;
  return (
    <div style={{ position: "absolute", top, bottom, left, right, transform: `rotate(${rot})` }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: wedge, boxShadow: `inset 0 0 0 5px rgba(255,255,255,.6),0 12px 22px ${color}59`, display: "flex", alignItems: "center", justifyContent: "center", animation: `floaty ${dur} ease-in-out ${delay} infinite` }}>
        <span style={{ width: "46%", height: "46%", background: "#fffdf8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", color, fontWeight: 600 }}>{icon}</span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: themesData }, { data: discsData }] = await Promise.all([
    supabase.from("themes").select("slug,name").order("name"),
    supabase
      .from("discs")
      .select("id,slug,title,price_cents,creator_id, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(display_name), reviews(rating)")
      .eq("status", "published"),
  ]);

  const discs = (discsData ?? []) as unknown as DiscRow[];

  // Stats réelles
  const totalDiscs = discs.length;
  const totalCreators = new Set(discs.map((d) => d.creator_id)).size;

  // Disques à la une : les 4 plus commentés
  const featured = [...discs]
    .sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0))
    .slice(0, 4)
    .map((d) => {
      const v = themeVisual(d.theme?.slug ?? "");
      const rs = d.reviews ?? [];
      const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        theme: d.theme?.name ?? "",
        creator: d.creator?.display_name ?? "Créateur",
        price: d.price_cents / 100,
        rating: Math.round(avg * 10) / 10,
        reviews: rs.length,
        ...v,
      };
    });

  // Compteurs par thème
  const countBySlug = new Map<string, number>();
  discs.forEach((d) => {
    const s = d.theme?.slug;
    if (s) countBySlug.set(s, (countBySlug.get(s) ?? 0) + 1);
  });
  const themes = (themesData ?? []).map((t) => ({ ...t, ...themeVisual(t.slug), count: countBySlug.get(t.slug) ?? 0 }));

  const statStyle: CSSProperties = { fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.7rem", color: "#36302a" };
  const statLabel: CSSProperties = { fontSize: ".86rem", color: "#8a8175", fontWeight: 600 };
  const sectionEyebrow = (color: string): CSSProperties => ({ fontWeight: 800, fontSize: ".84rem", letterSpacing: ".16em", textTransform: "uppercase", color });

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", overflowX: "hidden" }}>
      <Header active="" />

      {/* HERO */}
      <section style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "64px 24px 40px", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
        <div style={{ position: "absolute", top: 30, right: 120, width: 280, height: 280, background: "#ffce5c", opacity: 0.18, filter: "blur(60px)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: 0, left: 40, width: 240, height: 240, background: "#7ec99a", opacity: 0.16, filter: "blur(60px)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, flex: "1 1 420px", minWidth: 300, display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #ffe2b8", color: "#c98a2e", fontWeight: 800, fontSize: ".82rem", padding: "8px 16px", borderRadius: 999 }}>✦ Une marketplace, mille jeux</span>
          <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(2.6rem,5vw,4rem)", lineHeight: 1.05, color: "#36302a" }}>
            Des centaines de jeux pour <span style={{ color: "#ff8a63" }}>un seul plateau.</span>
          </h1>
          <p style={{ margin: 0, fontSize: "1.12rem", lineHeight: 1.6, color: "#6f6557", maxWidth: 520 }}>
            Igikubo est un plateau octogonal qui accueille des <strong style={{ color: "#36302a" }}>disques</strong> interchangeables. Chaque disque, c&apos;est un jeu : maths, histoire, langues, biologie… imaginés par des créateurs du monde entier.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
            <Link href="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", background: "#ff8a63", color: "#fff", fontWeight: 800, fontSize: "1.02rem", padding: "15px 28px", borderRadius: 999, boxShadow: "0 12px 26px rgba(255,138,99,.38)" }}>Explorer les disques</Link>
            <Link href="/devenir-createur" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", background: "#fff", color: "#36302a", fontWeight: 800, fontSize: "1.02rem", padding: "15px 28px", borderRadius: 999, border: "1.5px solid #e7dcc8" }}>Vendre mes créations</Link>
          </div>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 14 }}>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={statStyle}>{totalDiscs}</span><span style={statLabel}>disques publiés</span></div>
            <div style={{ width: 1, background: "#ece2d0" }} />
            <div style={{ display: "flex", flexDirection: "column" }}><span style={statStyle}>{totalCreators}</span><span style={statLabel}>créateur{totalCreators > 1 ? "s" : ""} actif{totalCreators > 1 ? "s" : ""}</span></div>
            <div style={{ width: 1, background: "#ece2d0" }} />
            <div style={{ display: "flex", flexDirection: "column" }}><span style={statStyle}>4–99</span><span style={statLabel}>ans, pour tous</span></div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, flex: "1 1 380px", minWidth: 300, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "min(440px,86vw)", aspectRatio: "1" }}>
            <div style={{ position: "absolute", inset: "6%", clipPath: OCTAGON, background: "linear-gradient(150deg,#ffffff,#fdeede)", boxShadow: "0 40px 70px rgba(220,150,90,.28), inset 0 0 0 2px #fff" }} />
            <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", background: "conic-gradient(from -22.5deg,#ff9e7d 0 45deg,#ffce5c 45deg 90deg,#7ec99a 90deg 135deg,#5aa9f0 135deg 180deg,#b8a7f0 180deg 225deg,#f3a8d8 225deg 270deg,#f0a860 270deg 315deg,#4fc6c0 315deg 360deg)", boxShadow: "inset 0 0 0 8px rgba(255,255,255,.6), 0 16px 30px rgba(120,90,40,.25)", animation: "spinslow 40s linear infinite" }} />
            <div style={{ position: "absolute", inset: "42%", background: "#fffdf8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px rgba(0,0,0,.12)" }}>
              <span style={{ width: "54%", height: "54%", background: "#fff1dd", clipPath: OCTAGON, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.6rem", color: "#ff8a63" }}>i</span>
            </div>
            <FloatingDisc size={88} color="#5aa9f0" light="#cfe6fb" icon="π" rot="-8deg" top="-2%" left="6%" delay="0s" dur="5s" />
            <FloatingDisc size={78} color="#7ec99a" light="#d6efe0" icon="B" rot="6deg" bottom="2%" right="-1%" delay=".8s" dur="6s" />
            <FloatingDisc size={64} color="#f3a8d8" light="#fcdcf0" icon="?" rot="12deg" top="18%" right="-6%" delay="1.4s" dur="5.5s" />
          </div>
        </div>
      </section>

      <CommentCaMarche />

      {/* DISQUES A LA UNE */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px 56px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={sectionEyebrow("#ff8a63")}>Disques à la une</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.4vw,2.6rem)", color: "#36302a" }}>Les coups de cœur de la communauté</h2>
            </div>
            <Link href="/catalogue" style={{ textDecoration: "none", color: "#36302a", fontWeight: 800, fontSize: ".95rem", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, border: "1.5px solid #e7dcc8", background: "#fff" }}>Voir tout le catalogue →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))", gap: 22 }}>
            {featured.map((d) => (
              <DiscCard key={d.id} {...d} href={`/disque/${d.slug}`} />
            ))}
          </div>
        </section>
      )}

      {/* EXPLORER PAR THEME */}
      <section id="themes" style={{ background: "linear-gradient(180deg,#fff9ef,#fdf1e2)", padding: "56px 0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 30 }}>
            <span style={sectionEyebrow("#b8a7f0")}>Explorer par thème</span>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.4vw,2.6rem)", color: "#36302a" }}>Trouve ta prochaine partie</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 18 }}>
            {themes.map((t) => (
              <Link key={t.slug} href="/catalogue" style={{ textDecoration: "none", color: "#36302a", background: "#fff", border: "1px solid #f0e7d6", borderRadius: 22, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
                <span style={{ width: 64, height: 64, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.7rem", color: "#fff", background: t.color }}>{t.icon}</span>
                <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.06rem" }}>{t.name}</span>
                <span style={{ fontSize: ".84rem", color: "#8a8175", fontWeight: 600 }}>{t.count} disque{t.count > 1 ? "s" : ""}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DEVIENS CREATEUR */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(130deg,#7ec99a,#5fae82)", borderRadius: 34, padding: "54px clamp(28px,5vw,64px)", display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center", boxShadow: "0 24px 50px rgba(95,174,130,.3)" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
          <div style={{ position: "relative", zIndex: 1, flex: "1 1 420px", minWidth: 280, display: "flex", flexDirection: "column", gap: 18, color: "#fff" }}>
            <span style={{ alignSelf: "flex-start", background: "rgba(255,255,255,.2)", padding: "7px 15px", borderRadius: 999, fontWeight: 800, fontSize: ".82rem" }}>Pour les créateurs</span>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.4vw,2.7rem)", lineHeight: 1.1 }}>Tu as un jeu dans la tête ? Donne-lui un disque.</h2>
            <p style={{ margin: 0, fontSize: "1.08rem", lineHeight: 1.6, color: "rgba(255,255,255,.92)", maxWidth: 520 }}>Enseignants, chercheurs, passionnés : publie ton jeu pédagogique, touche les joueurs et la diaspora du monde entier, et gagne des revenus à chaque vente.</p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>✓ Audience mondiale</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>✓ Revenus à chaque vente</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>✓ Communauté bienveillante</span>
            </div>
            <Link href="/devenir-createur" style={{ alignSelf: "flex-start", marginTop: 10, textDecoration: "none", background: "#fffdf7", color: "#3f6f53", fontWeight: 800, fontSize: "1.02rem", padding: "15px 30px", borderRadius: 999, boxShadow: "0 12px 24px rgba(0,0,0,.15)" }}>Commencer à vendre</Link>
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", flex: "1 1 220px" }}>
            <div style={{ width: 200, height: 200, borderRadius: "50%", background: "conic-gradient(from -22.5deg,#fff 0 45deg,#eafff2 45deg 90deg,#fff 90deg 135deg,#eafff2 135deg 180deg,#fff 180deg 225deg,#eafff2 225deg 270deg,#fff 270deg 315deg,#eafff2 0)", boxShadow: "inset 0 0 0 10px rgba(255,255,255,.5),0 20px 40px rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: "54%", height: "54%", background: "#7ec99a", clipPath: OCTAGON, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "2rem", color: "#fff" }}>+</span>
            </div>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 24px 70px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 30 }}>
          <span style={sectionEyebrow("#f0a860")}>Ils en parlent</span>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.4vw,2.6rem)", color: "#36302a" }}>Joueurs et créateurs, même bonheur</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 22 }}>
          {TESTIMONIALS.map((q) => (
            <div key={q.name} style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: "30px 28px", display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
              <span style={{ color: "#f5b73d", fontSize: "1.05rem", letterSpacing: "2px" }}>★★★★★</span>
              <p style={{ margin: 0, fontSize: "1.04rem", lineHeight: 1.65, color: "#43392f" }}>“{q.quote}”</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                <span style={{ width: 46, height: 46, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, color: "#fff", fontSize: "1.1rem", background: q.color }}>{q.name.charAt(0).toUpperCase()}</span>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                  <strong style={{ fontSize: ".98rem", color: "#36302a" }}>{q.name}</strong>
                  <span style={{ fontSize: ".84rem", color: "#8a8175", fontWeight: 600 }}>{q.role}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
