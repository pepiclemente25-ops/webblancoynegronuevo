"use client";

import React from "react";
import { Review, SiteConfig, WebSectionItem } from "@/types/content";
import { Star, ShieldCheck, Quote, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";

interface ReviewsSectionProps {
  reviews: Review[];
  config: SiteConfig;
  section?: WebSectionItem;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, config, section }) => {
  const lema = section?.contenido?.badge || section?.contenido?.lema || "Experiencias Reales de Pacientes";
  const titulo = section?.contenido?.tituloSeccion || section?.contenido?.titulo || section?.titulo || "Lo que Sienten Quienes nos Visitan";
  const descripcion = section?.contenido?.descripcion || section?.subtitulo || "La mayor satisfacción es ver cómo las personas entran con tensión y salen respirando con ligereza y serenidad.";
  const puntuacionMedia = section?.contenido?.puntuacionMedia || "5.0";
  const textoCalificacion = section?.contenido?.textoCalificacion || `${puntuacionMedia} de 5 estrellas en Google Reseñas`;
  const mostrarPuntuacionMedia = section?.contenido?.mostrarPuntuacionMedia !== false;
  const rawReviews = (section?.contenido?.items && Array.isArray(section.contenido.items) && section.contenido.items.length > 0)
    ? section.contenido.items
    : reviews;

  const displayReviews: Review[] = rawReviews.map((rev: any, idx: number) => ({
    id: rev.id || `rev-${idx}`,
    author: rev.author || rev.autor || "Paciente de Blanco y Negro",
    service: rev.service || rev.servicio || "Terapia Holística",
    rating: Number(rev.rating) || 5,
    text: rev.text || rev.texto || "",
    date: rev.date || rev.fecha || "Reciente",
    verified: rev.verified !== undefined ? rev.verified : true,
  }));

  const googleReviewsUrl = section?.contenido?.googleReviewsUrl || config.googleReviewsUrl;
  const botonTexto = section?.contenido?.botonTexto || "Ver perfil y reseñas en Google Maps";

  return (
    <section id="resenas" className="py-24 bg-[#fbf9f5] border-t border-[#ece4d8] relative overflow-hidden">
      {/* Rama de hojas de bambú decorativa */}
      <div className="absolute top-0 left-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-left.webp"
          alt=""
          fill
          className="object-contain object-left-top"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed mb-6">
            {descripcion}
          </p>

          {/* Calificación Global */}
          {mostrarPuntuacionMedia && (
            <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-[#ece4d8] shadow-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#212924]">
                {textoCalificacion}
              </span>
            </div>
          )}
        </div>

        {/* Cuadrícula de Reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e1d5] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div>
                {/* Estrellas y Fecha */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#78887e] font-medium">{rev.date}</span>
                </div>

                {/* Texto del testimonio */}
                <div className="relative mb-6">
                  <Quote className="w-7 h-7 text-[#ece4d8] absolute -top-3 -left-2 -z-0" />
                  <p className="text-xs sm:text-sm text-[#47574d] leading-relaxed relative z-10 italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>
              </div>

              {/* Autor y Servicio */}
              <div className="pt-4 border-t border-[#f0ebe1] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#212924]">{rev.author}</span>
                    {rev.verified && (
                      <span title="Cita verificada">
                        <ShieldCheck className="w-4 h-4 text-[#3d5a4c]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#3d5a4c] font-medium block">
                    {rev.service}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f4f0e8] text-[#3d5a4c] flex items-center justify-center font-serif font-bold text-xs">
                  {rev.author[0]}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Enlace para dejar o ver reseñas en Google */}
        <div className="text-center">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#cbdbd0] text-[#3d5a4c] font-semibold text-xs sm:text-sm hover:bg-[#f0ebe1] transition-colors shadow-xs"
          >
            <span>{botonTexto}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
