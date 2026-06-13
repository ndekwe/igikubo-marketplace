import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Dev local : charge le .env central du workspace jarvis-starter-kit (3 niveaux au-dessus).
// dotenv n'écrase pas les variables déjà définies, donc en production (Netlify)
// ce sont les variables réglées dans l'UI qui priment ; ce fichier n'y existe pas.
loadEnv({ path: resolve(process.cwd(), "../../../.env") });

const nextConfig: NextConfig = {};

export default nextConfig;
