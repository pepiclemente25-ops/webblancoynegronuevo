"use client";

import React from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { Sparkles, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  config: SiteConfig;
  section?: WebSectionItem;
  onOpenBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ config, section, onOpenBooking }) => {
  const contenido = section?.contenido || {};
  const lema =
    contenido.lemaSuperior ||
    contenido.badge ||
    "🌿 Tu Santuario de Sanación & Bienestar en Boiro";
  const titulo =
    contenido.tituloGrande ||
    section?.titulo ||
    contenido.titulo ||
    "Armoniza tu energía, cuida tu templo y eleva tu vibración.";
  const descripcion =
    contenido.fraseBienvenida ||
    contenido.descripcion ||
    "Encuentra cuarzos auténticos, velas ritualizadas e inciensos botánicos para tu hogar, o sumérgete en una sesión presencial de Reiki y masajes en nuestro espacio en Boiro.";
  const boton1Texto = contenido.botonTexto || contenido.boton1Texto || "Explorar Tienda & Herramientas";
  const boton1Link = contenido.boton1Link || "#tienda";
  const boton2Texto =
    contenido.botonSecundario || contenido.boton2Texto || "Ver Carta de Terapias en Boiro";
  const boton2Link = contenido.boton2Link || "#carta-terapias";
  const heroImg =
    contenido.heroImg ||
    contenido.imagenUrl ||
    contenido.imagen ||
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80";
  const therapistName = contenido.nombreTerapeuta || config.therapistName || "Pepi";

  return (
    <>
      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section
        id="inicio"
        className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden bg-gradient-to-b from-[#faf7f2] via-[#f4eee4] to-[#faf7f2] border-b border-[#ebdcca]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Columna Izquierda: Textos y CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8efe9] border border-[#cbdbd0] text-[#2f4d3e] text-xs font-semibold uppercase tracking-wider mb-5">
                <span>{lema}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#1a251e] leading-[1.2] mb-5 tracking-tight">
                {titulo}
              </h1>

              <p className="text-base sm:text-lg text-[#55695e] leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-normal">
                {descripcion}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href={boton1Link}
                  className="px-7 sm:px-8 py-3.5 rounded-full bg-[#3d5a4c] hover:bg-[#2a3d34] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>{boton1Texto}</span>
                  <ChevronDown className="w-4 h-4 text-[#dfc89f] group-hover:translate-y-0.5 transition-transform" />
                </a>
                <a
                  href={boton2Link}
                  className="px-6 sm:px-7 py-3.5 rounded-full bg-white border border-[#cbdbd0] hover:bg-[#f1f6f2] text-[#2d473b] text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#3d5a4c]" />
                  <span>{boton2Texto}</span>
                </a>
              </div>
            </div>

            {/* Columna Derecha: Imagen del Espacio / Terapeuta */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white relative bg-[#e3d8c8]">
                  <Image
                    src={heroImg}
                    alt={`Espacio y terapeuta de ${config.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                    priority
                    unoptimized={heroImg.startsWith("data:")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#dfc89f]">
                      Centro Holístico & Tienda
                    </p>
                    <p className="text-base font-bold font-serif">
                      {therapistName} · Terapeuta & Guía Holística
                    </p>
                  </div>
                </div>

                {/* Badge Flotante */}
                <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#ebdcca] flex items-center gap-3 animate-zen-float max-w-[260px]">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf2ec] text-[#3d5a4c] flex items-center justify-center font-bold text-lg shrink-0">
                    ★
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Atención Cercana</p>
                    <p className="text-xs font-bold text-[#1f2923] leading-tight">
                      Recogida en Boiro y envíos a toda España
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDA DE GARANTÍAS */}
      <div className="bg-white border-b border-[#ebdcca] py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                📦
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">Envíos Cuidados</h4>
                <p className="text-[11px] text-gray-500">A domicilio en 24-48h</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                🏪
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">Recogida Gratuita</h4>
                <p className="text-[11px] text-gray-500">En nuestro centro de Boiro</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                ✨
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">100% Auténtico</h4>
                <p className="text-[11px] text-gray-500">Minerales y ceras naturales</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                💬
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">Asesoría WhatsApp</h4>
                <p className="text-[11px] text-gray-500">Te ayudamos a elegir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
