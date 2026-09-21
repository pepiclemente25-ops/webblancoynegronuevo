"use client";

import React from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { Sparkles, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  config: SiteConfig;
  section?: WebSectionItem;
  garantiasSection?: WebSectionItem;
  onOpenBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ config, section, garantiasSection, onOpenBooking }) => {
  const contenido = section?.contenido || {};
  const lema =
    contenido.lemaSuperior ||
    contenido.badge ||
    "ARMONÍA YIN-YANG & BIENESTAR HOLÍSTICO · BOIRO";
  const titulo =
    contenido.tituloGrande ||
    section?.titulo ||
    contenido.titulo ||
    "Reconecta con tu equilibrio vital y la calma profunda";
  const descripcion =
    contenido.fraseBienvenida ||
    contenido.descripcion ||
    "Un santuario de calma y equilibrio en el que reconectar con tu esencia natural a través del quiromasaje, la energía Reiki, las lecturas de Registros Akáshicos y la respiración consciente.";
  const boton1Texto = contenido.botonTexto || contenido.boton1Texto || "Reservar Cita";
  const boton1Link = contenido.boton1Link || "#tienda";
  const boton2Texto =
    contenido.botonSecundario || contenido.boton2Texto || "Explorar Terapias";
  const boton2Link = contenido.boton2Link || "#carta-terapias";
  const heroImg =
    contenido.heroImg ||
    contenido.imagenUrl ||
    contenido.imagen ||
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80";
  const therapistName = contenido.nombreTerapeuta || config.therapistName || "Pepi";
  const subtituloFoto = contenido.subtituloFoto || "Centro Holístico & Tienda";
  const tituloFoto = contenido.tituloFoto || `${therapistName} · Boiro (A Coruña)`;
  const tarjetaFlotanteIcono = contenido.tarjetaFlotanteIcono || "★";
  const tarjetaFlotanteTitulo = contenido.tarjetaFlotanteTitulo || "Atención Cercana";
  const tarjetaFlotanteTexto = contenido.tarjetaFlotanteTexto || "Recogida en Boiro y envíos a toda España";

  // Garantías / Ventajas dinámicas (Sección 2 o contenido de Hero)
  const gContenido = garantiasSection?.contenido || contenido.garantias || {};
  const garantia1Icono = gContenido.icono1 || "📦";
  const garantia1Titulo = gContenido.titulo1 || "Envíos Cuidados";
  const garantia1Desc = gContenido.desc1 || "A domicilio en 24-48h";

  const garantia2Icono = gContenido.icono2 || "🏪";
  const garantia2Titulo = gContenido.titulo2 || "Recogida Gratuita";
  const garantia2Desc = gContenido.desc2 || "En nuestro centro de Boiro";

  const garantia3Icono = gContenido.icono3 || "✨";
  const garantia3Titulo = gContenido.titulo3 || "100% Auténtico";
  const garantia3Desc = gContenido.desc3 || "Minerales y ceras naturales";

  const garantia4Icono = gContenido.icono4 || "💬";
  const garantia4Titulo = gContenido.titulo4 || "Asesoría WhatsApp";
  const garantia4Desc = gContenido.desc4 || "Te ayudamos a elegir";

  return (
    <>
      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section
        id="inicio"
        className="relative pt-32 pb-14 sm:pt-36 md:pt-40 md:pb-20 overflow-hidden bg-gradient-to-b from-[#faf7f2] via-[#f4eee4] to-[#faf7f2] border-b border-[#ebdcca]"
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
                      {subtituloFoto}
                    </p>
                    <p className="text-base font-bold font-serif">
                      {tituloFoto}
                    </p>
                  </div>
                </div>

                {/* Badge Flotante */}
                <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#ebdcca] flex items-center gap-3 animate-zen-float max-w-[260px]">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf2ec] text-[#3d5a4c] flex items-center justify-center font-bold text-lg shrink-0">
                    {tarjetaFlotanteIcono}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{tarjetaFlotanteTitulo}</p>
                    <p className="text-xs font-bold text-[#1f2923] leading-tight">
                      {tarjetaFlotanteTexto}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDA DE GARANTÍAS */}
      <div id="garantias" className="bg-white border-b border-[#ebdcca] py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                {garantia1Icono}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">{garantia1Titulo}</h4>
                <p className="text-[11px] text-gray-500">{garantia1Desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                {garantia2Icono}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">{garantia2Titulo}</h4>
                <p className="text-[11px] text-gray-500">{garantia2Desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                {garantia3Icono}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">{garantia3Titulo}</h4>
                <p className="text-[11px] text-gray-500">{garantia3Desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <span className="w-8 h-8 rounded-full bg-[#f1f6f2] text-[#3d5a4c] flex items-center justify-center text-sm font-bold shrink-0">
                {garantia4Icono}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1e2822]">{garantia4Titulo}</h4>
                <p className="text-[11px] text-gray-500">{garantia4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
