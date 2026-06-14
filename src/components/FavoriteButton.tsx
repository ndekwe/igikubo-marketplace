"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Bouton cœur : ajoute/retire un disque des favoris du joueur connecté.
export default function FavoriteButton({
  discId,
  userId,
  initialFavorited,
}: {
  discId: string;
  userId: string | null;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [fav, setFav] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!userId) {
      router.push("/connexion");
      return;
    }
    setBusy(true);
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("disc_id", discId);
      setFav(false);
    } else {
      await supabase.from("favorites").upsert({ user_id: userId, disc_id: discId });
      setFav(true);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: busy ? "default" : "pointer",
        background: fav ? "#fdeef2" : "#fff",
        border: `1.5px solid ${fav ? "#ffb3c5" : "#efe5d3"}`,
        color: fav ? "#ff6b8a" : "#6f6557",
        fontFamily: "var(--font-nunito), sans-serif",
        fontWeight: 800,
        fontSize: ".92rem",
        padding: "11px 20px",
        borderRadius: 999,
        transition: "all .18s ease",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>{fav ? "♥" : "♡"}</span>
      {fav ? "Dans tes favoris" : "Ajouter aux favoris"}
    </button>
  );
}
