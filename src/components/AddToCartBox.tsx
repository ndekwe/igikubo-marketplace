"use client";

import { useState } from "react";

export default function AddToCartBox({ priceLabel }: { priceLabel: string }) {
  const [added, setAdded] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0e7d6",
        borderRadius: 24,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 8px 22px rgba(120,90,40,.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "2.2rem", color: "#36302a" }}>{priceLabel}</span>
        <span style={{ color: "#9a8f7d", fontWeight: 600 }}>PDF à imprimer · téléchargement immédiat</span>
      </div>
      <button
        type="button"
        onClick={() => setAdded(true)}
        style={{
          width: "100%",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 800,
          fontSize: "1.05rem",
          padding: "15px 26px",
          borderRadius: 999,
          color: "#fff",
          background: added ? "#7ec99a" : "#ff8a63",
          boxShadow: added ? "0 12px 24px rgba(126,201,154,.4)" : "0 12px 24px rgba(255,138,99,.35)",
        }}
      >
        {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: ".86rem", color: "#6f6557", fontWeight: 700 }}>
        <span>✓ Compatible plateau Igikubo</span>
        <span>✓ Téléchargement immédiat</span>
        <span>✓ Soutient le créateur</span>
      </div>
    </div>
  );
}
