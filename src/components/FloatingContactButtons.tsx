"use client";

import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";

interface FloatingContactButtonsProps {
  whatsapp?: string;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({ whatsapp }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : "34600123456";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "Hola, quisiera consultar información sobre Blanco y Negro."
  )}`;
  const citaUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "Hola, deseo agendar una cita en Blanco y Negro."
  )}`;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      {/* Botón Sobre (Agendar Cita) */}
      <a
        href={citaUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Agendar cita por WhatsApp"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#3d5a4c] text-white shadow-lg hover:bg-[#2d473b] hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-[#dfc89f]/40"
      >
        <span className="absolute right-14 whitespace-nowrap bg-[#212924] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none border border-white/10">
          Agendar Cita
        </span>
        <Mail className="w-5 h-5 text-[#dfc89f]" />
      </a>

      {/* Botón WhatsApp Flotante */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <span className="absolute right-16 whitespace-nowrap bg-[#212924] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none border border-white/10">
          WhatsApp Directo
        </span>
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
};
