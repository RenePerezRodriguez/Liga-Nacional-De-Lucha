import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SponsorsSection } from "@/components/sponsors";
import { SocialFab } from "@/components/social-fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Liga Nacional de Lucha | Bolivia",
    template: "%s | LNL Bolivia"
  },
  description: "El sitio oficial de la Liga Nacional de Lucha de Bolivia. Eventos, noticias y el mejor wrestling del país. La Paz, Santa Cruz, Cochabamba.",
  keywords: ["lucha libre", "wrestling", "Bolivia", "LNL", "eventos", "luchadores", "Cochabamba", "La Paz", "Santa Cruz"],
  authors: [{ name: "Liga Nacional de Lucha Bolivia" }],
  creator: "Liga Nacional de Lucha Bolivia",
  metadataBase: new URL("https://luchalibrebolivia.com"),
  openGraph: {
    type: "website",
    locale: "es_BO",
    siteName: "Liga Nacional de Lucha Bolivia",
    title: "Liga Nacional de Lucha | Bolivia",
    description: "El sitio oficial de la Liga Nacional de Lucha de Bolivia. Eventos, noticias y el mejor wrestling del país.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liga Nacional de Lucha | Bolivia",
    description: "El sitio oficial de la Liga Nacional de Lucha de Bolivia.",
  },
  manifest: "/manifest.json",
  themeColor: "#DC2626",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow pt-28">
          {children}
        </main>
        <SponsorsSection />
        <Footer />
        <SocialFab />
      </body>
    </html>
  );
}
