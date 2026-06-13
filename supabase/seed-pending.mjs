// Seed de modération : promeut le créateur démo en admin et ajoute des disques "en attente".
// Lance : node supabase/seed-pending.mjs   (depuis la racine du projet)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), "../../../.env"), "utf8")
    .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const creator = list.users.find((u) => u.email === "createur.demo@igikubo.fr");
  if (!creator) throw new Error("Créateur démo introuvable, lance d'abord seed.mjs");

  // Promotion admin (compte démo)
  await sb.from("profiles").update({ is_admin: true }).eq("id", creator.id);

  const { data: themes } = await sb.from("themes").select("id,slug");
  const tid = Object.fromEntries(themes.map((t) => [t.slug, t.id]));

  const pending = [
    { slug: "geometrie-sacree", title: "Géométrie Sacrée", theme: "mathematiques", price: 1350, age: 8, pmin: 2, pmax: 4, dur: 30, desc: "Un jeu de construction géométrique inspiré des motifs imigongo, où l'on assemble des triangles pour révéler des symétries cachées." },
    { slug: "le-souffle-des-volcans", title: "Le Souffle des Volcans", theme: "biologie", price: 1190, age: 10, pmin: 2, pmax: 6, dur: 45, desc: "Découverte de l'écosystème des Virunga : chaîne alimentaire, biodiversité et conservation, en coopératif." },
  ];
  const rows = pending.map((d) => ({
    creator_id: creator.id, title: d.title, slug: d.slug, description: d.desc,
    theme_id: tid[d.theme], age_min: d.age, players_min: d.pmin, players_max: d.pmax,
    duration_min: d.dur, price_cents: d.price, status: "pending",
  }));
  const { data, error } = await sb.from("discs").upsert(rows, { onConflict: "slug" }).select("slug,status");
  if (error) throw error;

  console.log("Admin: createur.demo@igikubo.fr promu admin.");
  console.log("Disques en attente:", data.map((d) => d.slug).join(", "));
}
main().catch((e) => { console.error(e); process.exit(1); });
