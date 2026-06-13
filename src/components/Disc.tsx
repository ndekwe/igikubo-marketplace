import type { CSSProperties } from "react";

type DiscProps = {
  color?: string;
  colorLight?: string;
  icon?: string;
  /** Taille CSS du disque (largeur). Par défaut 100% du conteneur. */
  size?: string;
  /** Anneau extérieur marqué (variante carte) ou discret (variante compacte). */
  ring?: boolean;
  className?: string;
};

// Disque Igikubo : roue à 8 secteurs (conic-gradient) + médaillon octogonal central.
export default function Disc({
  color = "#ff9e7d",
  colorLight = "#ffded2",
  icon = "◆",
  size = "100%",
  ring = true,
  className,
}: DiscProps) {
  const wedge = `conic-gradient(from -22.5deg, ${color} 0 45deg, ${colorLight} 45deg 90deg, ${color} 90deg 135deg, ${colorLight} 135deg 180deg, ${color} 180deg 225deg, ${colorLight} 225deg 270deg, ${color} 270deg 315deg, ${colorLight} 315deg 360deg)`;

  const outer: CSSProperties = {
    position: "relative",
    width: size,
    aspectRatio: "1",
    borderRadius: "50%",
    flex: "0 0 auto",
    background: wedge,
    boxShadow: ring
      ? `inset 0 0 0 7px rgba(255,255,255,.6), inset 0 0 0 9px ${color}, 0 14px 26px ${color}55`
      : `inset 0 0 0 4px rgba(255,255,255,.55)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Taille de glyphe proportionnelle quand une taille en px est fournie.
  const px = size.endsWith("px") ? parseFloat(size) : null;
  const iconFontSize = px ? `${Math.round(px * 0.28)}px` : "2rem";

  const inner: CSSProperties = {
    width: "58%",
    height: "58%",
    background: "#fffdf8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 16px rgba(0,0,0,.10)",
  };

  const octagon: CSSProperties = {
    width: "74%",
    height: "74%",
    background: colorLight,
    clipPath:
      "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className={className} style={outer}>
      <div style={inner}>
        <div style={octagon}>
          <span
            style={{
              fontFamily: "var(--font-fredoka), sans-serif",
              fontWeight: 600,
              fontSize: iconFontSize,
              color,
              lineHeight: 1,
            }}
          >
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
