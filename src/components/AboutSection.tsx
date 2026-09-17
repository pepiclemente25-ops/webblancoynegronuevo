"use client";

import React from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { Sparkles, CheckCircle2, HeartHandshake, Feather, Flower2 } from "lucide-react";
import Image from "next/image";

interface AboutSectionProps {
  config: SiteConfig;
  section?: WebSectionItem;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ config, section, onOpenBooking }) => {
  const contenido = section?.contenido || {};
  const therapistImg = contenido.imagenUrl || contenido.imagen || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80";
  const therapistName = contenido.nombreTerapeuta || config.therapistName;
  const therapistRole = contenido.titulacion || "Quiromasajista & Terapeuta Holística";
  const tactoTitulo = contenido.lema || "Tacto Consciente";
  const tactoFrase = contenido.fraseLema || "Tratamos a la persona en su totalidad, nunca a un síntoma aislado.";
  const lema = section?.subtitulo || contenido.badge || "Sobre Mí y la Esencia del Espacio";
  const titulo = section?.titulo || contenido.titulo || "Un refugio para soltar el ruido y volver a tu centro.";
  const bio = contenido.bio || config.therapistBio;
  const filosofia = contenido.filosofia || `En ${config.name}, cada sesión comienza con una pequeña escucha previa para comprender qué necesita tu cuerpo en ese instante: si una descarga muscular profunda, la calma sutil de una imposición de manos o la claridad que aportan los Registros Akáshicos.`;
  const botonTexto = contenido.botonTexto || "Conoce el Espacio · Solicitar Cita";

  const pilares = Array.isArray(contenido.puntosClave) && contenido.puntosClave.length > 0 ? contenido.puntosClave : [
    {
      titulo: "Presencia y Escucha Activa",
      desc: "No aplicamos protocolos mecánicos; adaptamos la presión, el ritmo y la técnica a lo que tus tejidos y tu energía comunican.",
    },
    {
      titulo: "Cosmética y Botánica Sagrada",
      desc: "Utilizamos exclusivamente aceites vegetales de primera presión en frío y aceites esenciales puros ecológicos, libres de parafinas o químicos sintéticos.",
    },
    {
      titulo: "Entorno Armonizado & Desconexión Total",
      desc: "Música en frecuencia 432Hz, luz cálida y espacio purificado antes de cada cita para que tu mente desconecte nada más cruzar la puerta.",
    },
  ];
  return (
    <section id="sobre-mi" className="py-24 bg-[#fbf9f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Imagen y Composición Visual */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              
              {/* Imagen de la terapeuta / espacio */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-[#ece4d8]">
                <Image
                  src={therapistImg}
                  alt={`Espacio y terapeuta de ${config.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#212924]/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-serif text-2xl font-medium">{therapistName}</p>
                  <p className="text-xs text-[#dfc89f] tracking-wider uppercase">
                    {therapistRole}
                  </p>
                </div>
              </div>

              {/* Distintivo de Filosofía */}
              <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-white p-5 rounded-2xl shadow-xl border border-[#ece4d8] max-w-[240px]">
                <div className="flex items-center gap-2 text-[#3d5a4c] mb-1.5">
                  <Feather className="w-5 h-5 text-[#b5935b]" />
                  <span className="font-semibold text-xs uppercase tracking-wider">{tactoTitulo}</span>
                </div>
                <p className="text-xs text-[#55645a] leading-relaxed">
                  {tactoFrase}
                </p>
              </div>
            </div>
          </div>

          {/* Texto y Principios */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#b5935b]" />
              <span>{lema}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight leading-tight mb-6">
              {titulo}
            </h2>

            <p className="text-base sm:text-lg text-[#55645a] leading-relaxed mb-6">
              {bio}
            </p>

            <p className="text-sm sm:text-base text-[#617267] leading-relaxed mb-8">
              {filosofia}
            </p>

            {/* Los 3 Pilares Holísticos */}
            <div className="space-y-4 mb-8">
              {pilares.map((pilar: any, pIdx: number) => {
                const icons = [HeartHandshake, Flower2, Sparkles];
                const IconComponent = icons[pIdx % icons.length] || Sparkles;
                return (
                  <div key={pIdx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#ece4d8] shadow-xs">
                    <div className="p-2 rounded-xl bg-[#eaf0ec] text-[#3d5a4c] flex-shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#212924]">{pilar.titulo || pilar.title}</h4>
                      <p className="text-xs sm:text-sm text-[#55645a] mt-0.5">
                        {pilar.desc || pilar.descripcion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#3d5a4c] text-white font-medium text-sm shadow-sm hover:bg-[#2d473b] hover:shadow transition-all cursor-pointer"
            >
              <span>{botonTexto}</span>
            </button>
          </div>

        </div>

        {/* Bloque especial: El Yin-Yang y la Sabiduría del Bambú */}
        <div className="mt-20 pt-16 border-t border-[#ece4d8]">
          <div className="bg-[#f6f2ea] rounded-3xl p-8 sm:p-12 border border-[#e0d6c5] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden">
            
            {/* Bambú tenue decorativo de fondo */}
            <div className="hidden sm:block absolute -right-6 top-0 w-44 h-full pointer-events-none opacity-10 z-0 select-none">
              <Image
                src="/brand/bamboo-right.webp"
                alt=""
                fill
                className="object-contain object-right"
              />
            </div>

            {/* Columna izquierda: Obra gráfica / Logotipo oficial */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-64 sm:w-72 aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border-4 border-white/80 bg-[#f3eee4] group">
                <Image
                  src="/brand/logo-full.webp"
                  alt="Emblema oficial de Blanco y Negro - Yin Yang y Bambú"
                  fill
                  sizes="(max-width: 768px) 260px, 320px"
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Columna derecha: Significado profundo de los símbolos */}
            <div className="lg:col-span-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#cbdbd0] text-[#345041] text-xs font-semibold mb-4">
                <div className="w-4 h-4 rounded-full overflow-hidden border border-[#3d5a4c]/30">
                  <Image src="/brand/yinyang.webp" alt="Yin Yang" width={16} height={16} className="w-full h-full object-cover" />
                </div>
                <span>Nuestra Identidad & Filosofía</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1e2621] font-semibold mb-5">
                El Significado tras el Yin-Yang y el Bambú
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Significado Yin Yang */}
                <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#3d5a4c]/30 flex-shrink-0 bg-[#f6f2ea]">
                      <Image src="/brand/yinyang.webp" alt="Yin Yang" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#212924]">El Yin y el Yang</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4d5d52] leading-relaxed">
                    Representa la danza complementaria de la existencia: cuerpo físico y energía sutil, acción y quietud, luz y sombra. La salud integral no consiste en eliminar un extremo, sino en restaurar su diálogo armónico.
                  </p>
                </div>

                {/* Significado Bambú */}
                <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#3d5a4c] text-white flex items-center justify-center flex-shrink-0 text-xs font-serif font-bold">
                      竹
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#212924]">La Sabiduría del Bambú</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4d5d52] leading-relaxed">
                    Símbolo oriental de flexibilidad y resiliencia. El bambú se inclina ante los vientos más intensos sin quebrarse, firmemente enraizado a la tierra pero con su centro hueco y libre para que la energía vital (Ki) fluya sin obstáculos.
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
