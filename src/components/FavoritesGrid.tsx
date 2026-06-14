"use client";

import { useState } from "react";
import Link from "next/link";
import Disc from "@/components/Disc";
import { createClient } from "@/lib/supabase/client";

export type FavDisc = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  creator: string;
  price: string;
  color: string;
  colorLight: string;
  icon: string;
};

export default function FavoritesGrid({ initial, userId }: { initial: FavDisc[]; userId: string }) {
  const supabase = createClient();
  const [favs, setFavs] = useState(initial);

  async function remove(discId: string) {
    setFavs((list) => list.filter((d) => d.id !== discId));
    await supabase.from("favorites").delete().eq("user_id", userId).eq("disc_id", discId);
  }

  if (favs.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px dashed #e7dcc8", borderRadius: 28, padding: "70px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <span style={{ width: 88, height: 88, borderRadius: "50%", background: "#fcdcf0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", color: "#e07ec0" }}>♡</span>
        <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem" }}>Aucun favori pour l&apos;instant</h3>
        <p style={{ margin: 0, color: "#8a8175", maxWidth: 380 }}>Parcours le catalogue et appuie sur le cœur des disques que tu veux garder en tête.</p>
        <Link href="/catalogue" style={{ marginTop: 6, textDecoration: "none", background: "#ff8a63", color: "#fff", fontWeight: 800, padding: "13px 26px", borderRadius: 999, boxShadow: "0 10px 22px rgba(255,138,99,.35)" }}>Explorer le catalogue</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))", gap: 20 }}>
      {favs.map((d) => (
        <div key={d.id} style={{ position: "relative", background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
          <button type="button" onClick={() => remove(d.id)} aria-label="Retirer des favoris" style={{ position: "absolute", top: 16, right: 16, zIndex: 2, width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.1)", color: "#ff6b8a", fontSize: "1.1rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>♥</button>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 8px 0" }}>
            <div style={{ width: 150 }}>
              <Disc color={d.color} colorLight={d.colorLight} icon={d.icon} size="150px" />
            </div>
          </div>
          <span style={{ alignSelf: "flex-start", background: d.colorLight, color: "#5a4a2e", fontWeight: 800, fontSize: ".72rem", padding: "4px 11px", borderRadius: 999 }}>{d.theme}</span>
          <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.12rem", lineHeight: 1.2 }}>{d.title}</h3>
          <span style={{ fontSize: ".84rem", color: "#8a8175", fontWeight: 600, marginTop: -6 }}>par {d.creator}</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>{d.price}</span>
            <Link href={`/disque/${d.slug}`} style={{ textDecoration: "none", background: "#ff8a63", color: "#fff", fontWeight: 800, fontSize: ".85rem", padding: "9px 16px", borderRadius: 999 }}>Voir</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
