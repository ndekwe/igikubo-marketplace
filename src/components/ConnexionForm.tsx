"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot" | "verify";
type Profile = "joueur" | "createur";

const PANELS: Record<Mode, [string, string]> = {
  login: ["Content de te revoir !", "Retrouve tes disques, ton panier et tes créateurs préférés."],
  signup: ["Rejoins la communauté", "Un seul plateau, des centaines de jeux. Crée ton compte joueur ou créateur en quelques secondes."],
  forgot: ["On va arranger ça", "Réinitialise ton mot de passe en un clic et reviens jouer."],
  verify: ["Presque fini !", "Encore une étape : confirme ton adresse e-mail pour activer ton compte."],
};

const field: CSSProperties = {
  border: "1.5px solid #ece2d0",
  borderRadius: 14,
  padding: "13px 16px",
  fontFamily: "var(--font-nunito), sans-serif",
  fontSize: ".96rem",
  color: "#36302a",
  outline: "none",
};
const fieldLabel: CSSProperties = { display: "flex", flexDirection: "column", gap: 7 };
const fieldLabelText: CSSProperties = { fontWeight: 700, fontSize: ".88rem", color: "#5f5648" };

export default function ConnexionForm() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [profile, setProfile] = useState<Profile>("joueur");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isAuth = isLogin || isSignup;
  const accent = profile === "joueur" ? "#ff8a63" : "#5fae82";

  const [panelTitle, panelText] = PANELS[mode];

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Connexion Google indisponible (le fournisseur doit être activé dans Supabase).");
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: profile === "createur" ? "creator" : "player", display_name: name || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMode("verify");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.refresh();
        router.push("/catalogue");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/connexion`,
      });
      if (error) throw error;
      setMode("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const tabBase: CSSProperties = {
    flex: 1,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-nunito), sans-serif",
    fontWeight: 800,
    fontSize: ".94rem",
    padding: 11,
    borderRadius: 999,
    transition: "all .2s ease",
  };
  const tabOn: CSSProperties = { ...tabBase, background: "#fff", color: "#36302a", boxShadow: "0 6px 14px rgba(120,90,40,.12)" };
  const tabOff: CSSProperties = { ...tabBase, background: "transparent", color: "#9a8f7d" };

  const cardBase: CSSProperties = {
    flex: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 11,
    textAlign: "left",
    background: "#fff",
    borderRadius: 18,
    padding: "14px 15px",
    fontFamily: "var(--font-nunito), sans-serif",
    transition: "all .18s ease",
  };
  const roleCard = (selected: boolean, c: string): CSSProperties =>
    selected ? { ...cardBase, border: `2px solid ${c}`, boxShadow: `0 8px 18px ${c}33` } : { ...cardBase, border: "2px solid #efe5d3" };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 980,
        background: "#fff",
        border: "1px solid #f0e7d6",
        borderRadius: 34,
        overflow: "hidden",
        display: "flex",
        flexWrap: "wrap",
        boxShadow: "0 30px 70px rgba(120,90,40,.13)",
      }}
    >
      {/* Panneau de marque */}
      <div
        style={{
          position: "relative",
          flex: "1 1 360px",
          minWidth: 300,
          background: "linear-gradient(160deg,#ff9e7d,#ffce5c)",
          padding: "48px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 30,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -70,
            right: -50,
            width: 230,
            height: 230,
            clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
            background: "rgba(255,255,255,.16)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18, color: "#fff" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>
            <span
              style={{
                width: 38,
                height: 38,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff8a63", boxShadow: "inset 0 0 0 3px #ffce5c" }} />
            </span>
            Igikubo
          </span>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "2rem", lineHeight: 1.12 }}>{panelTitle}</h2>
          <p style={{ margin: 0, fontSize: "1.04rem", lineHeight: 1.6, color: "rgba(255,255,255,.92)" }}>{panelText}</p>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              background:
                "conic-gradient(from -22.5deg,#fff 0 45deg,#fff1dd 45deg 90deg,#fff 90deg 135deg,#fff1dd 135deg 180deg,#fff 180deg 225deg,#fff1dd 225deg 270deg,#fff 270deg 315deg,#fff1dd 0)",
              boxShadow: "inset 0 0 0 8px rgba(255,255,255,.5),0 16px 30px rgba(0,0,0,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "spinslow 40s linear infinite",
            }}
          >
            <span
              style={{
                width: "52%",
                height: "52%",
                background: "#ff8a63",
                clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-fredoka), sans-serif",
                fontWeight: 600,
                fontSize: "1.6rem",
                color: "#fff",
              }}
            >
              i
            </span>
          </div>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div id="inscription" style={{ flex: "1 1 400px", minWidth: 300, padding: "42px clamp(28px,4vw,46px)", display: "flex", flexDirection: "column", gap: 20 }}>
        {isAuth && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", background: "#fbf4e8", borderRadius: 999, padding: 5, gap: 4 }}>
              <button type="button" onClick={() => setMode("login")} style={isLogin ? tabOn : tabOff}>Connexion</button>
              <button type="button" onClick={() => setMode("signup")} style={isSignup ? tabOn : tabOff}>Inscription</button>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 11,
                cursor: "pointer",
                background: "#fff",
                border: "1.5px solid #ece2d0",
                borderRadius: 14,
                padding: 13,
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 800,
                color: "#36302a",
                fontSize: ".95rem",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "conic-gradient(#ea4335 0 25%,#fbbc05 25% 50%,#34a853 50% 75%,#4285f4 75% 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />
              </span>
              Continuer avec Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#b3a892", fontSize: ".8rem", fontWeight: 700 }}>
              <span style={{ flex: 1, height: 1, background: "#ece2d0" }} />
              ou avec ton e-mail
              <span style={{ flex: 1, height: 1, background: "#ece2d0" }} />
            </div>

            {isSignup && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: ".82rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#9a8f7d" }}>
                  Je m&apos;inscris en tant que
                </span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" onClick={() => setProfile("joueur")} style={roleCard(profile === "joueur", "#ff9e7d")}>
                    <span style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: "50%", background: "#ff9e7d", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>♟</span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, lineHeight: 1.2 }}>
                      <strong style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1rem" }}>Joueur</strong>
                      <span style={{ fontSize: ".78rem", color: "#8a8175" }}>J&apos;achète des disques</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => setProfile("createur")} style={roleCard(profile === "createur", "#7ec99a")}>
                    <span style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: "50%", background: "#7ec99a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>✦</span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, lineHeight: 1.2 }}>
                      <strong style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1rem" }}>Créateur</strong>
                      <span style={{ fontSize: ".78rem", color: "#8a8175" }}>Je vends mes disques</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isSignup && (
                <label style={fieldLabel}>
                  <span style={fieldLabelText}>Nom complet</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Imena Rugamba" style={field} />
                </label>
              )}
              <label style={fieldLabel}>
                <span style={fieldLabelText}>Adresse e-mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bonjour@exemple.com" style={field} />
              </label>
              <label style={fieldLabel}>
                <span style={fieldLabelText}>Mot de passe</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={field} />
              </label>
            </div>

            {isLogin && (
              <button type="button" onClick={() => setMode("forgot")} style={{ alignSelf: "flex-end", border: "none", background: "none", cursor: "pointer", color: "#ff8a63", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: ".86rem", marginTop: -4 }}>
                Mot de passe oublié ?
              </button>
            )}

            {error && <p style={{ margin: 0, color: "#d6453f", fontSize: ".88rem", fontWeight: 700 }}>{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                border: "none",
                cursor: loading ? "default" : "pointer",
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 800,
                fontSize: "1.02rem",
                padding: 15,
                borderRadius: 999,
                color: "#fff",
                background: accent,
                boxShadow: `0 12px 24px ${accent}55`,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Un instant…" : isLogin ? "Se connecter" : profile === "joueur" ? "Créer mon compte joueur" : "Créer mon compte créateur"}
            </button>

            <p style={{ margin: 0, textAlign: "center", fontSize: ".88rem", color: "#8a8175" }}>
              {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
              <button type="button" onClick={() => setMode(isLogin ? "signup" : "login")} style={{ border: "none", background: "none", cursor: "pointer", color: "#ff8a63", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: ".88rem" }}>
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        )}

        {mode === "forgot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <button type="button" onClick={() => setMode("login")} style={{ alignSelf: "flex-start", border: "none", background: "none", cursor: "pointer", color: "#9a8f7d", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: ".88rem" }}>
              ← Retour à la connexion
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.6rem" }}>Mot de passe oublié ?</h2>
              <p style={{ margin: 0, color: "#6f6557", lineHeight: 1.6 }}>Pas de panique. Indique ton e-mail et on t&apos;envoie un lien pour en créer un nouveau.</p>
            </div>
            <label style={fieldLabel}>
              <span style={fieldLabelText}>Adresse e-mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bonjour@exemple.com" style={field} />
            </label>
            {error && <p style={{ margin: 0, color: "#d6453f", fontSize: ".88rem", fontWeight: 700 }}>{error}</p>}
            <button type="button" onClick={handleForgot} disabled={loading} style={{ border: "none", cursor: "pointer", background: "#ff8a63", color: "#fff", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "1.02rem", padding: 15, borderRadius: 999, boxShadow: "0 12px 24px rgba(255,138,99,.4)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </div>
        )}

        {mode === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18, padding: "14px 0" }}>
            <div
              style={{
                position: "relative",
                width: 104,
                height: 104,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff1dd",
                clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
                animation: "floaty 3.5s ease-in-out infinite",
              }}
            >
              <span style={{ fontSize: "2.4rem" }}>✉️</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.6rem" }}>Vérifie ton e-mail</h2>
              <p style={{ margin: 0, color: "#6f6557", lineHeight: 1.6 }}>
                On vient d&apos;envoyer un lien à <strong style={{ color: "#36302a" }}>{email || "ton adresse"}</strong>. Clique dessus pour continuer.
              </p>
            </div>
            <button type="button" onClick={() => setMode("login")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9a8f7d", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: ".86rem" }}>
              ← Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
