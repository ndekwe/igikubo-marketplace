"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Disc from "@/components/Disc";
import { createClient } from "@/lib/supabase/client";
import { themeVisual } from "@/lib/theme-visuals";

export type EditorTheme = { id: string; slug: string; name: string };
export type EditorDisc = {
  id: string;
  title: string;
  themeSlug: string;
  symbol: string;
  priceLabel: string;
  ageMin: number | null;
  playersMin: number | null;
  playersMax: number | null;
  durationMin: number | null;
  description: string;
  filePath: string | null;
};

const AGES = [
  { label: "4 ans +", v: 4 },
  { label: "6 ans +", v: 6 },
  { label: "8 ans +", v: 8 },
  { label: "10 ans +", v: 10 },
  { label: "13 ans +", v: 13 },
];
const PLAYERS = [
  { label: "Solo", min: 1, max: 1 },
  { label: "2 – 4", min: 2, max: 4 },
  { label: "2 – 6", min: 2, max: 6 },
  { label: "5 +", min: 5, max: 8 },
];
const DURATIONS = [
  { label: "10–15 min", v: 15 },
  { label: "20–30 min", v: 30 },
  { label: "30–45 min", v: 45 },
  { label: "45 min +", v: 60 },
];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const card: CSSProperties = { background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: "28px 30px", display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 6px 18px rgba(120,90,40,.05)" };
const labelCol: CSSProperties = { display: "flex", flexDirection: "column", gap: 7 };
const labelText: CSSProperties = { fontWeight: 700, fontSize: ".86rem", color: "#5f5648" };
const input: CSSProperties = { border: "1.5px solid #ece2d0", borderRadius: 14, padding: "12px 15px", fontSize: ".95rem", color: "#36302a", outline: "none", fontFamily: "var(--font-nunito), sans-serif" };

function stepBadge(n: number, color: string) {
  return (
    <span style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)", background: color, color: "#fff", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600 }}>{n}</span>
  );
}

