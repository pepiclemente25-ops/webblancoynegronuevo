import type { Metadata } from "next";
import { headers } from "next/headers";
import { SITE_URL, MOSTRAR_AVISO_PRUEBAS } from "@/lib/site";
import { AvisoPruebas } from "@/components/AvisoPruebas";
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

const TITULO = "Blanco Negro - Terapias Holísticas y Bienestar";

export async function generateMetadata(): Promise<Metadata> {
  // Solo blanconegro.es se indexa; cualquier otra dirección (p. ej. *.workers.dev) lleva noindex para no duplicar contenido
  const host = ((await headers()).get("host") || "").toLowerCase();
  const esDominioPrincipal = host === "blanconegro.es" || host === "www.blanconegro.es";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITULO, template: "%s | Blanco Negro" },
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
      siteName: "Blanco Negro",
      images: [{ url: "/og-blanco-negro-v2.jpg", width: 1200, height: 630, alt: "Fachada de la tienda Blanco Negro en Boiro" }],
    },
    twitter: { card: "summary_large_image", title: TITULO, images: ["/og-blanco-negro-v2.jpg"] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}>
      <body data-aviso={MOSTRAR_AVISO_PRUEBAS ? "1" : undefined} className="min-h-full flex flex-col font-sans bg-[#f7fbef] text-[#212924] selection:bg-[#2f9a3b]/20 selection:text-[#237a2d]">
        <AvisoPruebas />
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingContactButtons />
        </CartProvider>
      </body>
    </html>
  );
}
