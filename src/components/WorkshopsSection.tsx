"use client";

import React from "react";
import { Workshop, SiteConfig, WebSectionItem } from "@/types/content";
import { Calendar, Clock, MapPin, Users, Sparkles, Check, MessageCircle } from "lucide-react";
import Image from "next/image";

interface WorkshopsSectionProps {
  workshops: Workshop[];
  config: SiteConfig;
  section?: WebSectionItem;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({ workshops, config, section }) => {
  const lema = section?.contenido?.badge || section?.contenido?.lema || "Encuentros & Aprendizaje Compartido";
  const titulo = section?.contenido?.tituloSeccion || section?.contenido?.titulo || section?.titulo || "Talleres, Círculos y Charlas";
  const descripcion = section?.contenido?.descripcion || section?.subtitulo || "Espacios comunitarios donde profundizar en tu auto-sanación, aprender a canalizar energía y compartir con personas afines en un entorno seguro y amoroso.";
  const botonTexto = section?.contenido?.botonTexto || "Reservar Plaza por WhatsApp";
  const notaInscripcion = section?.contenido?.notaInscripcion || "Inscripción abierta hasta completar aforo.";

  const rawWorkshops = (section?.contenido?.items && Array.isArray(section.contenido.items) && section.contenido.items.length > 0)
    ? section.contenido.items
    : workshops;

  const displayWorkshops: Workshop[] = rawWorkshops.map((w: any, idx: number) => ({
    id: w.id || `ws-${idx}`,
    title: w.title || w.titulo || "Taller Vivencial",
    subtitle: w.subtitle || w.subtitulo || "",
    date: w.date || w.fecha || "Próximamente",
    time: w.time || w.hora || "Horario a convenir",
    modality: w.modality || w.modalidad || "Presencial",
    spots: w.spots || w.plazas || "Plazas limitadas",
    description: w.description || w.descripcion || "",
    includes: Array.isArray(w.includes)
      ? w.includes
      : (typeof w.includes === "string" ? w.includes.split("\n").map((s: string) => s.trim()).filter(Boolean) : []),
    imageUrl: w.imageUrl || w.imagenUrl || "/brand/taller-placeholder.webp"
  }));

  return (
    <section id="talleres" className="py-24 bg-[#fbf9f5] border-t border-[#ece4d8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed">
            {descripcion}
          </p>
        </div>

        {/* Lista de Talleres */}
        <div className="space-y-8">
          {displayWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-3xl border border-[#e8e1d5] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Imagen del taller */}
              <div className="relative h-64 lg:h-auto lg:col-span-4 overflow-hidden bg-[#ece4d8]">
                <Image
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-bold text-[#3d5a4c] shadow-sm">
                    {workshop.modality}
                  </span>
                </div>
              </div>

              {/* Contenido e información */}
              <div className="p-6 sm:p-8 lg:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Fila de metadatos (Fecha, hora, plazas) */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#5f7065] mb-3">
                    <span className="flex items-center gap-1.5 text-[#3d5a4c] font-semibold bg-[#eaf0ec] px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-[#3d5a4c]" />
                      {workshop.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#b5935b]" />
                      {workshop.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#b5935b]" />
                      {workshop.spots}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-[#1e2621] font-semibold mb-1">
                    {workshop.title}
                  </h3>
                  <p className="text-xs text-[#b5935b] font-medium tracking-wide uppercase mb-3">
                    {workshop.subtitle}
                  </p>
                  <p className="text-sm text-[#55645a] leading-relaxed mb-5">
                    {workshop.description}
                  </p>

                  {/* Qué incluye */}
                  <div className="bg-[#fbf9f5] p-4 rounded-2xl border border-[#efeae1] mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-2">
                      ¿Qué incluye el taller?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {workshop.includes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#445248]">
                          <Check className="w-3.5 h-3.5 text-[#3d5a4c] flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de inscripción */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#f0ebe1]">
                  <span className="text-xs text-[#6e7d73]">
                    {notaInscripcion}
                  </span>
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hola%20${encodeURIComponent(
                      config.name
                    )},%20quisiera%20reservar%20plaza%20para%20el%20"${encodeURIComponent(
                      workshop.title
                    )}"%20del%20${encodeURIComponent(workshop.date)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#3d5a4c] text-white text-xs sm:text-sm font-medium hover:bg-[#2c4238] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-[#dfc89f]" />
                    <span>{botonTexto}</span>
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
