import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import DiscEditor, { type EditorTheme, type EditorDisc } from "@/components/DiscEditor";
import { createClient } from "@/lib/supabase/server";

type DiscRow = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  age_min: number | null;
  players_min: number | null;
  players_max: number | null;
  duration_min: number | null;
  file_path: string | null;
  creator_id: string;
  theme: { slug: string } | null;
};

export default async function ModifierDisquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (profile?.role !== "creator") redirect("/");

  const { data } = await supabase
    .from("discs")
    .select("id,title,description,price_cents,age_min,players_min,players_max,duration_min,file_path,creator_id, theme:themes(slug)")
    .eq("id", id)
    .maybeSingle();

  const row = data as unknown as DiscRow | null;
  if (!row || row.creator_id !== user.id) redirect("/createur/dashboard");

  const { data: themes } = await supabase.from("themes").select("id,slug,name").order("name");

  const disc: EditorDisc = {
    id: row.id,
    title: row.title,
    themeSlug: row.theme?.slug ?? "mathematiques",
    symbol: "",
    priceLabel: (row.price_cents / 100).toFixed(2).replace(".", ","),
    ageMin: row.age_min,
    playersMin: row.players_min,
    playersMax: row.players_max,
    durationMin: row.duration_min,
    description: row.description ?? "",
    filePath: row.file_path,
  };

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader role="createur" active="disques" />
      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "30px 24px 60px" }}>
        <div style={{ fontSize: ".86rem", color: "#9a8f7d", fontWeight: 600, marginBottom: 10 }}>
          <Link href="/createur/dashboard" style={{ color: "#9a8f7d", textDecoration: "none" }}>Tableau de bord</Link>
          &nbsp;›&nbsp;<span style={{ color: "#36302a" }}>Modifier le disque</span>
        </div>
        <h1 style={{ margin: "0 0 26px", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.5rem)" }}>Modifier un disque</h1>

        <DiscEditor themes={(themes ?? []) as EditorTheme[]} userId={user.id} creatorName={profile?.display_name ?? "Créateur"} disc={disc} />
      </main>
      <Footer />
    </div>
  );
}
