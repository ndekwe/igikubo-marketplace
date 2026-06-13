import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

// Polices du design Igikubo : Fredoka (titres) + Nunito (texte courant).
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Igikubo Marketplace",
  description:
    "Des centaines de jeux pour un seul plateau octogonal. La place de marché des disques Igikubo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${nunito.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
