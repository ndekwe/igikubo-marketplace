"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

function bigDisc(color: string, colorLight: string, icon: string): ReactNode {
  const wedge = `conic-gradient(from -22.5deg,${color} 0 45deg,${colorLight} 45deg 90deg,${color} 90deg 135deg,${colorLight} 135deg 180deg,${color} 180deg 225deg,${colorLight} 225deg 270deg,${color} 270deg 315deg,${colorLight} 0)`;
  return (
    <div
      style={{
        position: "relative",
        width: "78%",
        aspectRatio: "1",
        borderRadius: "50%",
        background: wedge,
        boxShadow: `inset 0 0 0 12px rgba(255,255,255,.6), inset 0 0 0 15px ${color}, 0 26px 50px ${color}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "spinslow 50s linear infinite",
      }}
    >
      <div style={{ width: "56%", height: "56%", background: "#fffdf8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 22px rgba(0,0,0,.12)" }}>
        <div
          style={{
            width: "72%",
            height: "72%",
            background: colorLight,
            clipPath: "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "var(--font-fredoka), sans-serif", fontWeight: 600, fontSize: "3rem", color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function placeholder(label: string): ReactNode {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 20,
        background: "repeating-linear-gradient(45deg,#eef0f3,#eef0f3 13px,#e6e9ee 13px,#e6e9ee 26px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: "'Courier New',monospace", fontSize: ".92rem", fontWeight: 700, color: "#8a93a3", background: "rgba(255,255,255,.8)", padding: "7px 14px", borderRadius: 8 }}>{label}</span>
    </div>
  );
}

function miniDisc(color: string, colorLight: string): ReactNode {
  const wedge = `conic-gradient(from -22.5deg,${color} 0 45deg,${colorLight} 45deg 90deg,${color} 90deg 135deg,${colorLight} 135deg 180deg,${color} 180deg 225deg,${colorLight} 225deg 270deg,${color} 270deg 315deg,${colorLight} 0)`;
  return <div style={{ width: "62%", aspectRatio: "1", borderRadius: "50%", background: wedge, boxShadow: "inset 0 0 0 4px rgba(255,255,255,.6)" }} />;
}

export default function ProductGallery({
  color,
  colorLight,
  icon,
  theme,
}: {
  color: string;
  colorLight: string;
  icon: string;
  theme: string;
}) {
  const [view, setView] = useState(0);

  const views: ReactNode[] = [
    bigDisc(color, colorLight, icon),
    placeholder("photo · le plateau"),
    placeholder("photo · la boîte"),
    placeholder("photo · une partie"),
  ];
  const thumbNodes: ReactNode[] = [miniDisc(color, colorLight), "plateau", "boîte", "partie"];

  const heroBg = `linear-gradient(160deg, ${colorLight}, ${colorLight})`;

  return (
    <div style={{ flex: "1 1 420px", minWidth: 300, display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 130 }}>
      <div
        style={{
          position: "relative",
          background: heroBg,
          borderRadius: 30,
          padding: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "1",
          overflow: "hidden",
        }}
      >
        <span style={{ position: "absolute", top: 22, left: 22, background: "#fff", color, fontWeight: 800, fontSize: ".8rem", padding: "7px 14px", borderRadius: 999 }}>{theme}</span>
        {views[view]}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {thumbNodes.map((node, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setView(i)}
            style={{
              width: 72,
              height: 72,
              cursor: "pointer",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: i === 0 ? heroBg : "repeating-linear-gradient(45deg,#eef0f3,#eef0f3 8px,#e6e9ee 8px,#e6e9ee 16px)",
              border: view === i ? `2.5px solid ${color}` : "2.5px solid transparent",
            }}
          >
            {typeof node === "string" ? (
              <span style={{ fontFamily: "'Courier New',monospace", fontSize: ".68rem", fontWeight: 700, color: "#8a93a3" } as CSSProperties}>{node}</span>
            ) : (
              node
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
