import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, is_admin, created_at")
    .eq("id", user.id)
    .single();

  const [{ count: achats }, { count: favoris }, { count: avis }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", user.id).eq("status", "paid"),
    supabase.from("favorites").select("disc_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("buyer_id", user.id),
  ]);

  const isCreator = profile?.role === "creator";
  const name = profile?.display_name || user.email?.split("@")[0] || "Mon compte";
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const accent = isCreator ? "#5fae82" : "#ff8a63";
  const member = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  const statBox = (value: number, label: string, color: string) => (
    <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: 3, padding: 12, borderRadius: 16, background: "#fdf6ec" }}>
      <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.6rem", color }}>{value}</span>
      <span style={{ fontSize: ".82rem", color: "#6f6557", fontWeight: 700 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role={isCreator ? "createur" : "joueur"} active="" />
      <main style={{ flex: 1, maxWidth: 1080, width: "100%", margin: "0 auto", padding: "36px 24px 60px" }}>
        <h1 style={{ margin: "0 0 24px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.5rem)" }}>Mon profil</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, alignItems: "start" }}>
          {/* Carte identité */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 26, padding: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", boxShadow: "0 6px 18px rgba(120,90,40,.05)" }}>
              <span style={{ width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(150deg,${accent},${accent}cc)`, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "2.2rem", boxShadow: `0 12px 24px ${accent}59` }}>{initials}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <strong style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.3rem" }}>{name}</strong>
                <span style={{ color: "#8a8175", fontSize: ".9rem" }}>{user.email}</span>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: isCreator ? "#e9f6ee" : "#fdeede", color: isCreator ? "#3f9268" : "#d6553a", fontWeight: 800, fontSize: ".78rem", padding: "6px 14px", borderRadius: 999 }}>
                {isCreator ? "✦ Créateur" : "♟ Joueur"}{member ? ` · membre depuis ${member}` : ""}
              </span>
            </div>
            <div style={{ background: "#fff", border: "1px solid #f0e7d6", borderRadius: 26, padding: 24, display: "flex", gap: 10 }}>
              {statBox(achats ?? 0, "disques", "#5fae82")}
              {statBox(favoris ?? 0, "favoris", "#e07ec0")}
              {statBox(avis ?? 0, "avis", "#5aa9f0")}
            </div>
            {isCreator && (
              <Link href="/createur/dashboard" style={{ textAlign: "center", textDecoration: "none", background: "#5fae82", color: "#fff", fontWeight: 800, padding: "13px 20px", borderRadius: 999, boxShadow: "0 10px 22px rgba(95,174,130,.32)" }}>
                Aller à mon espace créateur
              </Link>
            )}
          </div>

          {/* Formulaire */}
          <ProfileForm userId={user.id} initialName={profile?.display_name ?? ""} email={user.email ?? ""} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
