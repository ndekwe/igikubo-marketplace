import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Déconnexion (POST depuis le Header), puis retour à l'accueil.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
