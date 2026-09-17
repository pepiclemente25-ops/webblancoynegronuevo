import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Blanco y Negro - Terapias Holísticas y Bienestar",
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
  openGraph: {
    title: "Blanco y Negro - Terapias Holísticas y Bienestar",
    description: "Reconecta con tu equilibrio natural: Quiromasaje, Reiki, Registros Akáshicos y Bienestar Holístico.",
    type: "website",
    locale: "es_ES",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.png",
  },
};

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
