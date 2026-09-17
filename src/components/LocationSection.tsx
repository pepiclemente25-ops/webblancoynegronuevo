"use client";

import React, { useState } from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { MapPin, Phone, Mail, Clock, ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";

interface LocationSectionProps {
  config: SiteConfig;
  section?: WebSectionItem;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ config, section }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const lema = section?.contenido?.badge || section?.contenido?.lema || "Contacto y Preguntas Frecuentes";
  const titulo = section?.contenido?.tituloSeccion || section?.contenido?.titulo || section?.titulo || "Estamos Aquí para Acompañarte";
  const descripcion = section?.contenido?.descripcion || section?.subtitulo || "Resuelve cualquier duda sobre cómo llegar, las terapias o cómo preparar tu visita a nuestro centro.";

  const address = section?.contenido?.direccion || config.address;
  const city = section?.contenido?.ciudad || config.city;
  const googleMapsUrl = section?.contenido?.googleMapsUrl || config.googleMapsUrl;
  const schedule = section?.contenido?.horario || config.schedule;
  const phoneDisplay = section?.contenido?.telefono || config.phoneDisplay;
  const whatsapp = section?.contenido?.whatsapp || config.whatsapp;
  const email = section?.contenido?.email || config.email;

  const defaultFaqs = [
    {
      q: "¿Qué debo tener en cuenta antes de mi primera sesión de Quiromasaje?",
      a: "Te recomendamos acudir con ropa cómoda y no haber realizado una comida copiosa en la hora previa. Realizaremos una breve entrevista confidencial para conocer tu historial de lesiones o zonas de molestia antes de comenzar.",
    },
    {
      q: "¿En qué consiste una sesión de Reiki y cómo debo vestirme?",
      a: "En una sesión de Reiki permaneces completamente vestida en la camilla (solo te descalzas). La terapeuta posa suavemente sus manos en diferentes centros energéticos (chakras) sin manipular huesos ni músculos. Es una experiencia sumamente relajante y no invasiva.",
    },
    {
      q: "¿Se pueden realizar las lecturas de Registros Akáshicos a distancia?",
      a: "Sí, absolutamente. La energía del Akasha trasciende el espacio y el tiempo. Ofrecemos lecturas tanto presenciales en nuestro espacio en Boiro como en directo mediante videollamada por Zoom o WhatsApp, con la misma exactitud y profundidad.",
    },
    {
      q: "¿Las terapias holísticas sustituyen un tratamiento médico?",
      a: "No. Nuestras terapias manuales y energéticas actúan como un valioso acompañamiento holístico y preventivo del bienestar corporal y emocional, pero en ningún caso reemplazan el diagnóstico o prescripción de un facultativo médico colegiado.",
    },
    {
      q: "¿Con cuánta antelación puedo reservar o cancelar una cita?",
      a: "Aconsejamos reservar con al menos 2 a 4 días de antelación para asegurar tu franja horaria favorita. Si necesitas cancelar o posponer tu sesión, te agradecemos avisar con al menos 24 horas de antelación.",
    },
  ];

  const rawFaqs = (section?.contenido?.faqs && Array.isArray(section.contenido.faqs) && section.contenido.faqs.length > 0)
    ? section.contenido.faqs
    : (section?.contenido?.preguntas && Array.isArray(section.contenido.preguntas) && section.contenido.preguntas.length > 0)
    ? section.contenido.preguntas
    : defaultFaqs;

  const faqs = rawFaqs.map((f: any) => ({
    q: f.q || f.pregunta || f.p || "¿Consulta frecuente?",
    a: f.a || f.respuesta || f.r || "Información detallada...",
  }));

  return (
    <section id="contacto" className="py-24 bg-[#fbf9f5] border-t border-[#ece4d8] relative overflow-hidden">
      {/* Rama de hojas de bambú decorativa en esquina superior */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none opacity-15 lg:opacity-20 z-0 select-none">
        <Image
          src="/brand/bamboo-branch-right.webp"
          alt=""
          fill
          className="object-contain object-right-top"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf0ec] text-[#345041] text-xs font-semibold mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#b5935b]" />
            <span>{lema}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1e2621] font-normal tracking-tight mb-4">
            {titulo}
          </h2>
          <p className="text-base text-[#5a6a60] leading-relaxed">
            {descripcion}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Tarjetas de Información y Contacto Directo */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e1d5] shadow-sm space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#eaf0ec] text-[#3d5a4c] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-1">
                    Dirección
                  </h4>
                  <p className="text-sm font-semibold text-[#212924]">{address}</p>
                  <p className="text-xs text-[#627367] mt-0.5">{city}</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-[#b5935b] font-semibold hover:underline mt-2"
                  >
                    Abrir en Google Maps &rarr;
                  </a>
                </div>
              </div>

              <div className="border-t border-[#f0ebe1] pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#eaf0ec] text-[#3d5a4c] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-1">
                    Horario de Citas
                  </h4>
                  <p className="text-sm text-[#35433a] leading-relaxed">{schedule}</p>
                </div>
              </div>

              <div className="border-t border-[#f0ebe1] pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#eaf0ec] text-[#3d5a4c] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-1">
                    Teléfono & WhatsApp
                  </h4>
                  <p className="text-sm font-semibold text-[#212924]">{phoneDisplay}</p>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-semibold hover:underline mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Abrir conversación de WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="border-t border-[#f0ebe1] pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#eaf0ec] text-[#3d5a4c] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] mb-1">
                    Correo Electrónico
                  </h4>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-[#212924] hover:text-[#3d5a4c] font-medium"
                  >
                    {email}
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Acordeón de FAQs */}
          <div className="lg:col-span-7">
            <h3 className="font-serif text-2xl text-[#1e2621] font-semibold mb-6">
              Preguntas Frecuentes
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-[#e8e1d5] overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf7f2] transition-colors"
                    >
                      <span className="font-medium text-sm sm:text-base text-[#212924]">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#3d5a4c] transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#55645a] leading-relaxed border-t border-[#f3efe8]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
