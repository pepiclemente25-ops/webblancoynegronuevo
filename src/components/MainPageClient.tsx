"use client";

import React, { useState } from "react";
import { WebData, WebSectionItem } from "@/types/content";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChakraStrip } from "@/components/ChakraStrip";
import { AboutSection } from "@/components/AboutSection";
import { TherapiesSection } from "@/components/TherapiesSection";
import { WorkshopsSection } from "@/components/WorkshopsSection";
import { HarmonizationSection } from "@/components/HarmonizationSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { BookingSection } from "@/components/BookingSection";
import { LocationSection } from "@/components/LocationSection";
import { GenericSection } from "@/components/GenericSection";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import Image from "next/image";

interface MainPageClientProps {
  data: WebData;
}

export const MainPageClient: React.FC<MainPageClientProps> = ({ data }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  const handleOpenBooking = (serviceName?: string) => {
    setPreselectedService(serviceName);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setPreselectedService(undefined);
  };

  const renderSectionComponent = (tipoPlantilla: string, key: string, section?: WebSectionItem) => {
    switch (tipoPlantilla) {
      case "hero":
        return <Hero key={key} config={data.config} onOpenBooking={() => handleOpenBooking()} section={section} />;
      case "chakras":
        return <ChakraStrip key={key} chakras={data.chakras} section={section} />;
      case "sobre_mi":
        return <AboutSection key={key} config={data.config} onOpenBooking={() => handleOpenBooking()} section={section} />;
      case "terapias":
        return <TherapiesSection key={key} therapies={data.therapies} onOpenBooking={handleOpenBooking} section={section} />;
      case "talleres":
        return <WorkshopsSection key={key} workshops={data.workshops} config={data.config} section={section} />;
      case "armonizacion":
        return <HarmonizationSection key={key} items={data.harmonization} config={data.config} section={section} />;
      case "resenas":
        return <ReviewsSection key={key} reviews={data.reviews} config={data.config} section={section} />;
      case "reservas":
      case "booking":
        return <BookingSection key={key} config={data.config} onOpenBooking={() => handleOpenBooking()} section={section} />;
      case "contacto":
      case "ubicacion":
        return <LocationSection key={key} config={data.config} section={section} />;
      case "texto_foto":
      case "tarjetas":
      case "banner":
      case "faq":
        return section ? <GenericSection key={key} section={section} config={data.config} onOpenBooking={() => handleOpenBooking()} /> : null;
      default:
        return section ? <GenericSection key={key} section={section} config={data.config} onOpenBooking={() => handleOpenBooking()} /> : null;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fbf9f5]">
      {/* Cañas de bambú zen ambientales fijas en los bordes de la pantalla (visibles en toda la navegación) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-32 xl:w-44 pointer-events-none z-0 opacity-15 xl:opacity-20 overflow-hidden select-none">
        <Image
          src="/brand/bamboo-left.webp"
          alt=""
          fill
          className="object-cover object-left"
          priority
        />
      </div>
      <div className="hidden lg:block fixed inset-y-0 right-0 w-32 xl:w-44 pointer-events-none z-0 opacity-15 xl:opacity-20 overflow-hidden select-none">
        <Image
          src="/brand/bamboo-right.webp"
          alt=""
          fill
          className="object-cover object-right"
          priority
        />
      </div>

      {/* Barra de navegación con soporte para ocultar links de secciones inactivas */}
      <Navbar config={data.config} sections={data.sections} onOpenBooking={handleOpenBooking} />

      {/* Contenido Principal */}
      <main className="flex-1 relative z-10">
        {data.sections && data.sections.length > 0 ? (
          data.sections
            .filter((s) => s.activo)
            .sort((a, b) => a.orden - b.orden)
            .map((s, idx) => renderSectionComponent(s.tipoPlantilla, s.id || `sec-${idx}`, s))
        ) : (
          <>
            <Hero config={data.config} onOpenBooking={() => handleOpenBooking()} />
            <ChakraStrip chakras={data.chakras} />
            <AboutSection config={data.config} onOpenBooking={() => handleOpenBooking()} />
            <TherapiesSection therapies={data.therapies} onOpenBooking={handleOpenBooking} />
            <WorkshopsSection workshops={data.workshops} config={data.config} />
            <HarmonizationSection items={data.harmonization} config={data.config} />
            <ReviewsSection reviews={data.reviews} config={data.config} />
            <BookingSection config={data.config} onOpenBooking={() => handleOpenBooking()} />
            <LocationSection config={data.config} />
          </>
        )}
      </main>

      {/* Pie de página */}
      <Footer config={data.config} />

      {/* Modal interactivo de reservas */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        config={data.config}
        therapies={data.therapies}
        preselectedService={preselectedService}
      />
    </div>
  );
};
