"use client";

import React from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { Sparkles, ArrowRight, ShieldCheck, Heart, Leaf, Sun } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  config: SiteConfig;
  section?: WebSectionItem;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ config, section, onOpenBooking }) => {
  const contenido = section?.contenido || {};
  const lema = contenido.lemaSuperior || section?.subtitulo || contenido.lema || contenido.badge || "Armonía Yin-Yang & Bienestar Holístico · Boiro";
  const titulo = contenido.tituloGrande || section?.titulo || contenido.titulo || "Reconecta con tu equilibrio vital y la calma profunda.";
  const descripcion = contenido.fraseBienvenida || contenido.descripcion || config.description;
  const boton1Texto = contenido.botonTexto || contenido.boton1Texto || "Reservar Cita";
  const boton2Texto = contenido.botonSecundario || contenido.boton2Texto || "Explorar Terapias";
  const boton2Link = contenido.boton2Link || "#terapias";
  const heroImg = contenido.heroImg || contenido.imagenUrl || contenido.imagen || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80";

  const chips = Array.isArray(contenido.chips) && contenido.chips.length > 0 ? contenido.chips : [
    { titulo: "100% Natural", desc: "Aceites puros ecológicos" },
    { titulo: "Atención Personal", desc: "Sin prisas ni esperas" },
    { titulo: "Cuerpo y Alma", desc: "Enfoque holístico integral" },
  ];

  const tarjeta1Cifra = contenido.tarjeta1Cifra || "10+";
  const tarjeta1Texto = contenido.tarjeta1Texto || "Años de Experiencia Terapéutica";
  const tarjeta2Texto = contenido.tarjeta2Texto || "5.0 en Reseñas";
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden aura-gradient-subtle">
      {/* Cañas de bambú laterales extraídas del logotipo oficial */}
      <div className="hidden md:block absolute top-0 left-0 w-36 lg:w-48 h-full pointer-events-none opacity-15 lg:opacity-20 z-0 overflow-hidden select-none">
        <Image
          src="/brand/bamboo-left.webp"
          alt="Bambú natural zen"
          fill
          className="object-contain object-left-top"
        />
      </div>
      <div className="hidden md:block absolute top-0 right-0 w-36 lg:w-48 h-full pointer-events-none opacity-15 lg:opacity-20 z-0 overflow-hidden select-none">
        <Image
          src="/brand/bamboo-right.webp"
          alt="Bambú natural zen"
          fill
          className="object-contain object-right-top"
        />
      </div>

      {/* Símbolo Yin-Yang zen en respiración sutil de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] md:w-[580px] md:h-[580px] opacity-[0.035] pointer-events-none -z-10 select-none animate-zen-breathe">
        <Image
          src="/brand/yinyang.webp"
          alt="Yin Yang de fondo"
          fill
          className="object-contain"
        />
      </div>

      {/* Círculos decorativos de energía / aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] md:w-[750px] md:h-[750px] bg-gradient-to-tr from-[#cbdbd0]/35 via-[#e2ede6]/40 to-[#dfc89f]/25 rounded-full blur-3xl pointer-events-none -z-10 animate-zen-breathe" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#dfc89f]/20 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Texto principal y llamadas a la acción */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#e8efe9] border border-[#cbdbd0] text-[#2f4d3e] text-xs sm:text-sm font-medium mb-6">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-[#3d5a4c]/30 flex-shrink-0 bg-white">
                <Image src="/brand/yinyang.webp" alt="Yin Yang" width={20} height={20} className="w-full h-full object-cover" />
              </div>
              <span>{lema}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#1e2621] tracking-tight leading-[1.15] mb-6">
              {titulo}
            </h1>

            <p className="text-base sm:text-lg text-[#55645a] leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
              {descripcion}
            </p>

            {/* Acciones principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#3d5a4c] text-white font-medium text-base shadow-md hover:bg-[#2c4238] hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <span>{boton1Texto}</span>
                <ArrowRight className="w-4 h-4 text-[#dfc89f] transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href={boton2Link}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/80 border border-[#cbdbd0] text-[#2d473b] font-medium text-base hover:bg-[#f3f7f4] transition-colors"
              >
                <span>{boton2Texto}</span>
              </a>
            </div>

            {/* Micro-garantías de confianza */}
            <div className="pt-6 border-t border-[#e2dad0] grid grid-cols-3 gap-4 text-center lg:text-left">
              {chips.map((chip: any, cIdx: number) => {
                const icons = [Leaf, Heart, Sun];
                const IconComponent = icons[cIdx % icons.length] || Sparkles;
                return (
                  <div key={cIdx} className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#eaf0ec] flex items-center justify-center text-[#3d5a4c]">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#212924]">{chip.titulo || chip.title}</h4>
                      <p className="text-[11px] text-[#6a7a70]">{chip.desc || chip.subtitulo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Imagen artística con tarjeta flotante */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Marco fotográfico elegante */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-[#ece4d8]">
                <Image
                  src={heroImg}
                  alt={titulo}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Tarjeta flotante 1: Experiencia */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-[#ece4d8] flex items-center gap-3.5 max-w-[260px] animate-float-gentle">
                <div className="w-12 h-12 rounded-xl bg-[#3d5a4c] flex items-center justify-center text-[#dfc89f] font-serif text-xl font-bold shadow-inner">
                  {tarjeta1Cifra}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#65766b] uppercase tracking-wider">Años de</p>
                  <p className="text-sm font-bold text-[#212924]">{tarjeta1Texto}</p>
                </div>
              </div>

              {/* Tarjeta flotante 2: Valoración */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#ece4d8] flex items-center gap-2">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <span className="text-xs font-semibold text-[#212924]">{tarjeta2Texto}</span>
              </div>

              {/* Tarjeta flotante 3: Sello Yin-Yang & Bambú */}
              <div
                className="hidden sm:flex absolute -bottom-6 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#ece4d8] items-center gap-3 animate-float-gentle"
                style={{ animationDelay: "-2.5s" }}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-[#3d5a4c]/30 flex-shrink-0 bg-[#f6f2ea] shadow-xs">
                  <Image
                    src="/brand/yinyang.webp"
                    alt="Yin Yang Blanco y Negro"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#3d5a4c] font-bold block leading-none mb-0.5">
                    Dualidad & Armonía
                  </span>
                  <span className="text-xs font-semibold text-[#212924] block">
                    Yin-Yang & Bambú
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
