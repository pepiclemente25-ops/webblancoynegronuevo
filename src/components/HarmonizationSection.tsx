"use client";

import React, { useState } from "react";
import { HarmonizationItem, SiteConfig, WebSectionItem } from "@/types/content";
import { Sparkles, Leaf, Compass, MessageCircle, HelpCircle, Flame } from "lucide-react";
import Image from "next/image";

interface HarmonizationSectionProps {
  items: HarmonizationItem[];
  config: SiteConfig;
  section?: WebSectionItem;
}

export const HarmonizationSection: React.FC<HarmonizationSectionProps> = ({ items, config, section }) => {
  const [activeCategory, setActiveCategory] = useState<string>("todos");

  const contenido = section?.contenido || {};
  const lema = section?.subtitulo || contenido.lema || contenido.badge || "Espacio Botánico & Energético";
  const titulo = section?.titulo || contenido.titulo || "Herramientas para Armonizar tu Vida y tu Hogar";
  const descripcion = contenido.descripcion || "Una cuidada selección de botánica sagrada, minerales intencionados y utensilios de tacto consciente que utilizamos en consulta y que ponemos a tu disposición para mantener alta tu vibración en casa.";

  const rawItems = Array.isArray(contenido.items) && contenido.items.length > 0 ? contenido.items : items;
  const displayItems = rawItems.map((item: any, idx: number) => {
    const defaultFallback = items[idx]?.imageUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80";
    return {
      id: item.id || `armonizacion-${idx + 1}`,
      title: item.title || item.titulo || `Bloque ${idx + 1}`,
      category: item.category || item.categoria || "aromaterapia",
      categoryLabel: item.categoryLabel || item.category || "Armonización",
      description: item.description || item.descripcion || "",
      properties: Array.isArray(item.properties) ? item.properties : (Array.isArray(item.propiedades) ? item.propiedades : []),
      usageTip: item.usageTip || item.consejo || "",
      imageUrl: item.imageUrl || item.imagenUrl || item.imagen || defaultFallback,
    };
  });

  const categories = [
    { id: "todos", label: "Todo el Espacio" },
    { id: "aromaterapia", label: "Aromaterapia & Aceites" },
    { id: "minerales", label: "Minerales & Gemas" },
    { id: "herramientas", label: "Masajeadores & Tacto" },
    { id: "espacios", label: "Armonización de Espacios" },
  ];

  const filteredItems =
    activeCategory === "todos"
      ? displayItems
      : displayItems.filter((item: any) => item.category === activeCategory);

  const banner = contenido.banner || {};
  const bannerLema = banner.lema || "Servicio Especializado a Domicilio y Negocios";
  const bannerTitulo = banner.titulo || "¿Sientes la energía de tu hogar o lugar de trabajo pesada o estancada?";
  const bannerTexto = banner.texto || "Realizamos limpiezas energéticas profundas en viviendas, locales comerciales y oficinas mediante sahumerio ancestral con salvia blanca, frecuencias de sonido y sellado de portales áuricos. Solicita una valoración previa sin compromiso.";
  const bannerBoton = banner.botonTexto || "Solicitar Valoración para mi Espacio";

  return (
    <section id="armonizacion" className="py-24 bg-[#f4f0e8]/70 border-t border-[#ece4d8] relative overflow-hidden">
      {/* Ramas de hojas de bambú decorativas */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-right.webp"
          alt=""
          fill
          className="object-contain object-right-top"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-left.webp"
          alt=""
          fill
          className="object-contain object-left-bottom"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cbdbd0] text-[#345041] text-xs font-semibold mb-4">
            <Leaf className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed">
            {descripcion}
          </p>

          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#3d5a4c] text-white shadow-sm"
                    : "bg-white text-[#4a584f] border border-[#e0d8cc] hover:bg-[#eae3d5]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuadrícula de Armonización */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#e8e1d5] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Imagen */}
              <div className="relative h-60 w-full overflow-hidden bg-[#ece4d8]">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-[#3d5a4c] shadow-sm">
                    {item.categoryLabel}
                  </span>
                </div>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="font-serif text-2xl font-semibold">{item.title}</h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-[#55645a] leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Propiedades */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-2.5">
                      Propiedades y Selección:
                    </h4>
                    <ul className="space-y-1.5">
                      {item.properties.map((prop: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#445248]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b5935b] mt-1.5 flex-shrink-0" />
                          <span>{prop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Consejo de Uso */}
                  <div className="bg-[#fbf9f5] p-3.5 rounded-2xl border border-[#ece4d8] text-xs text-[#526357] leading-relaxed">
                    <div className="flex items-center gap-1.5 text-[#3d5a4c] font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
                      <span>Cómo utilizarlo:</span>
                    </div>
                    {item.usageTip}
                  </div>
                </div>

                {/* Consultar asesoramiento */}
                <div className="pt-5 border-t border-[#f0ebe1] mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#6e7d73]">
                    Asesoramiento personalizado en tienda y terapias.
                  </span>
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=Hola%20${encodeURIComponent(
                      config.name
                    )},%20quisiera%20consultar%20sobre%20${encodeURIComponent(item.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#3d5a4c] hover:text-[#212924] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Consultar</span>
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Banner Informativo sobre Armonización de Espacios */}
        <div className="bg-[#3d5a4c] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[#dfc89f] text-xs font-semibold mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>{bannerLema}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3">
              {bannerTitulo}
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
              {bannerTexto}
            </p>
            <a
              href={`https://wa.me/${config.whatsapp}?text=Hola%20${encodeURIComponent(
                config.name
              )},%20quisiera%20información%20sobre%20el%20servicio%20de%20armonización%20y%20limpieza%20energética%20de%20espacios.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#212924] font-semibold text-xs sm:text-sm hover:bg-[#dfc89f] transition-colors shadow"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{bannerBoton}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
