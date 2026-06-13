"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

const STEPS = {
  joueur: [
    { num: "1", title: "Procure-toi le plateau", text: "Le plateau octogonal Igikubo est ta base de jeu pour la vie. Un seul achat, des milliers de parties." },
    { num: "2", title: "Explore les disques", text: "Parcours le catalogue et filtre par thème, tranche d'âge ou nombre de joueurs. Trouve le jeu parfait." },
    { num: "3", title: "Joue et recommence", text: "Glisse un disque, joue, échange-le pour un autre univers. Un plateau, mille aventures." },
  ],
  createur: [
    { num: "1", title: "Conçois ton disque", text: "Imagine un jeu pédagogique et adapte-le au format disque compatible avec le plateau Igikubo." },
    { num: "2", title: "Publie ta création", text: "Mets ton disque en ligne, fixe ton prix, raconte ton univers et tes règles en quelques minutes." },
    { num: "3", title: "Vends au monde entier", text: "Touche les joueurs et la diaspora, reçois des avis, et gagne des revenus à chaque vente." },
  ],
};

export default function CommentCaMarche() {
  const [mode, setMode] = useState<"joueur" | "createur">("joueur");
  const accent = mode === "joueur" ? "#ff8a63" : "#5fae82";

  const tabBase: CSSProperties = { border: "none", cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: ".95rem", padding: "11px 26px", borderRadius: 999, transition: "all .2s ease" };
  const on = (c: string): CSSProperties => ({ ...tabBase, background: c, color: "#fff", boxShadow: "0 8px 16px rgba(0,0,0,.12)" });
  const off: CSSProperties = { ...tabBase, background: "transparent", color: "#8a8175" };

  return (
    <section id="comment" style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 30 }}>
        <span style={{ fontWeight: 800, fontSize: ".84rem", letterSpacing: ".16em", textTransform: "uppercase", color: "#7ec99a" }}>Comment ça marche</span>
        <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.4vw,2.6rem)", color: "#36302a" }}>Simple des deux côtés du plateau</h2>
        <div style={{ display: "inline-flex", background: "#fff", border: "1.5px solid #efe5d3", borderRadius: 999, padding: 5, gap: 4, marginTop: 8 }}>
          <button type="button" onClick={() => setMode("joueur")} style={mode === "joueur" ? on("#ff8a63") : off}>Je joue</button>
          <button type="button" onClick={() => setMode("createur")} style={mode === "createur" ? on("#5fae82") : off}>Je crée</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
        {STEPS[mode].map((s) => (
          <div key={s.num} style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: "30px 26px", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
            <span style={{ width: 54, height: 54, display: "inline-flex", alignItems: "center", justifyContent: "center", clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem", color: "#fff", background: accent }}>{s.num}</span>
            <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.28rem", color: "#36302a" }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: ".98rem", lineHeight: 1.6, color: "#6f6557" }}>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
