import { redirect } from "next/navigation";

// Pas encore de page d'accueil marketing : on redirige vers le catalogue.
// TODO : implémenter la vraie page Accueil (design Accueil.dc.html).
export default function Home() {
  redirect("/catalogue");
}
