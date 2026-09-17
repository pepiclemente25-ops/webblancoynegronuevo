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

  // Map each navigation link to the corresponding section template type (or types)
  const navLinkSectionMap: Record<string, string[]> = {
    "Terapias": ["terapias"],
    "Sobre el Espacio": ["sobre_mi"],
    "Chakras": ["chakras"],
    "Talleres": ["talleres"],
    "Armonización": ["armonizacion"],
    "Tienda": ["tienda"],
    "Reseñas": ["resenas"],
    "Contacto": ["contacto", "ubicacion", "reservas", "booking"],
  };

  const rawNavLinks = [
    { name: "Inicio", href: "/" },
    { name: "Terapias", href: "#terapias" },
    { name: "Sobre el Espacio", href: "#sobre-mi" },
    { name: "Chakras", href: "#chakras" },
    { name: "Talleres", href: "#talleres" },
    { name: "Armonización", href: "#armonizacion" },
    { name: "Tienda", href: "/tienda" },
    { name: "Reseñas", href: "#resenas" },
    { name: "Contacto", href: "#contacto" },
  ];

  // Si sections viene provisto, ocultar aquellos enlaces cuya sección esté explícitamente desactivada
  const navLinks = rawNavLinks.filter((link) => {
    if (link.name === "Inicio") return true;
    if (!sections || sections.length === 0) return true;

    const templates = navLinkSectionMap[link.name];
    if (!templates) return true;

    // Buscar si existe alguna sección configurada con esa plantilla
    const matchingSections = sections.filter((s) => templates.includes(s.tipoPlantilla));
    if (matchingSections.length === 0) return true; // Si no está en la lista de secciones, mantener visible

    // Si todas las secciones correspondientes están inactivas (activo === false), ocultar del menú
    return matchingSections.some((s) => s.activo);
  });

  // Resuelve si el link debe ir a la home con hash si estamos en /tienda
  const resolveHref = (href: string) => {
    if (href.startsWith("#")) {
      return pathname === "/" ? href : `/${href}`;
    }
    return href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#fbf9f5]/92 backdrop-blur-md shadow-sm py-3 border-b border-[#ece4d8]/80"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo con el Yin-Yang oficial */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-full bg-[#f6f2ea] border-2 border-[#3d5a4c]/20 overflow-hidden shadow-md flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
              <Image
                src="/brand/yinyang.webp"
                alt="Logo Blanco y Negro - Yin Yang"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-[#212924] block leading-tight">
                {config.name}
              </span>
              <span className="text-xs text-[#5e7065] tracking-wider uppercase font-medium block">
                Terapias Holísticas y Bienestar
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
              href={`https://wa.me/${config.whatsapp}?text=Hola%20${encodeURIComponent(
                config.name
              )},%20quisiera%20consultar%20información%20sobre%20tus%20terapias.`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full text-[#3d5a4c] hover:bg-[#eaf0ec] transition-colors"
              title="Contactar por WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </a>

            {/* Pedir Cita */}
            {onOpenBooking ? (
              <button
                onClick={() => onOpenBooking()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d5a4c] text-white font-medium text-sm shadow-sm hover:bg-[#2d473b] hover:shadow transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#dfc89f]" />
                <span>Pedir Cita</span>
              </button>
            ) : (
              <Link
                href="/#contacto"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3d5a4c] text-white font-medium text-sm shadow-sm hover:bg-[#2d473b] hover:shadow transition-all duration-200"
              >
                <Calendar className="w-4 h-4 text-[#dfc89f]" />
                <span>Pedir Cita</span>
              </Link>
            )}
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

            {onOpenBooking ? (
              <button
                onClick={() => onOpenBooking()}
                className="p-2 rounded-full bg-[#3d5a4c] text-white"
                title="Pedir Cita"
              >
                <Calendar className="w-4 h-4 text-[#dfc89f]" />
              </button>
            ) : (
              <Link
                href="/#contacto"
                className="p-2 rounded-full bg-[#3d5a4c] text-white"
                title="Pedir Cita"
              >
                <Calendar className="w-4 h-4 text-[#dfc89f]" />
              </Link>
            )}

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
