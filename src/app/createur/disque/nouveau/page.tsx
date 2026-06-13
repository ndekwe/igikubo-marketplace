import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import DiscEditor, { type EditorTheme } from "@/components/DiscEditor";
import { createClient } from "@/lib/supabase/server";

export default async function NouveauDisquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (profile?.role !== "creator") redirect("/");

  const { data: themes } = await supabase.from("themes").select("id,slug,name").order("name");

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role="createur" active="disques" />
      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "30px 24px 60px" }}>
        <div style={{ fontSize: ".86rem", color: "#9a8f7d", fontWeight: 600, marginBottom: 10 }}>
          <Link href="/createur/dashboard" style={{ color: "#9a8f7d", textDecoration: "none" }}>Tableau de bord</Link>
          &nbsp;›&nbsp;<span style={{ color: "#36302a" }}>Nouveau disque</span>
        </div>
        <h1 style={{ margin: "0 0 26px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.5rem)" }}>Créer un disque</h1>

        <DiscEditor themes={(themes ?? []) as EditorTheme[]} userId={user.id} creatorName={profile?.display_name ?? "Créateur"} />
      </main>
      <Footer />
    </div>
  );
}
