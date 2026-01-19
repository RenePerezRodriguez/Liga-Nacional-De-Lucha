import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
};

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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              "name": "Liga Nacional de Lucha",
              "alternateName": "LNL Bolivia",
              "url": "https://luchalibrebolivia.com",
              "logo": "https://luchalibrebolivia.com/logo.png",
              "sameAs": [
                "https://facebook.com/lnlbolivia",
                "https://instagram.com/lnlbolivia",
                "https://tiktok.com/@lnlbolivia"
              ],
              "description": "La empresa de lucha libre profesional más importante de Bolivia."
            })
          }}
        />
      </body>
    </html>
  );
}
