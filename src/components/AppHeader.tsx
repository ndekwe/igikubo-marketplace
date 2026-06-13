import Link from "next/link";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "@/components/UserMenu";

type Role = "joueur" | "createur";

export default async function AppHeader({ role = "createur", active = "" }: { role?: Role; active?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).single()
    : { data: null };

  const isJoueur = role === "joueur";
  const accent = isJoueur ? "#ff8a63" : "#5fae82";
  const name = profile?.display_name || user?.email?.split("@")[0] || (isJoueur ? "Joueur" : "Créateur");
  const email = user?.email || "";

  const navBase: CSSProperties = { textDecoration: "none", fontWeight: 700, fontSize: ".92rem", color: "#5f5648", padding: "9px 15px", borderRadius: 999 };
  const navOn: CSSProperties = { ...navBase, color: accent, background: isJoueur ? "#fdeede" : "#e9f6ee" };
  const nav = isJoueur
    ? [
        { label: "Catalogue", href: "/catalogue", key: "catalogue" },
        { label: "Mes achats", href: "/mes-achats", key: "achats" },
        { label: "Mes favoris", href: "/mes-favoris", key: "favoris" },
      ]
    : [
        { label: "Tableau de bord", href: "/createur/dashboard", key: "dashboard" },
        { label: "Mes disques", href: "/createur/dashboard#disques", key: "disques" },
        { label: "Mes ventes", href: "/createur/ventes", key: "ventes" },
      ];

  const menuItems = isJoueur
    ? [
        { icon: "☺", label: "Mon profil", href: "/compte" },
        { icon: "⬇", label: "Mes achats", href: "/mes-achats" },
        { icon: "♥", label: "Mes favoris", href: "/mes-favoris" },
      ]
    : [
        { icon: "◉", label: "Mon profil public", href: "/compte" },
        { icon: "▦", label: "Tableau de bord", href: "/createur/dashboard" },
        { icon: "€", label: "Mes ventes", href: "/createur/ventes" },
      ];

  return (
    <header style={{ fontFamily: "var(--font-nunito), sans-serif", position: "sticky", top: 0, zIndex: 60, background: "rgba(255,253,247,.94)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f0e7d6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        <Link href={isJoueur ? "/catalogue" : "/createur/dashboard"} style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          <span style={{ position: "relative", width: 42, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ff8a63", clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)", boxShadow: "0 8px 16px rgba(255,138,99,.35)" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fffdf7", boxShadow: "inset 0 0 0 4px #ffce5c" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem", color: "#36302a" }}>Igikubo</span>
            <span style={{ fontWeight: 800, fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#ff8a63" }}>{isJoueur ? "Espace joueur" : "Espace créateur"}</span>
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          {nav.map((item) => (
            <Link key={item.key} href={item.href} style={active === item.key ? navOn : navBase}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {!isJoueur && (
          <Link href="/createur/disque/nouveau" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#5fae82", color: "#fff", fontWeight: 800, fontSize: ".9rem", padding: "11px 20px", borderRadius: 999, boxShadow: "0 8px 16px rgba(95,174,130,.32)" }}>
            + Nouveau disque
          </Link>
        )}

        <UserMenu name={name} email={email} accent={accent} items={menuItems} />
      </div>
    </header>
  );
}
