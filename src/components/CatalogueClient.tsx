"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import DiscCard from "@/components/DiscCard";
import { themeVisual } from "@/lib/theme-visuals";

export type CatalogueDisc = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  themeSlug: string;
  creator: string;
  price: number;
  rating: number;
  reviews: number;
  color: string;
  colorLight: string;
  icon: string;
};

export type CatalogueTheme = { slug: string; name: string };

const AGE_OPTIONS = ["4-6 ans", "7-9 ans", "10-12 ans", "13+ ans"];
const PLAYER_OPTIONS = ["Solo", "2 joueurs", "3-4", "5+"];
const RATING_OPTIONS: [string, number][] = [["Toutes", 0], ["4,5 ★ +", 4.5], ["4,8 ★ +", 4.8]];

const SORT_OPTIONS = [
  { value: "pop", label: "Popularité" },
  { value: "new", label: "Nouveautés" },
  { value: "asc", label: "Prix croissant" },
  { value: "desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
];

const sectionTitle: CSSProperties = {
  fontWeight: 800,
  fontSize: ".82rem",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#9a8f7d",
};

function chipStyle(active: boolean): CSSProperties {
  const base: CSSProperties = {
    border: "1.5px solid #efe5d3",
    cursor: "pointer",
    fontFamily: "var(--font-nunito), sans-serif",
    fontWeight: 700,
    fontSize: ".84rem",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#fff",
    color: "#6f6557",
    transition: "all .18s ease",
  };
  return active ? { ...base, background: "#36302a", color: "#fff", borderColor: "#36302a" } : base;
}

export default function CatalogueClient({
  discs,
  themes,
}: {
  discs: CatalogueDisc[];
  themes: CatalogueTheme[];
}) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(20);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("pop");
  const [age, setAge] = useState("");
  const [players, setPlayers] = useState("");

  const resetFilters = () => {
    setSelectedThemes([]);
    setMaxPrice(20);
    setMinRating(0);
    setSort("pop");
    setAge("");
    setPlayers("");
  };

  const toggleTheme = (slug: string) =>
    setSelectedThemes((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));

  const visible = useMemo(() => {
    let list = discs.filter(
      (d) =>
        (selectedThemes.length === 0 || selectedThemes.includes(d.themeSlug)) &&
        d.price <= maxPrice &&
        d.rating >= minRating
    );
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "new") list = [...list].reverse();
    else list = [...list].sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [discs, selectedThemes, maxPrice, minRating, sort]);

  const priceLabel = maxPrice.toFixed(2).replace(".", ",") + " €";

  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "24px 24px 60px",
        display: "flex",
        gap: 30,
        alignItems: "flex-start",
      }}
    >
      {/* Panneau de filtres */}
      <aside
        style={{
          position: "sticky",
          top: 130,
          flex: "0 0 268px",
          width: 268,
          background: "#fff",
          border: "1px solid #f0e7d6",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 6px 18px rgba(120,90,40,.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>Filtres</span>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#ff8a63",
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 800,
              fontSize: ".84rem",
            }}
          >
            Réinitialiser
          </button>
        </div>

        {/* Thèmes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={sectionTitle}>Thème</span>
          {themes.map((t) => {
            const active = selectedThemes.includes(t.slug);
            const { color } = themeVisual(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggleTheme(t.slug)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700,
                  fontSize: ".92rem",
                  color: "#43392f",
                  padding: "2px 0",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: color }} />
                  {t.name}
                </span>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 7,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".8rem",
                    fontWeight: 800,
                    color: "#fff",
                    border: active ? "none" : "1.5px solid #e2d7c3",
                    background: active ? "#ff8a63" : "#fff",
                  }}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: "#f0e7d6" }} />

        {/* Âge (décoratif pour l'instant) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={sectionTitle}>Tranche d&apos;âge</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AGE_OPTIONS.map((a) => (
              <button key={a} type="button" onClick={() => setAge(age === a ? "" : a)} style={chipStyle(age === a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Nombre de joueurs (décoratif) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={sectionTitle}>Nombre de joueurs</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PLAYER_OPTIONS.map((p) => (
              <button key={p} type="button" onClick={() => setPlayers(players === p ? "" : p)} style={chipStyle(players === p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "#f0e7d6" }} />

        {/* Prix max */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={sectionTitle}>Prix max</span>
            <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, color: "#ff8a63" }}>{priceLabel}</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.5}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Note minimale */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={sectionTitle}>Note minimale</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RATING_OPTIONS.map(([label, val]) => (
              <button key={label} type="button" onClick={() => setMinRating(val)} style={chipStyle(minRating === val)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Résultats */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            background: "#fff",
            border: "1px solid #f0e7d6",
            borderRadius: 18,
            padding: "14px 20px",
          }}
        >
          <span style={{ fontWeight: 700, color: "#6f6557" }}>
            <strong style={{ color: "#36302a", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
              {visible.length}
            </strong>{" "}
            disques trouvés
          </span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#6f6557", fontSize: ".9rem" }}>
            Trier par
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 700,
                fontSize: ".9rem",
                color: "#36302a",
                border: "1.5px solid #efe5d3",
                borderRadius: 999,
                padding: "9px 16px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))", gap: 20 }}>
            {visible.map((d) => (
              <DiscCard key={d.id} {...d} href={`/disque/${d.slug}`} />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #e7dcc8",
              borderRadius: 24,
              padding: "60px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "#fdeede",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                color: "#ff8a63",
              }}
            >
              ∅
            </span>
            <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>
              Aucun disque ne correspond
            </h3>
            <p style={{ margin: 0, color: "#8a8175" }}>Essaie d&apos;élargir tes filtres ou de réinitialiser ta recherche.</p>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                marginTop: 6,
                border: "none",
                cursor: "pointer",
                background: "#ff8a63",
                color: "#fff",
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 800,
                padding: "12px 24px",
                borderRadius: 999,
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Pagination (statique pour l'instant) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: "50%", background: "#ff8a63", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, cursor: "pointer" }}>1</span>
          <Link href="#" style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", border: "1.5px solid #efe5d3", color: "#36302a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, textDecoration: "none" }}>→</Link>
        </div>
      </div>
    </section>
  );
}
