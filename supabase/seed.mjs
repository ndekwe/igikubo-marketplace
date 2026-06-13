// Seed de données de démo pour Igikubo Marketplace.
// Crée un créateur, quelques joueurs, des disques publiés et des avis.
// Lance : node supabase/seed.mjs   (depuis la racine du projet)
// Idempotent : relançable sans dupliquer.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// --- Charge le .env central du workspace ---
const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), "../../../.env"), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

// Client admin (bypass RLS).
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// --- Crée ou retrouve un utilisateur par email ---
async function ensureUser(email, password, meta) {
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.users.find((u) => u.email === email);
  if (existing) return existing.id;
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function main() {
  // 1. Créateur démo
  const creatorId = await ensureUser("createur.demo@igikubo.fr", "Demo!Pass123", {
    role: "creator",
    display_name: "Atelier Imena",
  });
  await sb
    .from("profiles")
    .update({
      role: "creator",
      is_creator_approved: true,
      display_name: "Atelier Imena",
      bio: "Collectif de créateurs de jeux pédagogiques inspirés des Grands Lacs.",
    })
    .eq("id", creatorId);

  // 2. Joueurs démo (pour générer des avis variés)
  const buyerIds = [];
  for (let i = 1; i <= 4; i++) {
    const id = await ensureUser(`joueur${i}.demo@igikubo.fr`, "Demo!Pass123", {
      role: "player",
      display_name: `Joueur Démo ${i}`,
    });
    buyerIds.push(id);
  }

  // 3. Thèmes (slug -> id)
  const { data: themes } = await sb.from("themes").select("id,slug");
  const themeId = Object.fromEntries(themes.map((t) => [t.slug, t.id]));

  // 4. Disques
  const discs = [
    { slug: "les-fractales-de-kigali", title: "Les Fractales de Kigali", theme: "mathematiques", price: 1290, age: 8, pmin: 2, pmax: 4, dur: 30, desc: "Explore la géométrie des motifs africains en assemblant des fractales sur ton plateau." },
    { slug: "royaumes-des-grands-lacs", title: "Royaumes des Grands Lacs", theme: "histoire", price: 1450, age: 10, pmin: 2, pmax: 5, dur: 45, desc: "Reconstitue l'histoire des royaumes de la région des Grands Lacs, dynastie après dynastie." },
    { slug: "le-grand-jeu-des-langues", title: "Le Grand Jeu des Langues", theme: "langues", price: 990, age: 7, pmin: 2, pmax: 6, dur: 25, desc: "Apprends des mots dans plusieurs langues en jouant, du kinyarwanda au swahili." },
    { slug: "foret-vivante", title: "Forêt Vivante", theme: "biologie", price: 1150, age: 8, pmin: 2, pmax: 4, dur: 30, desc: "Découvre les écosystèmes et les chaînes alimentaires de la forêt tropicale." },
    { slug: "code-et-cosmos", title: "Code & Cosmos", theme: "informatique", price: 1300, age: 10, pmin: 1, pmax: 4, dur: 40, desc: "Initie-toi à la logique de programmation en guidant ta sonde à travers les étoiles." },
    { slug: "masques-et-rituels", title: "Masques & Rituels", theme: "anthropologie", price: 1550, age: 12, pmin: 3, pmax: 6, dur: 50, desc: "Plonge dans les traditions et les rites des cultures du monde." },
    { slug: "la-route-du-sel", title: "La Route du Sel", theme: "strategie", price: 1690, age: 10, pmin: 2, pmax: 4, dur: 45, desc: "Bâtis ton empire commercial le long des grandes routes caravanières." },
    { slug: "multiplions", title: "Multiplions !", theme: "mathematiques", price: 790, age: 6, pmin: 2, pmax: 4, dur: 20, desc: "Maîtrise les tables de multiplication dans une course endiablée." },
  ];

  const rows = discs.map((d) => ({
    creator_id: creatorId,
    title: d.title,
    slug: d.slug,
    description: d.desc,
    theme_id: themeId[d.theme],
    age_min: d.age,
    players_min: d.pmin,
    players_max: d.pmax,
    duration_min: d.dur,
    price_cents: d.price,
    status: "published",
  }));

  const { data: upserted, error: discErr } = await sb
    .from("discs")
    .upsert(rows, { onConflict: "slug" })
    .select("id,slug");
  if (discErr) throw new Error(`upsert discs: ${discErr.message}`);
  const discIdBySlug = Object.fromEntries(upserted.map((d) => [d.slug, d.id]));

  // 5. Avis (notes 4-5, nombre variable par disque)
  const comments = [
    "Mes enfants adorent, on y joue tous les week-ends !",
    "Très bien pensé, à la fois ludique et pédagogique.",
    "Impression nickel, règles claires. Je recommande.",
    "Un vrai coup de coeur, original et beau.",
    "Parfait pour apprendre en s'amusant.",
  ];
  const reviewRows = [];
  discs.forEach((d, idx) => {
    const nbReviews = 1 + ((idx + 1) % 4); // 1 à 4 avis
    for (let i = 0; i < nbReviews; i++) {
      reviewRows.push({
        disc_id: discIdBySlug[d.slug],
        buyer_id: buyerIds[i % buyerIds.length],
        rating: 4 + ((idx + i) % 2), // 4 ou 5
        comment: comments[(idx + i) % comments.length],
      });
    }
  });
  const { error: revErr } = await sb.from("reviews").upsert(reviewRows, { onConflict: "disc_id,buyer_id" });
  if (revErr) throw new Error(`upsert reviews: ${revErr.message}`);

  console.log(`OK. Créateur: 1, Joueurs: ${buyerIds.length}, Disques publiés: ${upserted.length}, Avis: ${reviewRows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
