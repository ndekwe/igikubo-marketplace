"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

const field: CSSProperties = { border: "1.5px solid #ece2d0", borderRadius: 14, padding: "12px 15px", fontSize: ".95rem", color: "#36302a", outline: "none", fontFamily: "var(--font-nunito), sans-serif" };
const labelCol: CSSProperties = { display: "flex", flexDirection: "column", gap: 7 };
const labelText: CSSProperties = { fontWeight: 700, fontSize: ".86rem", color: "#5f5648" };
const cardStyle: CSSProperties = { background: "#fff", border: "1px solid #f0e7d6", borderRadius: 26, padding: 30, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 6px 18px rgba(120,90,40,.05)" };

export default function ProfileForm({ userId, initialName, email }: { userId: string; initialName: string; email: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() || null }).eq("id", userId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    router.refresh();
  }

  async function changePassword() {
    setPwdMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/compte` });
    setPwdMsg(error ? "Erreur : " + error.message : "Lien envoyé ! Vérifie ta boîte mail.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Informations personnelles</h2>
        <label style={labelCol}>
          <span style={labelText}>Nom affiché</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom public" style={field} />
        </label>
        <label style={labelCol}>
          <span style={labelText}>E-mail</span>
          <input type="email" value={email} disabled style={{ ...field, background: "#f7f2e9", color: "#8a8175", cursor: "not-allowed" }} />
        </label>
        {error && <p style={{ margin: 0, color: "#d6453f", fontSize: ".88rem", fontWeight: 700 }}>{error}</p>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{ border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: ".95rem", padding: "13px 26px", borderRadius: 999, background: saved ? "#7ec99a" : "#ff8a63", boxShadow: saved ? "0 10px 20px rgba(126,201,154,.4)" : "0 10px 20px rgba(255,138,99,.35)", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>Sécurité</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong style={{ fontSize: ".96rem" }}>Mot de passe</strong>
            <span style={{ fontSize: ".84rem", color: "#8a8175" }}>On t&apos;envoie un lien sécurisé pour le changer.</span>
          </div>
          <button type="button" onClick={changePassword} style={{ border: "1.5px solid #efe5d3", background: "#fff", cursor: "pointer", color: "#36302a", fontWeight: 800, fontSize: ".86rem", padding: "10px 18px", borderRadius: 999, whiteSpace: "nowrap" }}>Changer</button>
        </div>
        {pwdMsg && <p style={{ margin: 0, color: pwdMsg.startsWith("Erreur") ? "#d6453f" : "#3f9268", fontSize: ".88rem", fontWeight: 700 }}>{pwdMsg}</p>}
      </section>
    </div>
  );
}
