import Link from "next/link";
import type { CSSProperties } from "react";

const linkStyle: CSSProperties = { color: "#bcae98", textDecoration: "none", fontSize: ".92rem" };
const colTitle: CSSProperties = { fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1rem", color: "#fff" };

const social: CSSProperties = {
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(232,221,203,.08)",
  borderRadius: "50%",
  color: "#e8ddcb",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: ".8rem",
};

export default function Footer() {
  return (
    <footer style={{ fontFamily: "var(--font-nunito), sans-serif", background: "#2f2a24", color: "#e8ddcb" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 24px 28px" }}>
        <div
          style={{
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: 44,
            borderBottom: "1px solid rgba(232,221,203,.14)",
          }}
        >
          <div style={{ maxWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 42,
                  height: 42,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ff8a63",
                  clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
                }}
              >
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fffdf7", boxShadow: "inset 0 0 0 4px #ffce5c" }} />
              </span>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "#fff" }}>
                Igikubo Marketplace
              </span>
            </span>
            <p style={{ margin: 0, fontSize: ".95rem", lineHeight: 1.65, color: "#bcae98" }}>
              Des centaines de jeux pour un seul plateau octogonal. Une place de marché qui réunit créateurs et joueurs, pour éveiller le bonheur par les jeux.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="#" aria-label="Instagram" style={social}>IG</a>
              <a href="#" aria-label="Facebook" style={social}>FB</a>
              <a href="#" aria-label="YouTube" style={social}>YT</a>
              <a href="#" aria-label="TikTok" style={social}>TT</a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 54, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 130 }}>
              <span style={colTitle}>Marketplace</span>
              <Link href="/catalogue" style={linkStyle}>Catalogue</Link>
              <Link href="/catalogue" style={linkStyle}>Nouveautés</Link>
              <Link href="/#themes" style={linkStyle}>Explorer par thème</Link>
              <Link href="/catalogue" style={linkStyle}>Meilleures ventes</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 130 }}>
              <span style={colTitle}>Créateurs</span>
              <Link href="/devenir-createur" style={linkStyle}>Devenir créateur</Link>
              <Link href="/devenir-createur#etapes" style={linkStyle}>Comment publier</Link>
              <Link href="/devenir-createur#faq" style={linkStyle}>FAQ créateurs</Link>
              <Link href="/devenir-createur" style={linkStyle}>Tarifs &amp; revenus</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 130 }}>
              <span style={colTitle}>Igikubo</span>
              <a href="#" style={linkStyle}>Le plateau octogonal</a>
              <a href="#" style={linkStyle}>Notre histoire</a>
              <a href="#" style={linkStyle}>Le journal</a>
              <a href="#" style={linkStyle}>Nous contacter</a>
            </div>
          </div>

          <div style={{ maxWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={colTitle}>La lettre joyeuse</span>
            <p style={{ margin: 0, fontSize: ".9rem", lineHeight: 1.55, color: "#bcae98" }}>
              Nouveaux disques, créateurs à suivre et idées de jeux, une fois par mois.
            </p>
            <form style={{ display: "flex", gap: 8, background: "#fffdf7", padding: 6, borderRadius: 999 }}>
              <input
                type="email"
                placeholder="Votre e-mail"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  flex: 1,
                  padding: "8px 14px",
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: ".88rem",
                  color: "#2f2a24",
                  minWidth: 0,
                }}
              />
              <button
                type="button"
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "#ff8a63",
                  color: "#fff",
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 800,
                  fontSize: ".85rem",
                  padding: "10px 18px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                Je m&apos;abonne
              </button>
            </form>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
            paddingTop: 22,
            fontSize: ".84rem",
            color: "#998c78",
          }}
        >
          <span>© 2026 Igikubo Marketplace · Conçu avec joie 😺 par la communauté.</span>
          <div style={{ display: "inline-flex", gap: 22, flexWrap: "wrap" }}>
            <a href="#" style={{ color: "#998c78", textDecoration: "none" }}>Mentions légales</a>
            <a href="#" style={{ color: "#998c78", textDecoration: "none" }}>CGV</a>
            <a href="#" style={{ color: "#998c78", textDecoration: "none" }}>Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
