"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import Disc from "@/components/Disc";
import { createClient } from "@/lib/supabase/client";

export type ModItem = {
  id: string;
  title: string;
  theme: string;
  color: string;
  colorLight: string;
  icon: string;
  submitted: string;
  creator: string;
  creatorInitial: string;
  creatorColor: string;
  creatorStat: string;
  desc: string;
  price: string;
  age: string;
  players: string;
  duration: string;
  fileInfo: string;
  pdfUrl: string | null;
};

const REASONS = ["Qualité du PDF insuffisante", "Règles incomplètes", "Visuels à retravailler", "Hors charte Igikubo"];

export default function ModerationList({ initialItems }: { initialItems: ModItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [modalFor, setModalFor] = useState<ModItem | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  }

  async function approve(d: ModItem) {
    setBusy(d.id);
    const { error } = await supabase.from("discs").update({ status: "published", rejection_reason: null }).eq("id", d.id);
    setBusy(null);
    if (error) return flash("Erreur : " + error.message, false);
    setItems((list) => list.filter((x) => x.id !== d.id));
    flash(`« ${d.title} » approuvé et publié`, true);
  }

  async function confirmRefuse() {
    if (!modalFor) return;
    const d = modalFor;
    setBusy(d.id);
    const { error } = await supabase.from("discs").update({ status: "rejected", rejection_reason: reasonText || "Non précisé" }).eq("id", d.id);
    setBusy(null);
    setModalFor(null);
    setReasonText("");
    if (error) return flash("Erreur : " + error.message, false);
    setItems((list) => list.filter((x) => x.id !== d.id));
    flash(`« ${d.title} » refusé, créateur notifié`, false);
  }

  const badge = (colorLight: string): CSSProperties => ({ background: colorLight, color: "#5a4a2e", fontWeight: 800, fontSize: ".74rem", padding: "5px 12px", borderRadius: 999 });
  const reasonBase: CSSProperties = { border: "1.5px solid #efe5d3", cursor: "pointer", background: "#fff", color: "#6f6557", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: ".8rem", padding: "7px 13px", borderRadius: 999 };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: ".82rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#e0a93a" }}>File de modération</span>
          <h1 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.5rem)" }}>Disques à valider</h1>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fdf2d6", color: "#b07d1e", fontWeight: 800, padding: "11px 20px", borderRadius: 999 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#e0a93a" }} />
          {items.length} en attente
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #c7e7d4", borderRadius: 28, padding: "70px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span style={{ width: 84, height: 84, borderRadius: "50%", background: "#e9f6ee", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", color: "#5fae82" }}>✓</span>
          <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.5rem" }}>File vide, bravo !</h3>
          <p style={{ margin: 0, color: "#8a8175" }}>Tous les disques soumis ont été traités. Reviens plus tard.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {items.map((d) => (
            <div key={d.id} style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 24, display: "flex", gap: 22, flexWrap: "wrap", boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ background: "linear-gradient(160deg,#f7f3ec,#efe8db)", borderRadius: 20, padding: 18 }}>
                  <div style={{ width: 120 }}>
                    <Disc color={d.color} colorLight={d.colorLight} icon={d.icon} size="120px" />
                  </div>
                </div>
                <span style={{ fontSize: ".78rem", color: "#9a8f7d", fontWeight: 700 }}>{d.fileInfo}</span>
              </div>
              <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={badge(d.colorLight)}>{d.theme}</span>
                  <span style={{ fontSize: ".82rem", color: "#9a8f7d", fontWeight: 700 }}>Soumis {d.submitted}</span>
                </div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.4rem" }}>{d.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, color: "#fff", fontSize: ".78rem", background: d.creatorColor }}>{d.creatorInitial}</span>
                  <span style={{ fontWeight: 700, color: "#5aa9f0" }}>{d.creator}</span>
                  <span style={{ fontSize: ".82rem", color: "#9a8f7d" }}>· {d.creatorStat}</span>
                </div>
                {d.desc && <p style={{ margin: 0, lineHeight: 1.6, color: "#5f5648", fontSize: ".95rem" }}>{d.desc}</p>}
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: ".86rem", color: "#6f6557", fontWeight: 700 }}>
                  <span>Prix · {d.price}</span><span>Âge · {d.age}</span><span>Joueurs · {d.players}</span><span>Durée · {d.duration}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                  {d.pdfUrl ? (
                    <a href={d.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", border: "1.5px solid #efe5d3", color: "#36302a", fontWeight: 800, fontSize: ".88rem", padding: "10px 18px", borderRadius: 12 }}>⬇ Ouvrir le PDF</a>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #efe5d3", color: "#9a8f7d", fontWeight: 800, fontSize: ".88rem", padding: "10px 18px", borderRadius: 12 }}>Aucun PDF</span>
                  )}
                  <button type="button" disabled={busy === d.id} onClick={() => approve(d)} style={{ border: "none", cursor: "pointer", background: "#5fae82", color: "#fff", fontWeight: 800, fontSize: ".88rem", padding: "10px 22px", borderRadius: 12, boxShadow: "0 8px 16px rgba(95,174,130,.3)", opacity: busy === d.id ? 0.6 : 1 }}>✓ Approuver</button>
                  <button type="button" disabled={busy === d.id} onClick={() => { setModalFor(d); setReasonText(""); }} style={{ border: "1.5px solid #f3c9bd", cursor: "pointer", background: "#fff", color: "#d6553a", fontWeight: 800, fontSize: ".88rem", padding: "10px 22px", borderRadius: 12 }}>✕ Refuser</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 90, display: "flex", alignItems: "center", gap: 11, background: "#2f2a24", color: "#fff", padding: "14px 22px", borderRadius: 14, boxShadow: "0 16px 36px rgba(0,0,0,.25)", fontWeight: 700 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", background: toast.ok ? "#5fae82" : "#d6553a", color: "#fff" }}>{toast.ok ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      {/* Modale de refus */}
      {modalFor && (
        <div onClick={() => setModalFor(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(47,42,36,.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 26, padding: 30, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 30px 70px rgba(0,0,0,.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ width: 48, height: 48, borderRadius: "50%", background: "#fbe3dc", color: "#d6553a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>✕</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Refuser ce disque</h3>
                <span style={{ fontSize: ".88rem", color: "#8a8175" }}>{modalFor.title}</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: ".92rem", color: "#6f6557", lineHeight: 1.55 }}>Explique au créateur ce qui doit être corrigé. Il pourra modifier et resoumettre.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setReasonText(r)} style={reasonText === r ? { ...reasonBase, background: "#fbe3dc", color: "#d6553a", borderColor: "#f3c9bd" } : reasonBase}>{r}</button>
              ))}
            </div>
            <textarea rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="Motif du refus…" style={{ border: "1.5px solid #ece2d0", borderRadius: 14, padding: "12px 15px", fontSize: ".95rem", color: "#36302a", outline: "none", resize: "vertical", fontFamily: "var(--font-nunito), sans-serif", lineHeight: 1.5 }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setModalFor(null)} style={{ border: "1.5px solid #efe5d3", background: "#fff", cursor: "pointer", color: "#36302a", fontWeight: 800, fontSize: ".92rem", padding: "12px 22px", borderRadius: 12 }}>Annuler</button>
              <button type="button" onClick={confirmRefuse} style={{ border: "none", cursor: "pointer", background: "#d6553a", color: "#fff", fontWeight: 800, fontSize: ".92rem", padding: "12px 22px", borderRadius: 12 }}>Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
