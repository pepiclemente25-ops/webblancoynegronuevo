"use client";

import React, { useState } from "react";
import { Therapy, WebSectionItem } from "@/types/content";
import { Sparkles, Clock, CheckCircle2, ArrowRight, Tag } from "lucide-react";
import Image from "next/image";

interface TherapiesSectionProps {
  therapies: Therapy[];
  onOpenBooking: (preselectedService?: string) => void;
  section?: WebSectionItem;
}

export const TherapiesSection: React.FC<TherapiesSectionProps> = ({ therapies, onOpenBooking, section }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("todas");

  const lema = section?.contenido?.badge || section?.contenido?.lema || "Carta de Terapias & Cuidados";
  const titulo = section?.contenido?.tituloSeccion || section?.contenido?.titulo || section?.titulo || "Tratamientos para el Cuerpo y el Alma";
  const descripcion = section?.contenido?.mensajeCabecera || section?.contenido?.descripcion || section?.subtitulo || "Cada sesión se diseña de manera artesanal y consciente. Selecciona la terapia que tu cuerpo o tu momento vital te esté pidiendo.";

  const rawTherapies = (section?.contenido?.items && Array.isArray(section.contenido.items) && section.contenido.items.length > 0)
    ? section.contenido.items
    : therapies;

  const displayTherapies: Therapy[] = rawTherapies.map((t: any, idx: number) => ({
    id: t.id || `th-${idx}`,
    title: t.title || t.titulo || "Terapia Holística",
    subtitle: t.subtitle || t.subtitulo || "",
    category: t.category || t.categoria || "quiromasaje",
    categoryLabel: t.categoryLabel || t.categoriaEtiqueta || "Terapia Especial",
    shortDescription: t.shortDescription || t.descripcionCorta || "",
    fullDescription: t.fullDescription || t.descripcion || "",
    benefits: Array.isArray(t.benefits)
      ? t.benefits
      : (typeof t.benefits === "string" ? t.benefits.split("\n").map((s: string) => s.trim()).filter(Boolean) : []),
    duration: t.duration || t.duracion || "60 min",
    priceNote: t.priceNote || t.precioNota || "",
    imageUrl: t.imageUrl || t.imagenUrl || "/brand/terapia-placeholder.webp",
    badge: t.badge || undefined,
  }));

  const categories = [
    { id: "todas", label: "Todas las Terapias" },
    { id: "quiromasaje", label: "Quiromasaje" },
    { id: "reiki", label: "Reiki & Chakras" },
    { id: "registros_akashicos", label: "Registros Akáshicos" },
    { id: "respiracion", label: "Respiración & Pranayama" },
  ];

  const filteredTherapies =
    selectedFilter === "todas"
      ? displayTherapies
      : displayTherapies.filter((t) => t.category === selectedFilter);

  return (
    <section id="terapias" className="py-24 bg-[#f4f0e8]/50 border-t border-[#ece4d8] relative overflow-hidden">
      {/* Ramas de bambú en esquinas */}
      <div className="absolute top-0 left-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-left.webp"
          alt=""
          fill
          className="object-contain object-left-top"
        />
      </div>
      <div className="absolute bottom-0 right-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-leaves-bottom.webp"
          alt=""
          fill
          className="object-contain object-right-bottom"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cbdbd0] text-[#345041] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed">
            {descripcion}
          </p>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  selectedFilter === cat.id
                    ? "bg-[#3d5a4c] text-white shadow-sm"
                    : "bg-white text-[#4a584f] border border-[#e0d8cc] hover:bg-[#eae3d5]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuadrícula de Terapias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTherapies.map((therapy) => (
            <div
              key={therapy.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#e8e1d5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Contenedor de Imagen */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#ebe4d7]">
                <Image
                  src={therapy.imageUrl}
                  alt={therapy.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badges superiores */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#2d473b] shadow-sm">
                    {therapy.categoryLabel}
                  </span>
                  {therapy.badge && (
                    <span className="px-3 py-1 rounded-full bg-[#dfc89f] text-xs font-bold text-[#352b1e] shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {therapy.badge}
                    </span>
                  )}
                </div>

                {/* Título en imagen */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="font-serif text-2xl font-semibold leading-tight drop-shadow-sm">
                    {therapy.title}
                  </h3>
                  <p className="text-xs text-white/90 font-light mt-1 drop-shadow-sm line-clamp-1">
                    {therapy.subtitle}
                  </p>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-[#55645a] leading-relaxed mb-6">
                    {therapy.fullDescription}
                  </p>

                  {/* Beneficios */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-3">
                      Beneficios Principales:
                    </h4>
                    <ul className="space-y-2">
                      {therapy.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#445248]">
                          <CheckCircle2 className="w-4 h-4 text-[#3d5a4c] flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pie de tarjeta: Duración, precio y CTA */}
                <div className="pt-5 border-t border-[#f0ebe1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-[#5e7065]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-[#b5935b]" />
                      {therapy.duration}
                    </span>
                    {therapy.priceNote && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag className="w-3.5 h-3.5 text-[#b5935b]" />
                        {therapy.priceNote}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenBooking(therapy.title)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#3d5a4c] text-white font-medium text-xs sm:text-sm hover:bg-[#2c4238] transition-all cursor-pointer shadow-sm group-hover:bg-[#2c4238]"
                  >
                    <span>Pedir Cita</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#dfc89f]" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
