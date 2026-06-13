import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type NavKey = "" | "catalogue" | "createur" | "how";

const NAV_ITEMS: { label: string; href: string; key: NavKey }[] = [
  { label: "Catalogue", href: "/catalogue", key: "catalogue" },
  { label: "Devenir créateur", href: "/devenir-createur", key: "createur" },
  { label: "Comment ça marche", href: "/devenir-createur#etapes", key: "how" },
];

export default async function Header({ active = "" }: { active?: NavKey }) {
  // Session courante (Supabase). Null tant que non connecté ou non configuré.
  let displayName: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
      displayName = profile?.display_name || user.email?.split("@")[0] || "Mon compte";
    }
  } catch {
    // Supabase non configuré : on reste en mode déconnecté.
  }

  return (
    <header style={{ fontFamily: "var(--font-nunito), sans-serif", position: "sticky", top: 0, zIndex: 50 }}>
      {/* Bandeau slogan */}
      <div style={{ background: "linear-gradient(90deg,#ff9e7d,#ffce5c 45%,#7ec99a 100%)", color: "#4a3a22" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "7px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: ".84rem" }}>
            <span style={{ fontSize: "1rem" }}>✦</span> Éveiller le Bonheur par les Jeux
          </span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 20, fontWeight: 700, fontSize: ".82rem" }}>
            <Link href="/devenir-createur" style={{ color: "#4a3a22", textDecoration: "none" }}>
              Comment ça marche
            </Link>
            <a href="#" style={{ color: "#4a3a22", textDecoration: "none" }}>Aide</a>
            <a href="#" style={{ color: "#4a3a22", textDecoration: "none" }}>FR · €</a>
          </div>
        </div>
      </div>

      {/* Barre principale */}
      <div style={{ background: "rgba(255,253,247,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f0e7d6" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
            <span
              style={{
                position: "relative",
                width: 46,
                height: 46,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ff8a63",
                clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
                boxShadow: "0 8px 18px rgba(255,138,99,.4)",
              }}
            >
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fffdf7", boxShadow: "inset 0 0 0 4px #ffce5c" }} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.42rem", color: "#36302a" }}>
                Igikubo
              </span>
              <span style={{ fontWeight: 800, fontSize: ".66rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#ff8a63" }}>
                Marketplace
              </span>
            </span>
          </Link>

          <label
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              border: "1.5px solid #f0e7d6",
              borderRadius: 999,
              padding: "11px 18px",
              boxShadow: "inset 0 1px 3px rgba(120,90,40,.04)",
            }}
          >
            <span style={{ color: "#c2b6a2", fontSize: "1rem" }}>⌕</span>
            <input
              type="text"
              placeholder="Rechercher un disque, un thème, un créateur…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: 1,
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: ".92rem",
                color: "#36302a",
              }}
            />
          </label>

          <nav style={{ display: "inline-flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link"
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  textDecoration: "none",
                  color: "#4a4036",
                  fontWeight: 700,
                  fontSize: ".92rem",
                }}
              >
                <span>{item.label}</span>
                {item.key === active && (
                  <span style={{ display: "block", width: "100%", height: 3, borderRadius: 3, background: "#ff8a63" }} />
                )}
              </Link>
            ))}

            {displayName ? (
              <>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#4a4036",
                    fontWeight: 800,
                    fontSize: ".92rem",
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#ff8a63",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: ".8rem",
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  {displayName}
                </span>
                <form action="/auth/signout" method="post" style={{ margin: 0 }}>
                  <button
                    type="submit"
                    className="nav-link"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#4a4036",
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 700,
                      fontSize: ".92rem",
                    }}
                  >
                    Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/connexion" className="nav-link" style={{ textDecoration: "none", color: "#4a4036", fontWeight: 700, fontSize: ".92rem" }}>
                  Connexion
                </Link>
                <Link
                  href="/connexion#inscription"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                    background: "#ff8a63",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: ".92rem",
                    padding: "11px 22px",
                    borderRadius: 999,
                    boxShadow: "0 8px 18px rgba(255,138,99,.35)",
                  }}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}

            <Link
              href="/panier"
              aria-label="Panier"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#fff",
                border: "1.5px solid #f0e7d6",
                textDecoration: "none",
              }}
            >
              <span style={{ position: "relative", width: 22, height: 20, display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 12,
                    height: 7,
                    border: "2.5px solid #4a4036",
                    borderBottom: "none",
                    borderRadius: "7px 7px 0 0",
                  }}
                />
                <span style={{ position: "absolute", bottom: 0, left: 0, width: 22, height: 15, background: "#4a4036", borderRadius: "4px 4px 6px 6px" }} />
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
