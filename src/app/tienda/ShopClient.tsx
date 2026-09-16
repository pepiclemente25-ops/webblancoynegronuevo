"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SiteConfig, ShopProduct, Therapy } from "@/types/content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Store,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ShopClientProps {
  config: SiteConfig;
  products: ShopProduct[];
  therapies: Therapy[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
type FilterType = "all" | "products" | "services";

export const ShopClient: React.FC<ShopClientProps> = ({ config, products, therapies }) => {
  const { addToCart } = useCart();
  
  // Filtros y búsqueda
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Estados de interfaz
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Generación de categorías dinámicas con conteos reales
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "otros";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = [
      { id: "all", label: "Todo el catálogo", count: products.length },
      {
        id: "aromaterapia",
        label: "Aromaterapia & Esencias",
        count: counts["aromaterapia"] || 0,
      },
      {
        id: "minerales",
        label: "Minerales & Gemas",
        count: counts["minerales"] || 0,
      },
      {
        id: "herramientas",
        label: "Herramientas de Masaje",
        count: counts["herramientas"] || 0,
      },
      {
        id: "armonizacion",
        label: "Armonización & Sahumerios",
        count: (counts["armonizacion"] || 0) + (counts["espacios"] || 0),
      },
      {
        id: "terapias",
        label: "Terapias & Masajes",
        count: products.filter(
          (p) => p.esServicio || p.category === "terapias" || p.categoryLabel?.toLowerCase().includes("terapia")
        ).length,
      },
    ];

    return list.filter((c) => c.id === "all" || c.count > 0);
  }, [products]);

  // Filtrado y ordenación
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      // 1. Filtro de Categoría
      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory ||
        (selectedCategory === "terapias" && (product.esServicio || product.category === "terapias" || product.categoryLabel?.toLowerCase().includes("terapia"))) ||
        (selectedCategory === "armonizacion" && (product.category === "espacios" || product.category === "armonizacion"));

      // 2. Filtro de Tipo (Producto físico vs Servicio/Terapia)
      const matchesType =
        filterType === "all" ||
        (filterType === "services" && (product.esServicio || product.category === "terapias")) ||
        (filterType === "products" && !product.esServicio && product.category !== "terapias");

      // 3. Búsqueda por texto
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query) ||
        product.categoryLabel?.toLowerCase().includes(query) ||
        (product.benefits && product.benefits.some((b) => b.toLowerCase().includes(query)));

      return matchesCategory && matchesType && matchesSearch;
    });

    // Ordenación
    result = [...result].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "es");
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, "es");
      // "featured" default: productos con badge primero
      if (a.badge && !b.badge) return -1;
      if (!a.badge && b.badge) return 1;
      return 0;
    });

    return result;
  }, [products, selectedCategory, filterType, searchQuery, sortBy]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, filterType, searchQuery, sortBy, itemsPerPage]);

  // Cálculo de Paginación
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPaginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const handleAddToCart = (product: ShopProduct) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setFilterType("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fbf9f5] text-[#212924]">
      {/* Cañas de bambú zen ambientales fijas en los bordes */}
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

      {/* Barra de navegación */}
      <Navbar config={config} onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 relative z-10 pt-28 pb-20">
        {/* Cabecera / Hero Limpio y Compacto */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <nav className="flex items-center gap-2 text-xs text-[#6e7d73] mb-3">
            <Link href="/" className="hover:text-[#3d5a4c] transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[#3d5a4c] font-semibold">Tienda Holística</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#ece4d8]">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2ecdf] border border-[#e0d8ca] text-[11px] font-semibold text-[#3d5a4c] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#b08d4b]" />
                <span>Autocuidado & Bienestar en Casa</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#212924]">
                Catálogo Holístico & Tienda
              </h1>
              <p className="text-xs sm:text-sm text-[#55645a] leading-relaxed">
                Aceites esenciales puros, minerales energéticos, herramientas terapéuticas y bonos de masaje seleccionados artesanalmente.
              </p>
            </div>

            {/* Micro-aviso de compra rápida */}
            <div className="hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e8ded0] text-xs shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#eaf4ee] text-[#3d5a4c] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-[#212924] block">Recogida en Boiro o Envío</span>
                <span className="text-[#6e7d73]">Pago cómodo por Bizum o en tienda</span>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Filtros, Búsqueda y Ordenación Profesional */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 space-y-4">
          {/* Fila superior: Categorías horizontales */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
                    isSelected
                      ? "bg-[#3d5a4c] text-white shadow-sm ring-2 ring-[#3d5a4c]/20"
                      : "bg-white border border-[#e0d8cc] text-[#4a584f] hover:bg-[#f6f2ea] hover:border-[#cbdbd0]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#f0ebe1] text-[#6e7d73]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fila de controles: Buscador + Tipo + Ordenación + Items por Página */}
          <div className="bg-white rounded-2xl border border-[#ece4d8] p-3 sm:p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#718276] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, beneficio o ingrediente..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#fbf9f5] border border-[#d8d0c2] text-[#212924] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3d5a4c]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Controles secundarios */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {/* Filtro de Tipo */}
              <div className="inline-flex rounded-xl bg-[#f4efe5] p-0.5 border border-[#e5dcce]">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-white text-[#212924] shadow-2xs font-semibold"
                      : "text-[#6e7d73] hover:text-[#212924]"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType("products")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === "products"
                      ? "bg-white text-[#212924] shadow-2xs font-semibold"
                      : "text-[#6e7d73] hover:text-[#212924]"
                  }`}
                >
                  Productos
                </button>
                <button
                  onClick={() => setFilterType("services")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === "services"
                      ? "bg-white text-[#212924] shadow-2xs font-semibold"
                      : "text-[#6e7d73] hover:text-[#212924]"
                  }`}
                >
                  Terapias
                </button>
              </div>

              {/* Selector de Ordenación */}
              <div className="flex items-center gap-1.5 bg-[#fbf9f5] border border-[#d8d0c2] px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#3d5a4c]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs text-[#212924] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="name-asc">Nombre: A - Z</option>
                  <option value="name-desc">Nombre: Z - A</option>
                </select>
              </div>

              {/* Selector por página */}
              <div className="hidden sm:flex items-center gap-1.5 text-[#6e7d73] pl-2 border-l border-[#e8ded0]">
                <span>Ver:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-[#fbf9f5] border border-[#d8d0c2] rounded-lg px-2 py-1 text-xs text-[#212924] focus:outline-none cursor-pointer font-medium"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={999}>Todos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Barra de Estado / Resumen */}
          <div className="flex items-center justify-between px-1 text-xs text-[#6e7d73]">
            <span>
              Mostrando{" "}
              <strong className="text-[#212924]">
                {totalItems > 0 ? `${startIndex + 1}–${endIndex}` : 0}
              </strong>{" "}
              de <strong className="text-[#212924]">{totalItems}</strong> productos
              {totalItems !== products.length && ` (filtrado de ${products.length} totales)`}
            </span>

            {(selectedCategory !== "all" || filterType !== "all" || searchQuery || sortBy !== "featured") && (
              <button
                onClick={handleResetFilters}
                className="text-[#3d5a4c] font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Limpiar filtros</span>
                <span className="text-[10px] bg-[#eaf0ec] text-[#3d5a4c] px-1.5 py-0.2 rounded-full">✕</span>
              </button>
            )}
          </div>
        </section>

        {/* Rejilla de Productos */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {totalItems === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#ece4d8] p-8 max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#f4efe5] text-[#3d5a4c] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#212924]">
                No encontramos productos con ese filtro
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Prueba con otro término o restablece los filtros para ver todo el catálogo.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3d5a4c] text-white text-xs font-semibold shadow-xs hover:bg-[#2d473b] transition-all cursor-pointer"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentPaginatedProducts.map((product) => {
                const isJustAdded = addedProductId === product.id;
                const isOutOfStock = !product.inStock && !product.esServicio;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ece4d8] shadow-2xs hover:shadow-md hover:border-[#cbdbd0] transition-all duration-300"
                  >
                    {/* Imagen del producto con badge */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#f4efe5]">
                      <Image
                        src={product.imageUrl || "/images/placeholder-product.webp"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badges superiores */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {product.badge ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#3d5a4c]/90 backdrop-blur-xs text-[#dfc89f] text-[10px] font-bold shadow-xs">
                            {product.badge}
                          </span>
                        ) : product.esServicio ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#2d473b]/90 backdrop-blur-xs text-white text-[10px] font-semibold shadow-xs">
                            Sesión Presencial
                          </span>
                        ) : <span />}

                        {isOutOfStock && (
                          <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-xs">
                            Agotado
                          </span>
                        )}
                      </div>

                      {/* Categoría pill */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#212924] text-[10px] font-semibold shadow-2xs">
                          {product.categoryLabel || "Bienestar"}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-serif text-base font-semibold text-[#212924] group-hover:text-[#3d5a4c] transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-xs text-[#5e7065] line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>

                        {/* Beneficios clave */}
                        {product.benefits && product.benefits.length > 0 && (
                          <div className="pt-2 border-t border-[#f4efe5] space-y-1">
                            {product.benefits.slice(0, 2).map((b, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#4a584f]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5a4c] flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Precio y Botón Añadir */}
                      <div className="pt-3 border-t border-[#ece4d8] flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-xl font-serif font-bold text-[#212924]">
                              {product.price.toFixed(2)}€
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {product.originalPrice.toFixed(2)}€
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#718276] block">
                            {product.esServicio ? "Por sesión" : "IVA incluido"}
                          </span>
                        </div>

                        {product.esServicio ? (
                          <button
                            onClick={() => setIsBookingOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#f4efe5] hover:bg-[#eae3d5] text-[#3d5a4c] font-semibold text-xs transition-all cursor-pointer border border-[#e5dcce]"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Reservar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                              isOutOfStock
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isJustAdded
                                ? "bg-[#25D366] text-white scale-105"
                                : "bg-[#3d5a4c] hover:bg-[#2d473b] text-white hover:shadow-xs"
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>¡Añadido!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4 text-[#dfc89f]" />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación Profesional */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#ece4d8]">
              <span className="text-xs text-[#6e7d73]">
                Página <strong className="text-[#212924]">{currentPage}</strong> de{" "}
                <strong className="text-[#212924]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Botón Anterior */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Números de Página */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#3d5a4c] text-white shadow-2xs"
                        : "bg-white border border-[#e0d8cc] text-[#4a584f] hover:bg-[#f6f2ea]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Botón Siguiente */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Sección Discreta al Final: ¿Cómo comprar y métodos de pago? (Bizum, Tienda y Envío) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-3xl border border-[#ece4d8] overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsFaqOpen(!isFaqOpen)}
              className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-[#faf7f2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f4efe5] text-[#3d5a4c] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#212924]">
                    ¿Cómo funciona el pedido, recogida en Boiro y pago con Bizum?
                  </h3>
                  <p className="text-xs text-[#6e7d73]">
                    Pulsa para ver los 4 pasos sencillos y transparentes de compra.
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#fbf9f5] text-[#3d5a4c] border border-[#e5dcce]">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isFaqOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {isFaqOpen && (
              <div className="p-6 sm:p-8 pt-0 border-t border-[#f4efe5] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ece4d8] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3d5a4c] text-[#dfc89f] font-serif font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-serif font-semibold text-xs text-[#212924]">
                    Elige tus artículos
                  </h4>
                  <p className="text-xs text-[#55645a] leading-relaxed">
                    Añade a tu cesta los aceites botánicos, minerales o saquitos que desees.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ece4d8] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3d5a4c] text-[#dfc89f] font-serif font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="font-serif font-semibold text-xs text-[#212924]">
                    Recogida o Envío
                  </h4>
                  <p className="text-xs text-[#55645a] leading-relaxed">
                    Elige <strong>recogida gratis en tienda (Boiro)</strong> o <strong>envío a domicilio</strong> indicando tus datos de contacto.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ece4d8] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3d5a4c] text-[#dfc89f] font-serif font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="font-serif font-semibold text-xs text-[#212924]">
                    Código Oficial
                  </h4>
                  <p className="text-xs text-[#55645a] leading-relaxed">
                    Tu pedido se registra al instante en nuestra base de datos y obtienes tu número oficial (ej. #BYN-8421).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ece4d8] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3d5a4c] text-[#dfc89f] font-serif font-bold text-xs flex items-center justify-center">
                    4
                  </div>
                  <h4 className="font-serif font-semibold text-xs text-[#212924]">
                    Bizum o en Tienda
                  </h4>
                  <p className="text-xs text-[#55645a] leading-relaxed">
                    Envía el Bizum con un clic indicando tu número de comanda, o abónalo al retirar tu paquete en Boiro.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Banner Cross-Sell: Cita Presencial en Boiro */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#3d5a4c] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-[#dfc89f] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Experiencia Integral</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold leading-snug">
                ¿Prefieres visitarnos y recibir asesoramiento en tienda?
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Reserva una sesión de quiromasaje descontracturante o armonización Reiki en nuestro espacio en Boiro. Podrás probar los aceites y elegir tus cristales directamente durante tu visita.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#2d473b] font-semibold text-sm shadow hover:bg-[#f6f2ea] transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#3d5a4c]" />
                <span>Pedir Cita Presencial</span>
              </button>
              <Link
                href="/#terapias"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                <span>Ver Terapias &rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <Footer config={config} />

      {/* Modal interactivo de reservas */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        config={config}
        therapies={therapies}
      />
    </div>
  );
};
