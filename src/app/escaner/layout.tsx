import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Escáner Móvil y Catalogación | Blanco y Negro TPV",
  description: "Terminal móvil para inventario y catalogación rápida de artículos con cámara y OCR.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function EscanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {children}
    </div>
  );
}
