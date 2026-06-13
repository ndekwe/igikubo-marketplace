import Link from "next/link";
import type { CSSProperties } from "react";
import Disc from "./Disc";

export type DiscCardProps = {
  title: string;
  theme: string;
  creator: string;
  price: number;
  rating: number;
  reviews: number;
  color: string;
  colorLight: string;
  icon: string;
  href?: string;
};

export default function DiscCard({
  title,
  theme,
  creator,
  price,
  rating,
  reviews,
  color,
  colorLight,
  icon,
  href = "#",
}: DiscCardProps) {
  const filled = Math.round(rating || 0);
  const stars = Array.from({ length: 5 }, (_, i) => (i < filled ? "★" : "☆")).join("");
  const ratingLabel = rating ? rating.toFixed(1).replace(".", ",") : "—";
  const priceLabel = (price || 0).toFixed(2).replace(".", ",") + " €";
  const creatorInitial = (creator || "Créateur").trim().charAt(0).toUpperCase();

  const card: CSSProperties = {
    textDecoration: "none",
    color: "#36302a",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#ffffff",
    border: "1px solid #f0e7d6",
    borderRadius: 26,
    padding: "20px 20px 22px",
    boxShadow: "0 6px 18px rgba(120,90,40,.06)",
    fontFamily: "var(--font-nunito), sans-serif",
  };

  const badge: CSSProperties = {
    position: "absolute",
    top: 6,
    left: 0,
    zIndex: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 13px",
    borderRadius: 999,
    fontSize: ".74rem",
    fontWeight: 800,
    letterSpacing: ".02em",
    background: colorLight,
    color: "#5a4a2e",
  };

  const avatar: CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: ".66rem",
    fontWeight: 800,
    color: "#fff",
    background: color,
  };

  return (
    <Link href={href} className="disc-card" style={card}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 6px 2px",
        }}
      >
        <div style={badge}>{theme}</div>
        <div style={{ width: "100%", maxWidth: 200 }}>
          <Disc className="disc-card__emblem" color={color} colorLight={colorLight} icon={icon} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-fredoka), sans-serif",
            fontWeight: 600,
            fontSize: "1.18rem",
            lineHeight: 1.2,
            color: "#36302a",
          }}
        >
          {title}
        </h3>
        <div
          style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".86rem", color: "#8a8175" }}
        >
          <span style={avatar}>{creatorInitial}</span>
          <span style={{ fontWeight: 600 }}>par {creator}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".86rem" }}>
          <span style={{ color: "#f5b73d", letterSpacing: "1px" }}>{stars}</span>
          <span style={{ fontWeight: 800, color: "#36302a" }}>{ratingLabel}</span>
          <span style={{ color: "#a89e8e" }}>({reviews})</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-fredoka), sans-serif",
            fontWeight: 600,
            fontSize: "1.32rem",
            color: "#36302a",
          }}
        >
          {priceLabel}
        </span>
        <span
          className="disc-card__cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 999,
            background: "#36302a",
            color: "#fff",
            fontWeight: 800,
            fontSize: ".86rem",
          }}
        >
          Voir →
        </span>
      </div>
    </Link>
  );
}
