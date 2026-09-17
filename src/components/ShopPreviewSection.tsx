"use client";

import React, { useState } from "react";
import { ShopProduct, SiteConfig, WebSectionItem } from "@/types/content";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Sparkles, ArrowRight, Check, Truck } from "lucide-react";
import Link from "next/link";

interface ShopPreviewSectionProps {
  products?: ShopProduct[];
  config: SiteConfig;
  section?: WebSectionItem;
  onOpenBooking?: (serviceName?: string) => void;
}

export const ShopPreviewSection: React.FC<ShopPreviewSectionProps> = ({
  products = [],
  config,
  section,
  onOpenBooking,
}) => {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const contenido = section?.contenido || {};
  const badge = contenido.badge || "Botánica Natural & Minerales";
  const titulo = contenido.tituloSeccion || section?.titulo || "Espacio Botánico y Minerales";
  const subtitulo = contenido.subtituloSeccion || section?.subtitulo || "Selección holística para tu bienestar personal y armonía en el hogar";
  const descripcion = contenido.descripcion || "Descubre nuestra selección de aceites esenciales puros de primera presión, minerales intencionados, sahumerios ancestrales y cosmética natural elaborada con respeto hacia los ciclos de la naturaleza.";
  const botonTexto = contenido.botonTexto || "Ver Catálogo Completo";
  const botonEnlace = contenido.botonEnlace || "/tienda";
  const notaPie = contenido.notaPie || "Disponible compra online y recogida física directa en nuestro centro de Boiro (A Coruña), así como envíos a domicilio.";
  const limite = Number(contenido.limiteProductos) || 6;
  const mostrarCarrito = contenido.mostrarCarrito !== false;

  // Filtrar productos visibles para catálogo
  const displayProducts = products
    .filter((p) => p.publicadoWeb !== false && !(p.accionAgotado === "ocultar" && !p.inStock))
    .slice(0, limite);

  const handleAddToCart = (e: React.MouseEvent, product: ShopProduct) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="productos" className="py-20 lg:py-24 bg-gradient-to-b from-[#fbf9f5] via-[#f7f3eb] to-[#fbf9f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b4332]/10 text-[#1b4332] text-xs font-semibold tracking-wide uppercase mb-3.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-4">
            {titulo}
          </h2>
          {subtitulo && (
            <p className="text-base sm:text-lg font-medium text-[#1b4332] mb-3">
              {subtitulo}
            </p>
          )}
          {descripcion && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {descripcion}
            </p>
          )}
        </div>

        {/* Cuadrícula de Productos */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {displayProducts.map((product) => {
              const isAdded = addedId === product.id;
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#e5ded3] hover:border-[#1b4332]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Imagen y badges */}
                  <Link href={`/tienda`} className="relative aspect-square overflow-hidden bg-gray-100 block">
                    <img
                      src={product.imageUrl || "/images/placeholder-product.webp"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Badge de categoría / destacado */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {product.badge ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#1b4332] text-white shadow-sm">
                          {product.badge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm border border-gray-100">
                          {product.categoryLabel || product.category}
                        </span>
                      )}
                    </div>

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                          Agotado Temporalmente
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Contenido de la tarjeta */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/tienda`} className="block">
                        <h3 className="font-serif font-bold text-lg text-gray-900 group-hover:text-[#1b4332] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.shortDescription && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      )}
                    </div>

                    {/* Precios y botón añadir */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-[#1b4332]">
                            {product.price.toFixed(2)} €
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice?.toFixed(2)} €
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">IVA 21% incluido</span>
                      </div>

                      {mostrarCarrito && product.inStock && (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                            isAdded
                              ? "bg-emerald-600 text-white shadow-sm scale-95"
                              : "bg-[#1b4332] text-white hover:bg-[#133024] shadow-sm hover:shadow active:scale-95"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Añadido</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Añadir</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 max-w-xl mx-auto mb-10 p-6">
            <p className="text-gray-500 text-sm">Catálogo de productos en actualización.</p>
          </div>
        )}

        {/* Botón hacia el catálogo completo */}
        <div className="text-center mb-10">
          <Link
            href={botonEnlace}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1b4332] hover:bg-[#133024] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>{botonTexto}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Nota al pie de entrega / recogida */}
        {notaPie && (
          <div className="max-w-2xl mx-auto rounded-xl bg-white/70 backdrop-blur-sm border border-[#e5ded3] p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#1b4332] shrink-0" />
              <span>{notaPie}</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
