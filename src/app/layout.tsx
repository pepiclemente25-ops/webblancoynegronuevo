import type { Metadata } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const TITULO = "Blanco y Negro - Terapias Holísticas y Bienestar";

export async function generateMetadata(): Promise<Metadata> {
  // Solo blanconegro.es se indexa; cualquier otra dirección (p. ej. *.workers.dev) lleva noindex para no duplicar contenido
  const host = ((await headers()).get("host") || "").toLowerCase();
  const esDominioPrincipal = host === "blanconegro.es" || host === "www.blanconegro.es";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITULO, template: "%s | Blanco y Negro" },
    description:
      "Espacio de sanación y bienestar integral: Quiromasaje terapéutico, Reiki Usui, Registros Akáshicos, Respiración consciente, talleres y armonización energética.",
    keywords: [
      "quiromasaje",
      "reiki",
      "registros akashicos",
      "respiracion consciente",
      "terapias holisticas",
      "armonizacion energetica",
      "aromaterapia",
      "bienestar",
    ],
    alternates: { canonical: "/" },
    robots: esDominioPrincipal ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: TITULO,
      description: "Reconecta con tu equilibrio natural: Quiromasaje, Reiki, Registros Akáshicos y Bienestar Holístico.",
      type: "website",
      locale: "es_ES",
      url: SITE_URL,
      siteName: "Blanco y Negro",
      images: [{ url: "/icon.png", width: 192, height: 192, alt: "Blanco y Negro" }],
    },
    twitter: { card: "summary", title: TITULO },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: "/icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#fbf9f5] text-[#212924] selection:bg-[#4a6b5d]/20 selection:text-[#2d473b]">
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingContactButtons />
        </CartProvider>
      </body>
    </html>
  );
}
