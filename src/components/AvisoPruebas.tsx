import React from "react";
import { MOSTRAR_AVISO_PRUEBAS, TEXTO_AVISO_PRUEBAS } from "@/lib/site";

/** Franja fina fija arriba. Se activa/desactiva con MOSTRAR_AVISO_PRUEBAS en src/lib/site.ts */
export const AvisoPruebas: React.FC = () => {
  if (!MOSTRAR_AVISO_PRUEBAS) return null;
  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-50 h-11 sm:h-8 flex items-center justify-center px-3 bg-[#1fa5bd] text-white text-[11px] sm:text-xs font-bold tracking-normal sm:tracking-wide text-center"
    >
      <span className="leading-tight">{TEXTO_AVISO_PRUEBAS}</span>
    </div>
  );
};