export default function DiscEditor({
  themes,
  userId,
  creatorName,
  disc,
}: {
  themes: EditorTheme[];
  userId: string;
  creatorName: string;
  disc?: EditorDisc;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const initialThemeSlug = disc?.themeSlug || themes[0]?.slug || "mathematiques";
  const [title, setTitle] = useState(disc?.title ?? "");
  const [themeSlug, setThemeSlug] = useState(initialThemeSlug);
  const [symbol, setSymbol] = useState(disc?.symbol ?? "");
  const [price, setPrice] = useState(disc?.priceLabel ?? "");
  const [ageIdx, setAgeIdx] = useState(() => Math.max(0, AGES.findIndex((a) => a.v === disc?.ageMin)));
  const [playersIdx, setPlayersIdx] = useState(() => {
    const i = PLAYERS.findIndex((p) => p.min === disc?.playersMin && p.max === disc?.playersMax);
    return i >= 0 ? i : 1;
  });
  const [durationIdx, setDurationIdx] = useState(() => {
    const i = DURATIONS.findIndex((d) => d.v === disc?.durationMin);
    return i >= 0 ? i : 1;
  });
  const [description, setDescription] = useState(disc?.description ?? "");
  const [filePath, setFilePath] = useState<string | null>(disc?.filePath ?? null);
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMo: string } | null>(
    disc?.filePath ? { name: disc.filePath.split("/").pop() || "fichier.pdf", sizeMo: "" } : null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const themeObj = themes.find((t) => t.slug === themeSlug);
  const { color, colorLight, icon: defaultIcon } = themeVisual(themeSlug);
  const icon = symbol.trim() || defaultIcon;
  const titleDisplay = title.trim() || "Titre de ton disque";
  const priceDisplay = price.trim() ? price.replace(".", ",").replace(/€/g, "").trim() + " €" : "—";

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Le fichier doit être un PDF.");
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${slugify(file.name.replace(/\.pdf$/i, ""))}.pdf`;
    const { error: upErr } = await supabase.storage.from("disc-files").upload(path, file, { upsert: true });
    setUploading(false);
    if (upErr) {
      setError("Échec de l'envoi du PDF : " + upErr.message);
      return;
    }
    setFilePath(path);
    setFileMeta({ name: file.name, sizeMo: (file.size / 1024 / 1024).toFixed(1) + " Mo" });
  }

  function removePdf() {
    setFilePath(null);
    setFileMeta(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save(status: "draft" | "pending") {
    setError(null);
    if (!title.trim()) {
      setError("Donne un titre à ton disque.");
      return;
    }
    if (status === "pending" && !filePath) {
      setError("Ajoute le PDF du jeu avant de soumettre pour validation.");
      return;
    }
    const cents = Math.round(parseFloat(price.replace(",", ".").replace(/[^0-9.]/g, "")) * 100) || 0;
    const payload = {
      creator_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      theme_id: themeObj?.id ?? null,
      age_min: AGES[ageIdx]?.v ?? null,
      players_min: PLAYERS[playersIdx]?.min ?? null,
      players_max: PLAYERS[playersIdx]?.max ?? null,
      duration_min: DURATIONS[durationIdx]?.v ?? null,
      price_cents: cents,
      status,
      file_path: filePath,
    };

    setSaving(true);
    let dbErr;
    if (disc) {
      ({ error: dbErr } = await supabase.from("discs").update(payload).eq("id", disc.id));
    } else {
      const slug = `${slugify(title) || "disque"}-${Date.now().toString(36).slice(-4)}`;
      ({ error: dbErr } = await supabase.from("discs").insert({ ...payload, slug }));
    }
    setSaving(false);
    if (dbErr) {
      setError("Erreur d'enregistrement : " + dbErr.message);
      return;
    }
    router.push("/createur/dashboard");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 28, alignItems: "start" }}>
      {/* FORMULAIRE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>{stepBadge(1, "#5fae82")}<h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Infos générales</h2></div>
          <label style={labelCol}>
            <span style={labelText}>Titre du disque</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Les Fractales de Kigali" style={input} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <label style={labelCol}>
              <span style={labelText}>Thème</span>
              <select value={themeSlug} onChange={(e) => { setThemeSlug(e.target.value); setSymbol(""); }} style={{ ...input, cursor: "pointer", background: "#fff" }}>
                {themes.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </select>
            </label>
            <label style={labelCol}>
              <span style={labelText}>Symbole</span>
              <input type="text" maxLength={2} value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder={defaultIcon} style={{ ...input, textAlign: "center" }} />
            </label>
            <label style={labelCol}>
              <span style={labelText}>Prix (€)</span>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12,90" style={input} />
            </label>
          </div>
        </section>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>{stepBadge(2, "#5aa9f0")}<h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Détails de jeu</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <label style={labelCol}>
              <span style={labelText}>Âge</span>
              <select value={ageIdx} onChange={(e) => setAgeIdx(Number(e.target.value))} style={{ ...input, cursor: "pointer", background: "#fff" }}>
                {AGES.map((a, i) => (<option key={a.v} value={i}>{a.label}</option>))}
              </select>
            </label>
            <label style={labelCol}>
              <span style={labelText}>Joueurs</span>
              <select value={playersIdx} onChange={(e) => setPlayersIdx(Number(e.target.value))} style={{ ...input, cursor: "pointer", background: "#fff" }}>
                {PLAYERS.map((p, i) => (<option key={p.label} value={i}>{p.label}</option>))}
              </select>
            </label>
            <label style={labelCol}>
              <span style={labelText}>Durée</span>
              <select value={durationIdx} onChange={(e) => setDurationIdx(Number(e.target.value))} style={{ ...input, cursor: "pointer", background: "#fff" }}>
                {DURATIONS.map((d, i) => (<option key={d.label} value={i}>{d.label}</option>))}
              </select>
            </label>
          </div>
        </section>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>{stepBadge(3, "#b8a7f0")}<h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Description</h2></div>
          <label style={labelCol}>
            <span style={labelText}>Présente ton jeu</span>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Raconte l'univers du jeu, son intérêt pédagogique, comment on y joue…" style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />
          </label>
        </section>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>{stepBadge(4, "#ff8a63")}<h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Fichier du jeu (PDF)</h2></div>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdf} style={{ display: "none" }} />
          {filePath ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#e9f6ee", border: "1.5px solid #c7e7d4", borderRadius: 16, padding: "16px 18px" }}>
              <span style={{ width: 44, height: 54, background: "#5fae82", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: ".72rem" }}>PDF</span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <strong style={{ fontSize: ".94rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileMeta?.name}</strong>
                <span style={{ fontSize: ".82rem", color: "#6f6557" }}>{fileMeta?.sizeMo ? `${fileMeta.sizeMo} · ` : ""}prêt à imprimer</span>
              </div>
              <button type="button" onClick={removePdf} style={{ border: "none", background: "none", cursor: "pointer", color: "#d6553a", fontWeight: 800, fontSize: ".86rem" }}>Retirer</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ border: "2px dashed #e2d7c3", background: "#fdf9f1", cursor: "pointer", borderRadius: 18, padding: "34px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "var(--font-nunito), sans-serif" }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff1dd", color: "#ff8a63", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>⬆</span>
              <strong style={{ color: "#36302a", fontSize: ".98rem" }}>{uploading ? "Envoi en cours…" : "Choisis ton PDF"}</strong>
              <span style={{ fontSize: ".84rem", color: "#9a8f7d" }}>PDF jusqu&apos;à 50 Mo, format imprimable A4</span>
            </button>
          )}
        </section>
      </div>

      {/* APERÇU + ACTIONS */}
      <aside style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 24, boxShadow: "0 12px 30px rgba(120,90,40,.08)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: ".78rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9a8f7d", marginBottom: 16 }}>● Aperçu en temps réel</span>
          <div style={{ background: "#fffdf8", border: "1px solid #f0e7d6", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "center", padding: 6 }}>
              <div style={{ width: 160 }}>
                <Disc color={color} colorLight={colorLight} icon={icon} size="160px" />
              </div>
            </div>
            <span style={{ alignSelf: "flex-start", background: colorLight, color: "#5a4a2e", fontWeight: 800, fontSize: ".72rem", padding: "5px 12px", borderRadius: 999 }}>{themeObj?.name ?? ""}</span>
            <h3 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.2rem", lineHeight: 1.2, color: title.trim() ? "#36302a" : "#c2b6a2" }}>{titleDisplay}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".84rem", color: "#8a8175" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#5fae82", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".66rem", fontWeight: 800 }}>{creatorName.charAt(0).toUpperCase()}</span>
              <span style={{ fontWeight: 600 }}>par {creatorName}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff1dd", color: "#c98a2e", fontWeight: 800, fontSize: ".72rem", padding: "4px 10px", borderRadius: 999 }}>✦ Nouveau</span>
              <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>{priceDisplay}</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
          {error && <p style={{ margin: 0, color: "#d6453f", fontSize: ".88rem", fontWeight: 700 }}>{error}</p>}
          <button type="button" onClick={() => save("pending")} disabled={saving || uploading} style={{ border: "none", cursor: "pointer", background: "#5fae82", color: "#fff", fontWeight: 800, fontSize: "1rem", padding: 15, borderRadius: 14, boxShadow: "0 10px 22px rgba(95,174,130,.35)", opacity: saving || uploading ? 0.7 : 1 }}>
            {saving ? "Enregistrement…" : "Soumettre pour validation"}
          </button>
          <button type="button" onClick={() => save("draft")} disabled={saving || uploading} style={{ border: "1.5px solid #efe5d3", cursor: "pointer", background: "#fff", color: "#36302a", fontWeight: 800, fontSize: ".95rem", padding: 14, borderRadius: 14, opacity: saving || uploading ? 0.7 : 1 }}>
            Enregistrer en brouillon
          </button>
          <Link href="/createur/dashboard" style={{ textAlign: "center", textDecoration: "none", color: "#9a8f7d", fontWeight: 800, fontSize: ".86rem" }}>Annuler</Link>
          <p style={{ margin: "4px 0 0", fontSize: ".8rem", color: "#9a8f7d", textAlign: "center", lineHeight: 1.5 }}>La validation prend env. 48 h. Tu peux modifier ton disque tant qu&apos;il est en brouillon.</p>
        </div>
      </aside>
    </div>
  );
}
