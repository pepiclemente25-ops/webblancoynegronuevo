"use client";

import React, { useState, useEffect } from "react";
import { SiteConfig, WebSectionItem } from "@/types/content";
import { Calendar, Menu, X, Phone, MessageCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  config: SiteConfig;
  sections?: WebSectionItem[];
  onOpenBooking?: (preselectedService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, sections, onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/#inicio" },
    { name: "Tienda", href: "/#tienda" },
    { name: "Bienestar", href: "/#bienestar" },
    { name: "Terapias", href: "/#carta-terapias" },
    { name: "El espacio", href: "/#sobre-mi" },
  ];

  const resolveHref = (href: string) => {
    return href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#fbf9f5]/95 backdrop-blur-md shadow-sm py-2.5 sm:py-3 border-b border-[#ece4d8]/80"
          : "bg-[#fbf9f5]/90 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none py-2.5 sm:py-5 border-b border-[#ece4d8]/60 sm:border-b-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo con el Yin-Yang oficial */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f6f2ea] border-2 border-[#3d5a4c]/20 overflow-hidden shadow-md flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
              <Image
                src="/brand/yinyang.webp"
                alt="Logo Blanco y Negro - Yin Yang"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              {/* En móvil mostramos el nombre de marca conciso para evitar que ocupe múltiples líneas */}
              <span className="sm:hidden font-serif text-base font-bold tracking-wide text-[#212924] block leading-tight truncate">
                Blanco y Negro
              </span>
              <span className="hidden sm:block font-serif text-xl sm:text-2xl font-semibold tracking-wide text-[#212924] leading-tight truncate">
                {config.name}
              </span>
              <span className="text-[10px] sm:text-xs text-[#5e7065] tracking-wider uppercase font-medium hidden sm:block truncate max-w-xs sm:max-w-md">
                {config.tagline && !config.tagline.toLowerCase().includes("ticket") && !config.tagline.toLowerCase().includes("visita")
                  ? config.tagline
                  : "Terapias Holísticas y Bienestar"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navLinks.map((link) => {
              const href = resolveHref(link.href);
              const isTiendaActive = link.href === "/tienda" && pathname === "/tienda";

              return (
                <Link
                  key={link.name}
                  href={href}
                  className={`text-sm font-medium transition-all relative py-1 flex items-center gap-1.5 ${
                    isTiendaActive
                      ? "text-[#2d473b] font-bold border-b-2 border-[#3d5a4c]"
                      : "text-[#414d45] hover:text-[#2d473b] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3d5a4c] hover:after:w-full after:transition-all"
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#3d5a4c] hover:bg-[#eaf0ec] transition-colors cursor-pointer group"
              title="Ver Cesta de la Tienda"
              aria-label="Ver Cesta"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#3d5a4c] text-[#dfc89f] text-[11px] font-bold flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola ${config.name}, quisiera consultar información sobre tus terapias.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full text-[#25D366] hover:bg-[#eaf0ec] transition-transform hover:scale-110"
              title="Contactar por WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>

            {/* Pedir Cita - Abre WhatsApp directamente */}
            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola ${config.name}, deseo agendar una cita.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d5a4c] text-white font-medium text-sm shadow-sm hover:bg-[#2d473b] hover:shadow transition-all duration-200 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#dfc89f]" />
              <span>Pedir Cita</span>
            </a>
          </div>

          {/* Mobile hamburger & cart */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full bg-[#eaf0ec] text-[#3d5a4c]"
              title="Ver Cesta"
              aria-label="Ver Cesta"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3d5a4c] text-white text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola ${config.name}, deseo agendar una cita.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#3d5a4c] text-white"
              title="Pedir Cita por WhatsApp"
            >
              <Calendar className="w-4 h-4 text-[#dfc89f]" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#212924] rounded-lg hover:bg-[#f0ebe1]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-4 border-t border-[#ece4d8] bg-[#fbf9f5] rounded-2xl p-4 shadow-lg">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const href = resolveHref(link.href);
                return (
                  <Link
                    key={link.name}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#2d473b] hover:bg-[#f0ebe1] rounded-lg flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-[#ece4d8] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#eaf0ec] text-[#2d473b] font-medium text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#3d5a4c]" />
                  <span>Ver Cesta ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})</span>
                </button>

                {onOpenBooking && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBooking();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#3d5a4c] text-white font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#dfc89f]" />
                    <span>Pedir Cita</span>
                  </button>
                )}

                <a
                  href={`tel:${config.phone}`}
                  className="w-full py-2.5 rounded-xl bg-[#f0ebe1] text-[#2d473b] font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar: {config.phoneDisplay}</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
