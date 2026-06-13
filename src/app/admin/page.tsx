import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { themeVisual } from "@/lib/theme-visuals";
import ModerationList, { type ModItem } from "@/components/ModerationList";

const CREATOR_COLORS = ["#5aa9f0", "#7ec99a", "#b8a7f0", "#ff8a63", "#e0a93a"];

type PendingRow = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  age_min: number | null;
  players_min: number | null;
  players_max: number | null;
  duration_min: number | null;
  file_path: string | null;
  created_at: string;
  theme: { slug: string; name: string } | null;
  creator: { id: string; display_name: string | null } | null;
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hier" : `il y a ${d} j`;
}

function playersLabel(min: number | null, max: number | null) {
  if (!min) return "—";
  if (min === 1 && max === 1) return "Solo";
  return max && max !== min ? `${min} – ${max}` : `${min}+`;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: me } = await supabase.from("profiles").select("is_admin, display_name").eq("id", user.id).single();
  if (!me?.is_admin) redirect("/");

  const { data } = await supabase
    .from("discs")
    .select("id,title,description,price_cents,age_min,players_min,players_max,duration_min,file_path,created_at, theme:themes(slug,name), creator:profiles!discs_creator_id_fkey(id,display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as PendingRow[];

  // Stats par créateur (disques publiés + note moyenne)
  const creatorIds = [...new Set(rows.map((r) => r.creator?.id).filter(Boolean))] as string[];
  const statByCreator = new Map<string, string>();
  if (creatorIds.length) {
    const { data: pub } = await supabase
      .from("discs")
      .select("creator_id, reviews(rating)")
      .in("creator_id", creatorIds)
      .eq("status", "published");
    const acc = new Map<string, { discs: number; sum: number; n: number }>();
    ((pub ?? []) as unknown as { creator_id: string; reviews: { rating: number }[] }[]).forEach((d) => {
      const a = acc.get(d.creator_id) ?? { discs: 0, sum: 0, n: 0 };
      a.discs += 1;
      (d.reviews ?? []).forEach((r) => { a.sum += r.rating; a.n += 1; });
      acc.set(d.creator_id, a);
    });
    acc.forEach((a, id) => {
      const note = a.n ? `${(a.sum / a.n).toFixed(1).replace(".", ",")}★` : "nouveau";
      statByCreator.set(id, `${a.discs} disque${a.discs > 1 ? "s" : ""} · ${note}`);
    });
  }

  // URL signées pour les PDF privés
  const items: ModItem[] = await Promise.all(
    rows.map(async (r, i) => {
      const v = themeVisual(r.theme?.slug ?? "");
      let pdfUrl: string | null = null;
      if (r.file_path) {
        const { data: signed } = await supabase.storage.from("disc-files").createSignedUrl(r.file_path, 3600);
        pdfUrl = signed?.signedUrl ?? null;
      }
      const creatorName = r.creator?.display_name ?? "Créateur";
      return {
        id: r.id,
        title: r.title,
        theme: r.theme?.name ?? "",
        color: v.color,
        colorLight: v.colorLight,
        icon: v.icon,
        submitted: relativeTime(r.created_at),
        creator: creatorName,
        creatorInitial: creatorName.charAt(0).toUpperCase(),
        creatorColor: CREATOR_COLORS[i % CREATOR_COLORS.length],
        creatorStat: (r.creator?.id && statByCreator.get(r.creator.id)) || "nouveau créateur",
        desc: r.description ?? "",
        price: (r.price_cents / 100).toFixed(2).replace(".", ",") + " €",
        age: r.age_min ? `${r.age_min} ans +` : "—",
        players: playersLabel(r.players_min, r.players_max),
        duration: r.duration_min ? `${r.duration_min} min` : "—",
        fileInfo: r.file_path ? "PDF" : "Sans PDF",
        pdfUrl,
      };
    })
  );

  const adminInitials = (me.display_name ?? "Admin").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ background: "#fff9ef", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barre admin */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#2f2a24", color: "#fff", fontFamily: "var(--font-nunito), sans-serif" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 38, height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ff8a63", clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#fffdf7", boxShadow: "inset 0 0 0 3px #ffce5c" }} />
            </span>
            <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "1.15rem" }}>Igikubo <span style={{ color: "#ffb38f" }}>Admin</span></span>
          </span>
          <nav style={{ display: "flex", gap: 4, marginLeft: 14 }}>
            <span style={{ color: "#fff", background: "rgba(255,255,255,.12)", fontWeight: 700, fontSize: ".88rem", padding: "8px 15px", borderRadius: 999 }}>Modération</span>
          </nav>
          <div style={{ flex: 1 }} />
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#7ec99a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: ".9rem" }}>{adminInitials}</span>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "36px 24px 60px" }}>
        <ModerationList initialItems={items} />
      </main>
    </div>
  );
}
