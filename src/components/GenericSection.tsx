"use client";

import React, { useState } from "react";
import { WebSectionItem, SiteConfig } from "@/types/content";
import { Sparkles, ChevronDown, ArrowRight, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface GenericSectionProps {
  section: WebSectionItem;
  config: SiteConfig;
  onOpenBooking?: () => void;
}

export const GenericSection: React.FC<GenericSectionProps> = ({ section, config, onOpenBooking }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const c = section.contenido || {};
  const titulo = c.titulo || c.tituloSeccion || section.titulo || "Espacio Blanco y Negro";
  const subtitulo = c.subtitulo || c.descripcion || section.subtitulo || "";
  const badge = c.badge || c.lema || c.lemaSuperior || "Blanco y Negro";

  // Plantilla: BANNER
  if (section.tipoPlantilla === "banner") {
    const estilo = c.estilo || "info";
    const bgClass =
      estilo === "advertencia"
        ? "bg-amber-500 text-amber-950 border-amber-400"
        : estilo === "exito"
        ? "bg-[#3d5a4c] text-white border-[#2f483c]"
        : "bg-[#436354] text-white border-[#345042]";

    return (
      <div className={`py-6 px-4 sm:px-8 border-y text-center transition-colors relative z-20 ${bgClass}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {estilo === "advertencia" ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 flex-shrink-0 text-[#dfc89f]" />
            )}
            <p className="text-sm sm:text-base font-medium leading-snug">
              {c.mensaje || titulo}
            </p>
          </div>
          {c.botonTexto && (
            <a
              href={c.enlace || "#contacto"}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-[#212924] text-xs sm:text-sm font-bold shadow-sm hover:bg-[#f0ebe1] transition shrink-0"
            >
              <span>{c.botonTexto}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Plantilla: FAQ
  if (section.tipoPlantilla === "faq") {
    const faqs = (c.preguntas || c.items || c.faqs || []).map((item: any) => ({
      p: item.p || item.pregunta || item.q || "Pregunta frecuente",
      r: item.r || item.respuesta || item.a || "Respuesta...",
    }));

    return (
      <section className="py-20 bg-[#fbf9f5] border-t border-[#ece4d8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
              <span>{badge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1e2621] font-normal mb-3">{titulo}</h2>
            {subtitulo && <p className="text-sm sm:text-base text-[#5a6a60]">{subtitulo}</p>}
          </div>

          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-[#e8e1d5] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf7f2] transition"
                  >
                    <span className="font-medium text-sm sm:text-base text-[#212924]">{faq.p}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#3d5a4c] transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#55645a] leading-relaxed border-t border-[#f3efe8]">
                      {faq.r}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Plantilla: TARJETAS
  if (section.tipoPlantilla === "tarjetas") {
    const items = c.items || [];
    return (
      <section className="py-20 bg-[#fbf9f5] border-t border-[#ece4d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
              <span>{badge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1e2621] font-normal mb-3">{titulo}</h2>
            {subtitulo && <p className="text-sm sm:text-base text-[#5a6a60]">{subtitulo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((card: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e1d5] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#eaf0ec] text-[#3d5a4c] flex items-center justify-center font-serif font-bold text-base mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1e2621] mb-2">
                    {card.titulo || card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55645a] leading-relaxed">
                    {card.desc || card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Plantilla: TEXTO CON FOTO (o fallback general)
  const isFotoIzquierda = c.posicionFoto === "izquierda";
  const fotoUrl = c.fotoUrl || c.imageUrl || c.imagenUrl;

  return (
    <section className="py-24 bg-[#fbf9f5] border-t border-[#ece4d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${fotoUrl ? "lg:grid-cols-12" : ""} gap-12 items-center`}>
          {fotoUrl && isFotoIzquierda && (
            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-[#e8e1d5]">
              <Image
                src={fotoUrl}
                alt={titulo}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          )}

          <div className={fotoUrl ? "lg:col-span-7" : "max-w-3xl mx-auto text-center"}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
              <span>{badge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-xs sm:text-sm text-[#b5935b] font-medium tracking-wide uppercase mb-4">
                {subtitulo}
              </p>
            )}
            <div className="text-sm sm:text-base text-[#55645a] leading-relaxed whitespace-pre-line space-y-4">
              {c.texto || c.descripcion || "Contenido de la sección."}
            </div>

            {c.botonTexto && (
              <div className="mt-8">
                <a
                  href={c.enlace || "#contacto"}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3d5a4c] text-white text-xs sm:text-sm font-medium hover:bg-[#2c4238] transition shadow-sm"
                >
                  <span>{c.botonTexto}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {fotoUrl && !isFotoIzquierda && (
            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-[#e8e1d5]">
              <Image
                src={fotoUrl}
                alt={titulo}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
