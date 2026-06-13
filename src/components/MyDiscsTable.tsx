"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import Disc from "@/components/Disc";

export type CreatorDisc = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  price: string;
  sales: number;
  status: "draft" | "pending" | "published" | "rejected";
  color: string;
  colorLight: string;
  icon: string;
};

const STATUS_LABEL: Record<CreatorDisc["status"], string> = {
  draft: "Brouillon",
  pending: "En attente",
  published: "Publié",
  rejected: "Refusé",
};
const STATUS_COLOR: Record<CreatorDisc["status"], string> = {
  published: "#5fae82",
  pending: "#e0a93a",
  draft: "#9a8f7d",
  rejected: "#d6553a",
};
const STATUS_BG: Record<CreatorDisc["status"], string> = {
  published: "#e9f6ee",
  pending: "#fdf2d6",
  draft: "#f0ebe1",
  rejected: "#fbe3dc",
};

const FILTERS: { key: "tous" | CreatorDisc["status"]; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "published", label: "Publiés" },
  { key: "pending", label: "En attente" },
  { key: "draft", label: "Brouillons" },
  { key: "rejected", label: "Refusés" },
];

const GRID = "3fr 1.3fr 1fr 1fr 1.4fr 0.8fr";

export default function MyDiscsTable({ discs }: { discs: CreatorDisc[] }) {
  const [filter, setFilter] = useState<"tous" | CreatorDisc["status"]>("tous");

  const counts: Record<string, number> = { tous: discs.length };
  discs.forEach((d) => (counts[d.status] = (counts[d.status] ?? 0) + 1));

  const shown = discs.filter((d) => filter === "tous" || d.status === filter);

  const fBase: CSSProperties = { border: "1.5px solid #efe5d3", cursor: "pointer", background: "#fff", color: "#6f6557", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: ".84rem", padding: "9px 16px", borderRadius: 999 };
  const fOn: CSSProperties = { ...fBase, background: "#36302a", color: "#fff", borderColor: "#36302a" };
  const action: CSSProperties = { width: 36, height: 36, borderRadius: 10, border: "1.5px solid #efe5d3", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#6f6557" };

  return (
    <>
      <div id="disques" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.6rem" }}>Mes disques</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} style={filter === f.key ? fOn : fBase}>
              {f.label} <span style={{ opacity: 0.6 }}>{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, overflow: "hidden", boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 14, padding: "16px 24px", background: "#fbf4e8", fontSize: ".78rem", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#9a8f7d" }}>
          <span>Disque</span><span>Thème</span><span>Prix</span><span>Ventes</span><span>Statut</span><span />
        </div>

        {shown.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#8a8175", borderTop: "1px solid #f4ecdd" }}>
            Aucun disque dans cette catégorie. Crée ton premier disque avec le bouton « + Nouveau disque ».
          </div>
        ) : (
          shown.map((d) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: GRID, gap: 14, padding: "16px 24px", alignItems: "center", borderTop: "1px solid #f4ecdd" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                <div style={{ width: 46, flexShrink: 0 }}>
                  <Disc color={d.color} colorLight={d.colorLight} icon={d.icon} size="46px" ring={false} />
                </div>
                <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
              </div>
              <span style={{ fontSize: ".9rem", color: "#6f6557", fontWeight: 700 }}>{d.theme}</span>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600 }}>{d.price}</span>
              <span style={{ fontWeight: 700, color: "#6f6557" }}>{d.sales}</span>
              <span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", background: STATUS_BG[d.status], color: STATUS_COLOR[d.status], fontWeight: 800, fontSize: ".78rem", padding: "5px 12px", borderRadius: 999 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[d.status] }} />
                  {STATUS_LABEL[d.status]}
                </span>
              </span>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Link href={`/createur/disque/${d.id}/modifier`} aria-label="Éditer" style={action}>✎</Link>
                {d.status === "published" ? (
                  <Link href={`/disque/${d.slug}`} aria-label="Voir" style={action}>↗</Link>
                ) : (
                  <span aria-hidden style={{ ...action, opacity: 0.35 }}>↗</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
