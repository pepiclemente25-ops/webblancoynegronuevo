"use client";

import React, { useState, useEffect } from "react";
import { SiteConfig, Therapy } from "@/types/content";
import { X, Calendar, MessageCircle, Clock, Check, Sparkles } from "lucide-react";
import Image from "next/image";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  therapies: Therapy[];
  preselectedService?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  config,
  therapies,
  preselectedService,
}) => {
  const [service, setService] = useState<string>(
    preselectedService || (therapies[0] ? therapies[0].title : "Quiromasaje & Masaje Terapéutico")
  );
  const [preferredSlot, setPreferredSlot] = useState<string>("Tardes (16:00 - 20:00)");
  const [clientName, setClientName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
    }
  }, [preselectedService]);

  if (!isOpen) return null;

  const timeSlots = [
    "Mañanas (09:30 - 13:30)",
    "Mediodía (13:30 - 16:00)",
    "Tardes (16:00 - 20:00)",
    "Sábado (Cita especial)",
  ];

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const nameText = clientName.trim() ? ` Me llamo ${clientName.trim()}.` : "";
    const notesText = notes.trim() ? ` Nota: "${notes.trim()}".` : "";
    const message = `Hola ${config.name}, me gustaría solicitar cita para *${service}* con preferencia horaria de *${preferredSlot}*.${nameText}${notesText} ¿Qué días tenéis disponibles?`;

    const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#e8e1d5] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="bg-[#2f9a3b] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f1faea] border border-[#7fd6c2]/40 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
              <Image
                src="/brand/logo-tarjeta.png"
                alt="Logo Blanco Negro"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold leading-tight">Solicitud de Cita</h3>
              <p className="text-xs text-white/80">{config.name} · Atención personalizada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido interactivo */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Mensaje de cortesía */}
          <div className="bg-[#f7fbef] border border-[#d3ebcf] rounded-2xl p-4 text-xs sm:text-sm text-[#46544c] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#b5935b] flex-shrink-0 mt-0.5" />
            <p>
              Elige la terapia y tu franja preferida. Te confirmaremos hueco disponible al instante y sin esperas.
            </p>
          </div>

          <form onSubmit={handleWhatsAppBooking} className="space-y-5">
            
            {/* 1. Selección de Terapia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2f9a3b] mb-2">
                1. Selecciona tu Terapia o Sesión:
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#cdeccb] bg-white text-sm text-[#212924] focus:outline-none focus:ring-2 focus:ring-[#2f9a3b] focus:border-transparent transition-all"
              >
                {therapies.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title} ({t.duration})
                  </option>
                ))}
                <option value="Consulta y Valoración Holística">
                  Consulta de Valoración Previa (30 min)
                </option>
                <option value="Sesión Combinada Quiromasaje + Reiki">
                  Sesión Combinada: Quiromasaje + Reiki (75 min)
                </option>
              </select>
            </div>

            {/* 2. Preferencia de Horario */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2f9a3b] mb-2">
                2. Preferencia de Horario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setPreferredSlot(slot)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between cursor-pointer transition-all ${
                      preferredSlot === slot
                        ? "bg-[#e3f5e0] border-[#2f9a3b] text-[#237a2d] font-semibold"
                        : "bg-white border-[#cfe6cb] text-[#4f5d54] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <span>{slot}</span>
                    {preferredSlot === slot && <Check className="w-3.5 h-3.5 text-[#2f9a3b]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Nombre y Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2f9a3b] mb-1.5">
                  Tu Nombre (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carmen Gómez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdeccb] text-sm text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9a3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2f9a3b] mb-1.5">
                  ¿Alguna molestia concreta?:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dolor cervical, insomnio..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdeccb] text-sm text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9a3b]"
                />
              </div>
            </div>

            {/* Botones de acción directa */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Reserva Rápida por WhatsApp</span>
              </button>

              {/* Botón de Google Calendar */}
              <div className="text-center">
                <a
                  href={config.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs font-medium text-[#2f9a3b] hover:underline"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver calendario de citas online (Google Calendar)</span>
                </a>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
