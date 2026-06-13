// Visuels par thème : couleur, couleur claire et glyphe du disque généré.
// Source unique pour les pastilles de filtre ET les emblèmes de disque,
// afin de garder l'identité visuelle de la maquette.
export type ThemeVisual = { color: string; colorLight: string; icon: string };

const VISUALS: Record<string, ThemeVisual> = {
  mathematiques: { color: "#5aa9f0", colorLight: "#cfe6fb", icon: "π" },
  histoire: { color: "#f0a860", colorLight: "#fbe6cd", icon: "H" },
  langues: { color: "#ff9e7d", colorLight: "#ffded2", icon: "L" },
  biologie: { color: "#7ec99a", colorLight: "#d6efe0", icon: "B" },
  informatique: { color: "#4fc6c0", colorLight: "#cdeeec", icon: "I" },
  anthropologie: { color: "#b8a7f0", colorLight: "#e8e2fb", icon: "A" },
  strategie: { color: "#e0a93a", colorLight: "#fff0c9", icon: "S" },
  hasard: { color: "#e07ec0", colorLight: "#fcdcf0", icon: "?" },
  "jeux-de-role": { color: "#a98ee0", colorLight: "#e4d9f7", icon: "R" },
};

const FALLBACK: ThemeVisual = { color: "#ff9e7d", colorLight: "#ffded2", icon: "◆" };

export function themeVisual(slug: string): ThemeVisual {
  return VISUALS[slug] ?? FALLBACK;
}
