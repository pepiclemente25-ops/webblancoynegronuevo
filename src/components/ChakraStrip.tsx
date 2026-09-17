"use client";

import React, { useState } from "react";
import { ChakraItem, WebSectionItem } from "@/types/content";
import { Sparkles, Info } from "lucide-react";
import Image from "next/image";

interface ChakraStripProps {
  chakras: ChakraItem[];
  section?: WebSectionItem;
}

export const ChakraStrip: React.FC<ChakraStripProps> = ({ chakras, section }) => {
  const lema = section?.contenido?.badge || section?.contenido?.lema || "Los 7 Centros Energéticos";
  const titulo = section?.contenido?.tituloSeccion || section?.contenido?.titulo || section?.titulo || "Alineación y Equilibrio de los Chakras";
  const descripcion = section?.contenido?.descripcion || section?.subtitulo || "Cuando la energía fluye libremente a través de nuestros centros vitales, experimentamos salud física, paz mental y serenidad emocional. A través del Reiki y la respiración consciente, desbloqueamos y armonizamos cada uno de ellos.";

  const rawChakras = (section?.contenido?.chakras && Array.isArray(section.contenido.chakras) && section.contenido.chakras.length > 0)
    ? section.contenido.chakras
    : (section?.contenido?.items && Array.isArray(section.contenido.items) && section.contenido.items.length > 0)
    ? section.contenido.items
    : chakras;

  const displayChakras: ChakraItem[] = rawChakras.map((ch: any, idx: number) => ({
    number: ch.number || idx + 1,
    name: ch.name || ch.nombre || `Chakra ${idx + 1}`,
    sanskritName: ch.sanskritName || ch.nombreSanscrito || "",
    color: ch.color || "#3d5a4c",
    badgeColor: ch.badgeColor || "bg-[#eaf0ec] text-[#345041]",
    glowColor: ch.glowColor || "rgba(61,90,76,0.3)",
    meaning: ch.meaning || ch.significado || "",
    symptoms: ch.symptoms || ch.sintomas || "",
  }));

  const [selectedChakra, setSelectedChakra] = useState<ChakraItem>(displayChakras[3] || displayChakras[0]);

  return (
    <section id="chakras" className="py-20 bg-[#f4f0e8]/70 border-y border-[#ece4d8] relative overflow-hidden">
      {/* Rama de hojas de bambú decorativa en esquina superior */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 h-40 sm:h-56 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-right.webp"
          alt=""
          fill
          className="object-contain object-right-top"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cbdbd0] text-[#385345] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed">
            {descripcion}
          </p>
        </div>

        {/* Fila interactiva de los 7 chakras */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
          {displayChakras.map((chakra) => {
            const isSelected = selectedChakra.number === chakra.number;
            return (
              <button
                key={chakra.number}
                onClick={() => setSelectedChakra(chakra)}
                className={`group flex flex-col items-center p-3.5 sm:p-4 rounded-2xl transition-all duration-300 border text-center cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#3d5a4c] shadow-lg scale-105"
                    : "bg-white/60 border-[#e5ded4] hover:bg-white hover:border-[#cbdbd0] hover:shadow"
                }`}
              >
                {/* Círculo de color y número */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm transition-transform group-hover:scale-110 mb-2.5 relative"
                  style={{ backgroundColor: chakra.color }}
                >
                  {chakra.number}
                  {isSelected && (
                    <span
                      className="absolute -inset-1 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: chakra.color }}
                    />
                  )}
                </div>

                <span className="font-semibold text-xs text-[#212924] block leading-tight">
                  {chakra.name}
                </span>
                <span className="text-[11px] text-[#6e7d73] italic block mt-0.5">
                  {chakra.sanskritName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detalle ampliado del chakra seleccionado */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ded4] shadow-md max-w-4xl mx-auto transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Medallón del chakra */}
            <div
              className="w-20 h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center text-white shadow-inner"
              style={{ backgroundColor: selectedChakra.color }}
            >
              <span className="text-xs uppercase tracking-widest font-mono opacity-80">Chakra</span>
              <span className="font-serif text-3xl font-bold">{selectedChakra.number}</span>
            </div>

            {/* Información */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="font-serif text-2xl text-[#1e2621] font-semibold">
                  {selectedChakra.name}
                </h3>
                <span className="text-sm italic text-[#55655a] font-medium">
                  ({selectedChakra.sanskritName})
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedChakra.badgeColor}`}>
                  Centro #{selectedChakra.number}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#f0ebe1]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-1">
                    Cualidad y Enfoque:
                  </h4>
                  <p className="text-sm text-[#46544c] leading-relaxed">
                    {selectedChakra.meaning}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7523a] mb-1">
                    Signos de Bloqueo:
                  </h4>
                  <p className="text-sm text-[#46544c] leading-relaxed">
                    {selectedChakra.symptoms}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
