"use client";

import React from "react";
import { SiteConfig } from "@/types/content";
import { Heart } from "lucide-react";
import Image from "next/image";

interface FooterProps {
  config: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-[#212924] text-[#cfd6d1] pt-16 pb-12 border-t border-[#313c35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#313c35]">
          
          {/* Logo y lema */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f6f2ea] border border-[#dfc89f]/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                <Image
                  src="/brand/yinyang.webp"
                  alt="Logo Blanco y Negro"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold text-white tracking-wide block leading-tight">
                  {config.name}
                </span>
                <span className="text-[11px] text-[#dfc89f] tracking-wider uppercase font-medium block">
                  {config.tagline || "Terapias Holísticas y Bienestar"}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#95a39a] leading-relaxed max-w-sm">
              {config.description ||
                "Espacio dedicado a la reconexión profunda entre cuerpo, mente y alma. Terapias naturales, productos conscientes y bienestar integral."}
            </p>
          </div>

          {/* Enlaces de navegación */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfc89f] mb-4">
              Navegación Rápida
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="/#inicio" className="hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/#tienda" className="hover:text-white transition-colors">
                  Tienda Holística & Minerales
                </a>
              </li>
              <li>
                <a href="/#carta-terapias" className="hover:text-white transition-colors">
                  Carta de Terapias & Sesiones
                </a>
              </li>
              <li>
                <a href="/#sobre-mi" className="hover:text-white transition-colors">
                  Sobre el Espacio & Filosofía
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                    `Hola ${config.name}, quisiera agendar una cita o hacer una consulta.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#dfc89f] hover:text-white transition-colors font-medium flex items-center gap-1 mt-3"
                >
                  <span>Pedir Cita por WhatsApp →</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto directo */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfc89f] mb-4">
              Visitas y Citas
            </h4>
            <p className="text-xs sm:text-sm text-[#cfd6d1] mb-2">{config.address}</p>
            <p className="text-xs text-[#95a39a] mb-4">{config.city}</p>
            <p className="text-xs text-[#95a39a] mb-1">
              Teléfono:{" "}
              <a href={`tel:${config.phone}`} className="text-white hover:text-[#dfc89f] transition-colors font-bold">
                {config.phoneDisplay}
              </a>
            </p>
            <p className="text-xs text-[#95a39a]">
              Email:{" "}
              <a href={`mailto:${config.email}`} className="text-white hover:text-[#dfc89f] transition-colors font-bold">
                {config.email}
              </a>
            </p>
          </div>

        </div>

        {/* Disclaimer médico / holístico ético */}
        <div className="py-6 border-b border-[#313c35] text-[11px] text-[#7a8880] leading-relaxed">
          <p>
            <strong className="text-[#a1b0a7]">Aviso Legal Terapéutico:</strong>{" "}
            {config.disclaimerLegal ||
              `Las terapias y actividades ofrecidas en ${config.name} (quiromasaje, reiki, registros akáshicos y ejercicios de respiración) son herramientas de bienestar integral, relajación y desarrollo personal. En ningún caso constituyen un acto médico oficial ni pretenden diagnosticar, tratar o sustituir tratamientos médicos, farmacológicos o psicológicos convencionales.`}
          </p>
        </div>

        {/* Créditos y Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7a8880]">
          <p>© {new Date().getFullYear()} {config.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[#dfc89f] fill-[#dfc89f]" />
            <span>para el bienestar consciente</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
