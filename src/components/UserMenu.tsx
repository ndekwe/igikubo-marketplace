"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";

type MenuItem = { icon: string; label: string; href: string };

export default function UserMenu({
  name,
  email,
  accent,
  items,
}: {
  name: string;
  email: string;
  accent: string;
  items: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const avatar: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-fredoka), sans-serif",
    fontWeight: 600,
    color: "#fff",
    fontSize: ".95rem",
    background: accent,
    flexShrink: 0,
  };
  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 11,
    textDecoration: "none",
    color: "#43392f",
    fontWeight: 700,
    fontSize: ".92rem",
    padding: "11px 12px",
    borderRadius: 12,
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          background: "#fff",
          border: "1.5px solid #f0e7d6",
          borderRadius: 999,
          padding: "5px 12px 5px 5px",
          cursor: "pointer",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        <span style={avatar}>{initials}</span>
        <span style={{ fontWeight: 800, fontSize: ".88rem", color: "#36302a", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ color: "#a89e8e", fontSize: ".7rem" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: 54, right: 0, width: 248, background: "#fff", border: "1px solid #f0e7d6", borderRadius: 20, boxShadow: "0 20px 44px rgba(120,90,40,.18)", padding: 10, zIndex: 80, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 12px 14px" }}>
            <span style={avatar}>{initials}</span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
              <strong style={{ fontSize: ".94rem", color: "#36302a" }}>{name}</strong>
              <span style={{ fontSize: ".8rem", color: "#8a8175", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
            </span>
          </div>
          <div style={{ height: 1, background: "#f0e7d6", margin: "0 6px 6px" }} />
          {items.map((m) => (
            <Link key={m.label} href={m.href} style={itemStyle} onClick={() => setOpen(false)}>
              <span style={{ width: 20, textAlign: "center" }}>{m.icon}</span>
              {m.label}
            </Link>
          ))}
          <div style={{ height: 1, background: "#f0e7d6", margin: 6 }} />
          <form action="/auth/signout" method="post" style={{ margin: 0 }}>
            <button
              type="submit"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, border: "none", background: "none", cursor: "pointer", color: "#d6553a", fontWeight: 700, fontSize: ".92rem", padding: "11px 12px", borderRadius: 12, fontFamily: "var(--font-nunito), sans-serif" }}
            >
              <span style={{ width: 20, textAlign: "center" }}>⎋</span>Déconnexion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
