"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SiteConfig,
  ShopProduct,
  Therapy,
  WebSectionItem,
  FamiliaItem,
  BienestarPropositoItem,
  ExperienciaEstrellaData,
} from "@/types/content";
import { defaultFamilias, defaultBienestares, defaultExperienciaEstrella } from "@/lib/content";
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
  ChevronsRight,
  ChevronsLeft,
  ArrowUpDown,
  Store,
  HelpCircle,
  ChevronDown,
  X,
  Plus,
  Minus,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  MessageCircle,
  Check,
  Shield,
  Heart,
  Sun,
  Flame,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ShopClientProps {
  config: SiteConfig;
  products: ShopProduct[];
  therapies: Therapy[];
  sections?: WebSectionItem[];
  familias?: FamiliaItem[];
  bienestares?: BienestarPropositoItem[];
  experienciaEstrella?: ExperienciaEstrellaData;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
type FilterType = "all" | "products" | "services";

export const ShopClient: React.FC<ShopClientProps> = ({
  config,
  products,
  therapies,
  sections,
  familias,
  bienestares,
  experienciaEstrella,
}) => {
  const { addToCart } = useCart();

  // Familias y Bienestares configurados
  const activeFamilias = useMemo(() => {
    return familias && familias.length > 0
      ? familias.filter((f) => f.activa !== false)
      : defaultFamilias;
  }, [familias]);

  const activeBienestares = useMemo(() => {
    return bienestares && bienestares.length > 0
      ? bienestares.filter((b) => b.activo !== false).sort((a, b) => (a.orden || 0) - (b.orden || 0))
      : defaultBienestares;
  }, [bienestares]);

  const activeExperienciaEstrella = useMemo(() => {
    return experienciaEstrella || defaultExperienciaEstrella;
  }, [experienciaEstrella]);

  // Filtros y búsqueda
  const [selectedFamilia, setSelectedFamilia] = useState<string>("all");
  const [selectedFamiliasFilter, setSelectedFamiliasFilter] = useState<string[]>([]);
  const [selectedBienestaresFilter, setSelectedBienestaresFilter] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Drawer de filtros flotante
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Estados de interfaz
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceName, setBookingServiceName] = useState<string | undefined>(undefined);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Modal de Producto Ampliado y Carrusel de 3 segundos
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalJustAdded, setModalJustAdded] = useState(false);

  // Manejo a prueba de fallos de imágenes
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const DEFAULT_FALLBACK_IMG =
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80";

  // Conteo dinámico de productos por Familia
  const familiaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.familiaId) {
        counts[p.familiaId] = (counts[p.familiaId] || 0) + 1;
      }
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Conteo dinámico de productos por Bienestar
  const bienestarCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.bienestarId) {
        counts[p.bienestarId] = (counts[p.bienestarId] || 0) + 1;
      }
      if (p.bienestarIds && Array.isArray(p.bienestarIds)) {
        p.bienestarIds.forEach((bId) => {
          counts[bId] = (counts[bId] || 0) + 1;
        });
      }
    });
    return counts;
  }, [products]);

  // Número total de filtros activos para badges
  const totalActiveFilters = useMemo(() => {
    let count = 0;
    if (selectedFamilia !== "all") count++;
    count += selectedFamiliasFilter.length;
    count += selectedBienestaresFilter.length;
    if (filterType !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedFamilia, selectedFamiliasFilter, selectedBienestaresFilter, filterType, searchQuery]);

  // Filtrado y ordenación
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      // 1. Filtro de Familia en barra horizontal superior
      if (selectedFamilia !== "all") {
        const matchFam =
          product.familiaId === selectedFamilia ||
          product.familiaNombre?.toLowerCase() === selectedFamilia.toLowerCase() ||
          product.category === selectedFamilia;
        if (!matchFam) return false;
      }

      // 2. Filtro de Familias multi-select desde drawer lateral
      if (selectedFamiliasFilter.length > 0) {
        const matchAnyFam = selectedFamiliasFilter.some(
          (famId) =>
            product.familiaId === famId ||
            product.familiaNombre?.toLowerCase() === famId.toLowerCase() ||
            product.category === famId
        );
        if (!matchAnyFam) return false;
      }

      // 3. Filtro de Bienestar Propósitos (multi-select o clic en tarjeta)
      if (selectedBienestaresFilter.length > 0) {
        const matchAnyBienestar = selectedBienestaresFilter.some(
          (bId) =>
            product.bienestarId === bId ||
            (product.bienestarIds && product.bienestarIds.includes(bId)) ||
            (bId === "calma-ansiedad" &&
              (product.category === "aromaterapia" ||
                product.benefits?.some(
                  (b) => b.toLowerCase().includes("calm") || b.toLowerCase().includes("relaj")
                ))) ||
            (bId === "energia-vitalidad" &&
              (product.category === "minerales" ||
                product.benefits?.some(
                  (b) => b.toLowerCase().includes("energ") || b.toLowerCase().includes("vital")
                ))) ||
            (bId === "armonizacion-hogar" &&
              (product.category === "armonizacion" ||
                product.category === "inciensos" ||
                product.benefits?.some(
                  (b) => b.toLowerCase().includes("limpieza") || b.toLowerCase().includes("hogar")
                ))) ||
            (bId === "abundancia-prosperidad" &&
              (product.category === "velas" ||
                product.benefits?.some(
                  (b) =>
                    b.toLowerCase().includes("abundanc") || b.toLowerCase().includes("prosper")
                )))
        );
        if (!matchAnyBienestar) return false;
      }

      // 4. Filtro de Tipo (Todos / Productos físicos / Terapias)
      if (filterType === "products" && product.esServicio) return false;
      if (
        filterType === "services" &&
        !product.esServicio &&
        product.category !== "terapias"
      ) {
        return false;
      }

      // 5. Búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query) ||
          product.fullDescription.toLowerCase().includes(query) ||
          (product.categoryLabel && product.categoryLabel.toLowerCase().includes(query)) ||
          (product.familiaNombre && product.familiaNombre.toLowerCase().includes(query)) ||
          (product.benefits && product.benefits.some((b) => b.toLowerCase().includes(query)));
        if (!matchesSearch) return false;
      }

      return true;
    });

    // Ordenación
    result = [...result].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "es");
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, "es");
      if (a.badge && !b.badge) return -1;
      if (!a.badge && b.badge) return 1;
      return 0;
    });

    return result;
  }, [
    products,
    selectedFamilia,
    selectedFamiliasFilter,
    selectedBienestaresFilter,
    filterType,
    searchQuery,
    sortBy,
  ]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedFamilia,
    selectedFamiliasFilter,
    selectedBienestaresFilter,
    filterType,
    searchQuery,
    sortBy,
    itemsPerPage,
  ]);

  // Cálculo de Paginación
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPaginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Imágenes activas para el modal de producto
  const activeProductImages = useMemo(() => {
    if (!selectedProduct) return [];
    let list: string[] = [];
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      list = selectedProduct.images;
    } else if (selectedProduct.imageUrl) {
      list = [selectedProduct.imageUrl];
    } else {
      list = [DEFAULT_FALLBACK_IMG];
    }
    return list.map((img, idx) => {
      const key = `${selectedProduct.id}-modal-${idx}`;
      return failedImages[key] ? DEFAULT_FALLBACK_IMG : img;
    });
  }, [selectedProduct, failedImages]);

  // Rotación automática cada 3 segundos (pausable por hover)
  useEffect(() => {
    if (!selectedProduct || activeProductImages.length <= 1 || isCarouselPaused) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % activeProductImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedProduct, activeProductImages.length, isCarouselPaused]);

  // Navegación por teclado (Esc para cerrar, flechas para navegar fotos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProduct) return;
      if (e.key === "Escape") {
        setSelectedProduct(null);
      } else if (e.key === "ArrowLeft" && activeProductImages.length > 1) {
        setCurrentImgIndex(
          (prev) => (prev - 1 + activeProductImages.length) % activeProductImages.length
        );
      } else if (e.key === "ArrowRight" && activeProductImages.length > 1) {
        setCurrentImgIndex((prev) => (prev + 1) % activeProductImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct, activeProductImages.length]);

  const handleOpenProduct = (product: ShopProduct) => {
    setSelectedProduct(product);
    setCurrentImgIndex(0);
    setIsCarouselPaused(false);
    setModalQuantity(1);
    setModalJustAdded(false);
  };

  const handleAddToCart = (product: ShopProduct) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, modalQuantity);
    setModalJustAdded(true);
    setTimeout(() => setModalJustAdded(false), 2000);
  };

  const handleResetFilters = () => {
    setSelectedFamilia("all");
    setSelectedFamiliasFilter([]);
    setSelectedBienestaresFilter([]);
    setFilterType("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const handleOpenBooking = (serviceName?: string) => {
    setBookingServiceName(serviceName);
    setIsBookingOpen(true);
  };

  const handleSelectBienestarCard = (bienestarId: string) => {
    setSelectedBienestaresFilter([bienestarId]);
    setSelectedFamilia("all");
    setFilterType("all");
    const tiendaEl = document.getElementById("tienda");
    if (tiendaEl) {
      tiendaEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getServiceDuration = (item: any): string | undefined => {
    if (item.duracionMinutos) return `${item.duracionMinutos} min`;
    if (item.duration) return item.duration;
    return undefined;
  };

  // Terapias y Cuidados divididos en 2 columnas
  const terapiasHolisticas = useMemo(() => {
    const dbItems = products
      .filter((p) => p.esServicio && p.tipoServicio === "terapia" && p.publicadoWeb !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    if (dbItems.length > 0) return dbItems;
    return [
      {
        id: "reiki-usui",
        name: "Reiki Usui Tradicional",
        duration: "60 min",
        shortDescription:
          "Imposición de manos para desatar nudos emocionales, disolver el estrés y alinear los 7 chakras.",
        price: 45,
        imageUrl:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
        badge: "Esencial Holístico",
        esServicio: true,
      },
      {
        id: "reiki-cuantico",
        name: "Reiki Cuántico & Emocional",
        duration: "75 min",
        shortDescription:
          "Trabajo en planos sutiles para patrones de apego, duelos o agotamiento crónico persistente.",
        price: 55,
        imageUrl:
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
        badge: "Transformador",
        esServicio: true,
      },
      {
        id: "cuencos-tibetanos",
        name: "Cuencos Tibetanos & Sonido",
        duration: "50 min",
        shortDescription:
          "Masaje sonoro con cuencos de 7 metales apoyados sobre el cuerpo para afinar cada célula.",
        price: 42,
        imageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        badge: "Vibracional",
        esServicio: true,
      },
    ];
  }, [products]);

  const cuidadosManuales = useMemo(() => {
    const dbItems = products
      .filter((p) => p.esServicio && p.tipoServicio === "cuidado" && p.publicadoWeb !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    if (dbItems.length > 0) return dbItems;
    return [
      {
        id: "quiromasaje-terapeutico",
        name: "Quiromasaje Terapéutico",
        duration: "50 min",
        shortDescription:
          "Alivio inmediato de contracturas en espalda, trapecios y cuello con bálsamos naturales de árnica.",
        price: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
        badge: "Más Demandado",
        esServicio: true,
      },
      {
        id: "masaje-ayurvedico",
        name: "Masaje Ayurvédico Abhyanga",
        duration: "60 min",
        shortDescription:
          "Pases envolventes con aceite tibio de sésamo y esencias botánicas. Drenaje profundo y relajación.",
        price: 48,
        imageUrl:
          "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80",
        badge: "Revitalizante",
        esServicio: true,
      },
      {
        id: "fangoterapia-marina",
        name: "Fangoterapia Marina",
        duration: "45 min",
        shortDescription:
          "Envoltura desintoxicante de arcillas marinas tibias con toallas calientes. Remineraliza tejidos.",
        price: 38,
        imageUrl:
          "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
        badge: "Desintoxicante",
        esServicio: true,
      },
    ];
  }, [products]);

  const tiendaSection = sections?.find((s) => s.tipoPlantilla === "tienda" || s.idSeccion === "sec-tienda");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fbf9f5] text-[#212924] scroll-smooth">
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

      {/* Navbar con control de secciones activas */}
      <Navbar config={config} sections={sections} onOpenBooking={handleOpenBooking} />

      {/* Botón flotante para abrir el panel de filtrado en el lateral derecho */}
      <button
        onClick={() => setIsFilterDrawerOpen(true)}
        className="fixed right-4 sm:right-6 bottom-6 sm:bottom-8 z-40 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-[#3d5a4c] hover:bg-[#2d473b] text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
        title="Abrir filtros avanzados"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#dfc89f] group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">Filtros</span>
        {totalActiveFilters > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#dfc89f] text-[#24352b] text-[11px] font-black flex items-center justify-center shadow-xs">
            {totalActiveFilters}
          </span>
        )}
      </button>

      <main className="flex-1 relative z-10 pt-28 pb-20">
        {/* Cabecera / Hero Limpio */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
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
                <span>{tiendaSection?.contenido?.badge || "Autocuidado & Bienestar en Casa"}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#212924]">
                {tiendaSection?.titulo || "Catálogo Holístico & Tienda"}
              </h1>
              <p className="text-xs sm:text-sm text-[#55645a] leading-relaxed">
                {tiendaSection?.contenido?.descripcion ||
                  (config.city
                    ? `Herramientas botánicas, minerales energéticos, aromaterapia pura y sesiones de cuidado en ${config.city}.`
                    : "Herramientas botánicas, minerales energéticos, aromaterapia pura y sesiones de cuidado.")}
              </p>
            </div>

            {/* Micro-aviso de compra rápida */}
            <div className="hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e8ded0] text-xs shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#eaf4ee] text-[#3d5a4c] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-[#212924] block">
                  Recogida en {config.city || "tienda"} o Envío
                </span>
                <span className="text-[#6e7d73]">Pago cómodo por Bizum o en tienda</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECCIÓN 1: CATEGORÍAS DE PRODUCTOS (BARRA HORIZONTAL) ================= */}
        <section id="tienda" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6e7d73]">
              Categorías de Productos
            </h2>
            {selectedFamilia !== "all" && (
              <button
                onClick={() => setSelectedFamilia("all")}
                className="text-[11px] text-[#3d5a4c] font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Mostrar todas</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Selector horizontal de Categorías con conteos reales en cajita estilo superior */}
          <div className="inline-flex p-1.5 sm:p-2 bg-[#eae2d5] rounded-2xl sm:rounded-3xl shadow-inner flex-wrap items-center gap-1.5 sm:gap-2 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedFamilia("all")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFamilia === "all"
                  ? "bg-white text-[#1c2720] shadow-sm"
                  : "text-[#4a584f] hover:text-[#1c2720] hover:bg-white/40"
              }`}
            >
              <span>Todos</span>
              <span className="text-[11px] opacity-75">({products.length})</span>
            </button>

            {activeFamilias.map((fam) => {
              const isSelected = selectedFamilia === fam.id;
              const count = familiaCounts[fam.id] || 0;
              return (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setSelectedFamilia(fam.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-white text-[#1c2720] shadow-sm"
                      : "text-[#4a584f] hover:text-[#1c2720] hover:bg-white/40"
                  }`}
                >
                  <span>{fam.nombre}</span>
                  <span className="text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Fila de Controles: Buscador + Limpiar Filtros + Ordenación + Botón Filtros Laterales */}
          <div className="bg-white rounded-2xl border border-[#ece4d8] p-3 sm:p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Buscador directo y botón Limpiar Filtros a su derecha */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#718276] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, categoría o beneficio..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#fbf9f5] border border-[#d8d0c2] text-[#212924] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3d5a4c]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600 font-bold px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botón Limpiar filtros verde tipo Pedir Cita a la derecha del buscador */}
              {totalActiveFilters > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#3d5a4c] text-white font-medium text-xs shadow-sm hover:bg-[#2d473b] hover:shadow transition-all duration-200 cursor-pointer shrink-0 animate-fadeIn"
                  title="Limpiar todos los filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#dfc89f]" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            {/* Controles secundarios */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">

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

              {/* Botón para abrir el panel de filtrado lateral */}
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3d5a4c] text-white hover:bg-[#2d473b] font-semibold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#dfc89f]" />
                <span>Filtros Laterales</span>
                {totalActiveFilters > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#dfc89f] text-[#24352b] text-[10px] font-black flex items-center justify-center">
                    {totalActiveFilters}
                  </span>
                )}
              </button>

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

          {/* Barra de Estado / Resumen con chips activos */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#6e7d73]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Mostrando{" "}
                <strong className="text-[#212924]">
                  {totalItems > 0 ? `${startIndex + 1}–${endIndex}` : 0}
                </strong>{" "}
                de <strong className="text-[#212924]">{totalItems}</strong> artículos
                {totalItems !== products.length && ` (filtrado de ${products.length} totales)`}
              </span>

              {/* Chips de filtros activos */}
              {selectedBienestaresFilter.map((bId) => {
                const bObj = activeBienestares.find((b) => b.id === bId);
                return (
                  <span
                    key={bId}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f2ecdf] border border-[#e0d8ca] text-[#3d5a4c] font-medium text-[11px]"
                  >
                    <span>Bienestar: {bObj?.nombre || bId}</span>
                    <button
                      onClick={() =>
                        setSelectedBienestaresFilter((prev) => prev.filter((id) => id !== bId))
                      }
                      className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}

              {selectedFamiliasFilter.map((fId) => {
                const fObj = activeFamilias.find((f) => f.id === fId);
                return (
                  <span
                    key={fId}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eaf4ee] border border-[#cbdbd0] text-[#2d473b] font-medium text-[11px]"
                  >
                    <span>Familia: {fObj?.nombre || fId}</span>
                    <button
                      onClick={() =>
                        setSelectedFamiliasFilter((prev) => prev.filter((id) => id !== fId))
                      }
                      className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>

            {totalActiveFilters > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[#3d5a4c] font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Limpiar todos los filtros</span>
                <span className="text-[10px] bg-[#eaf0ec] text-[#3d5a4c] px-1.5 py-0.2 rounded-full">
                  ✕
                </span>
              </button>
            )}
          </div>
        </section>

        {/* ================= REJILLA DE ARTÍCULOS ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#ece4d8] p-8 sm:p-12 max-w-lg mx-auto space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-3xl bg-[#f4efe5] text-[#3d5a4c] mx-auto flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8 text-[#3d5a4c]" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#212924]">
                Catálogo en Actualización
              </h3>
              <p className="text-xs sm:text-sm text-[#6e7d73] leading-relaxed max-w-sm mx-auto">
                Actualmente estamos renovando y preparando nuestros productos botánicos y herramientas de bienestar.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleOpenBooking()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#3d5a4c] text-white text-xs font-semibold shadow-xs hover:bg-[#2d473b] transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver Terapias y Citas</span>
                </button>
                {config.whatsapp && (
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                      "Hola Pepi, me gustaría consultar la disponibilidad de productos en tienda."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#25D366] text-white text-xs font-semibold shadow-xs hover:bg-[#20ba5a] transition-all"
                  >
                    <span>Consultar por WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#ece4d8] p-8 max-w-md mx-auto space-y-3 shadow-2xs">
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
                const cardImgSrc =
                  failedImages[product.id] || !product.imageUrl
                    ? DEFAULT_FALLBACK_IMG
                    : product.imageUrl;

                return (
                  <article
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ece4d8] shadow-2xs hover:shadow-md hover:border-[#cbdbd0] transition-all duration-300 cursor-pointer"
                  >
                    {/* Imagen del producto con badge y overlay de clic */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#f4efe5]">
                      <Image
                        src={cardImgSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [product.id]: true }));
                        }}
                        unoptimized={cardImgSrc.startsWith("data:")}
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#212924] text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-[#3d5a4c]" />
                          Ver fotos y detalles
                        </span>
                      </div>

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
                        ) : (
                          <span />
                        )}

                        {isOutOfStock && (
                          <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-xs">
                            Agotado
                          </span>
                        )}
                      </div>

                      {/* Familia / Categoría pill */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#212924] text-[10px] font-semibold shadow-2xs">
                          {product.familiaNombre || product.categoryLabel || "Bienestar"}
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
                              <div
                                key={i}
                                className="flex items-start gap-1.5 text-[11px] text-[#4a584f]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5a4c] flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Precio y Botón Añadir / Reservar */}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBooking(product.name);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#f4efe5] hover:bg-[#eae3d5] text-[#3d5a4c] font-semibold text-xs transition-all cursor-pointer border border-[#e5dcce]"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Reservar</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-12 pt-6 border-t border-[#ece4d8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#6e7d73] flex items-center gap-2">
                <span>
                  Página <strong className="text-[#212924] font-bold">{currentPage}</strong> de{" "}
                  <strong className="text-[#212924] font-bold">{totalPages}</strong>
                </span>
                <span className="hidden md:inline text-gray-300">•</span>
                <span className="hidden md:inline text-[11px] text-[#8c9c91]">
                  ({totalItems} artículos)
                </span>
              </div>

              {/* Botones de navegación con elipsis inteligente */}
              <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-1">
                {totalPages > 5 && currentPage > 3 && (
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="hidden sm:flex p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] transition-colors cursor-pointer"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                    }
                  }

                  return pages.map((p, idx) => {
                    if (typeof p === "string") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-7 sm:w-8 h-8 flex items-center justify-center text-xs text-[#8c9c91] font-bold select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    const isCur = currentPage === p;
                    return (
                      <button
                        key={`page-${p}`}
                        onClick={() => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }}
                        className={`w-7 sm:w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isCur
                            ? "bg-[#3d5a4c] text-white shadow-2xs scale-105"
                            : "bg-white border border-[#e0d8cc] text-[#4a584f] hover:bg-[#f6f2ea]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="hidden sm:flex p-2 rounded-xl border border-[#e0d8cc] bg-white text-[#4a584f] hover:bg-[#f6f2ea] transition-colors cursor-pointer"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================= SECCIÓN 2: BIENESTAR PROPÓSITOS (TARJETAS DE GUÍA) ================= */}
        <section
          id="bienestar"
          className="py-16 bg-gradient-to-b from-white via-[#f7f3eb] to-white border-y border-[#ebdcca] mb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] bg-[#eaf2ec] px-3.5 py-1.5 rounded-full">
                Guía de Bienestar Consciente
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a251e] mt-3">
                Cómo integrar las herramientas de autocuidado en tu rutina
              </h2>
              <p className="text-xs sm:text-sm text-[#5f7467] mt-2.5 leading-relaxed">
                Selecciona tu propósito vital para filtrar automáticamente los elementos consagrados que mejor acompañan tu proceso.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeBienestares.map((bienestar) => (
                <div
                  key={bienestar.id}
                  className="bg-white rounded-3xl border border-[#ebdcca] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen con badge */}
                    <div className="aspect-16/10 w-full relative overflow-hidden bg-[#faf7f2]">
                      <Image
                        src={bienestar.imagenUrl || DEFAULT_FALLBACK_IMG}
                        alt={bienestar.nombre}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={bienestar.imagenUrl?.startsWith("data:")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#2a4537] text-[10px] font-bold shadow-xs">
                          {bienestar.subtitulo}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] text-[#dfc89f] font-semibold uppercase tracking-wider">
                          Propósito Vital
                        </p>
                        <p className="text-sm font-bold font-serif drop-shadow-xs">
                          {bienestar.nombre}
                        </p>
                      </div>
                    </div>

                    {/* Texto descriptivo */}
                    <div className="p-5 sm:p-6 space-y-2">
                      <h3 className="font-serif font-bold text-base text-gray-900 leading-snug">
                        {bienestar.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {bienestar.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0">
                    <button
                      onClick={() => handleSelectBienestarCard(bienestar.id)}
                      className="w-full py-2.5 rounded-2xl bg-[#f5f1eb] hover:bg-[#3d5a4c] text-[#3d5a4c] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
                    >
                      <span>Ver elementos en la tienda</span>
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECCIÓN 3: CARTA OFICIAL DE TERAPIAS & CUIDADOS (2 COLUMNAS) ================= */}
        <section
          id="carta-terapias"
          className="py-16 md:py-20 bg-white border-b border-[#ebdcca] mb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3d5a4c] bg-[#eaf2ec] px-3.5 py-1.5 rounded-full">
                Centro Holístico en Boiro (A Coruña)
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a251e] mt-3">
                Carta de Terapias & Cuidados
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                Cada sesión es un viaje personalizado hacia tu centro. En cabina individual, climatizada y con acompañamiento integral por Pepi.
              </p>
            </div>

            {/* Desglose temático en 2 Columnas con Fotografías */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Columna 1: Sanación Energética & Reiki (Terapias) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#faf7f2] border border-[#ebdcca] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5ded3]">
                    <span className="w-10 h-10 rounded-2xl bg-[#eaf2ec] text-[#3d5a4c] flex items-center justify-center text-xl font-bold">
                      ✨
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1e2822]">
                        Canalización Energética & Reiki
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Restablece el flujo bioenergético natural
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {terapiasHolisticas.map((terapia) => (
                      <div
                        key={terapia.id}
                        className="flex items-center gap-4 pb-5 border-b border-[#ebdcca]/60 last:border-b-0 last:pb-0 group"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-white relative bg-[#eae2d5]">
                          <Image
                            src={terapia.imageUrl || DEFAULT_FALLBACK_IMG}
                            alt={terapia.name}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={terapia.imageUrl?.startsWith("data:")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif font-bold text-sm text-gray-900">
                              {terapia.name}
                            </h4>
                            {getServiceDuration(terapia) && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {getServiceDuration(terapia)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {terapia.shortDescription}
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="font-serif font-bold text-base text-[#3d5a4c]">
                              {terapia.price.toFixed(2)} €
                            </span>
                            <button
                              onClick={() => handleOpenBooking(terapia.name)}
                              className="px-3.5 py-1.5 bg-[#3d5a4c] hover:bg-[#283b32] text-white rounded-xl font-bold text-[11px] shadow-2xs transition cursor-pointer"
                            >
                              Reservar Cita
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna 2: Terapias Manuales & Cuidados (Cuidados) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#faf7f2] border border-[#ebdcca] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5ded3]">
                    <span className="w-10 h-10 rounded-2xl bg-[#eaf2ec] text-[#3d5a4c] flex items-center justify-center text-xl font-bold">
                      🌿
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1e2822]">
                        Terapias Manuales & Cuidados
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Cuerpo físico, musculatura y relajación
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {cuidadosManuales.map((cuidado) => (
                      <div
                        key={cuidado.id}
                        className="flex items-center gap-4 pb-5 border-b border-[#ebdcca]/60 last:border-b-0 last:pb-0 group"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-white relative bg-[#eae2d5]">
                          <Image
                            src={cuidado.imageUrl || DEFAULT_FALLBACK_IMG}
                            alt={cuidado.name}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={cuidado.imageUrl?.startsWith("data:")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif font-bold text-sm text-gray-900">
                              {cuidado.name}
                            </h4>
                            {getServiceDuration(cuidado) && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {getServiceDuration(cuidado)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {cuidado.shortDescription}
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="font-serif font-bold text-base text-[#3d5a4c]">
                              {cuidado.price.toFixed(2)} €
                            </span>
                            <button
                              onClick={() => handleOpenBooking(cuidado.name)}
                              className="px-3.5 py-1.5 bg-[#3d5a4c] hover:bg-[#283b32] text-white rounded-xl font-bold text-[11px] shadow-2xs transition cursor-pointer"
                            >
                              Reservar Cita
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= EXPERIENCIA ESTRELLA BANNER ================= */}
            <div className="rounded-3xl bg-[#24352b] text-white shadow-xl overflow-hidden relative border border-[#3d5a4c]">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <Image
                  src={activeExperienciaEstrella.imagenFondoUrl || DEFAULT_FALLBACK_IMG}
                  alt={activeExperienciaEstrella.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl text-center md:text-left">
                  <span className="px-3.5 py-1 rounded-full bg-[#dfc89f] text-[#24352b] text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                    <span>★</span>
                    <span>{activeExperienciaEstrella.badge || "Nuestra Experiencia Estrella"}</span>
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-3 text-white">
                    {activeExperienciaEstrella.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-200 mt-2 leading-relaxed">
                    {activeExperienciaEstrella.descripcion}
                  </p>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="text-[11px] text-gray-300 mb-0.5">Precio de la sesión</div>
                  <span className="font-serif font-bold text-3xl sm:text-4xl text-[#dfc89f]">
                    {activeExperienciaEstrella.precio.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => handleOpenBooking(activeExperienciaEstrella.titulo)}
                    className="block mt-3 px-7 py-3.5 bg-[#dfc89f] hover:bg-white text-[#1f2d24] rounded-2xl font-bold text-xs shadow-lg transition hover:scale-105 cursor-pointer"
                  >
                    {activeExperienciaEstrella.botonTexto || "Reservar Experiencia"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Discreta: ¿Cómo comprar y métodos de pago? (Bizum, Tienda y Envío) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
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
                    Elige <strong>recogida gratis en tienda (Boiro)</strong> o{" "}
                    <strong>envío a domicilio</strong> indicando tus datos de contacto.
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
                onClick={() => handleOpenBooking()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#2d473b] font-semibold text-sm shadow hover:bg-[#f6f2ea] transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#3d5a4c]" />
                <span>Pedir Cita Presencial</span>
              </button>
              <a
                href="#carta-terapias"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                <span>Ver Terapias &rarr;</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <Footer config={config} />

      {/* ================= DRAWER FLOTANTE DE FILTROS LATERALES ================= */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fondo oscuro con blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Panel deslizante */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Cabecera del Drawer */}
            <div className="p-5 sm:p-6 bg-[#faf7f2] border-b border-[#ece4d8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#3d5a4c]" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#212924]">
                  Filtros del Catálogo
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {totalActiveFilters > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#3d5a4c] font-semibold hover:underline cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white text-gray-600 hover:text-gray-900 border border-[#e0d8cc] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido scrollable de Filtros */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* 1. Familias de Productos (Multi-select) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Familias de Productos
                  </span>
                  {selectedFamiliasFilter.length > 0 && (
                    <button
                      onClick={() => setSelectedFamiliasFilter([])}
                      className="text-[10px] text-[#3d5a4c] hover:underline"
                    >
                      Deseleccionar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {activeFamilias.map((fam) => {
                    const isChecked = selectedFamiliasFilter.includes(fam.id);
                    const count = familiaCounts[fam.id] || 0;
                    return (
                      <label
                        key={fam.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#e8ded0] bg-[#fbf9f5] hover:bg-white hover:border-[#cbdbd0] cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedFamiliasFilter((prev) =>
                                isChecked ? prev.filter((id) => id !== fam.id) : [...prev, fam.id]
                              );
                            }}
                            className="rounded border-[#d8d0c2] text-[#3d5a4c] focus:ring-[#3d5a4c] w-4 h-4"
                          />
                          <span className="text-gray-800 font-medium">{fam.nombre}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Bienestar & Propósito (Multi-select) */}
              <div className="space-y-3 pt-4 border-t border-[#f4efe5]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Bienestar & Propósito
                  </span>
                  {selectedBienestaresFilter.length > 0 && (
                    <button
                      onClick={() => setSelectedBienestaresFilter([])}
                      className="text-[10px] text-[#3d5a4c] hover:underline"
                    >
                      Deseleccionar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {activeBienestares.map((bienestar) => {
                    const isChecked = selectedBienestaresFilter.includes(bienestar.id);
                    const count = bienestarCounts[bienestar.id] || 0;
                    return (
                      <label
                        key={bienestar.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#e8ded0] bg-[#fbf9f5] hover:bg-white hover:border-[#cbdbd0] cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedBienestaresFilter((prev) =>
                                isChecked
                                  ? prev.filter((id) => id !== bienestar.id)
                                  : [...prev, bienestar.id]
                              );
                            }}
                            className="rounded border-[#d8d0c2] text-[#3d5a4c] focus:ring-[#3d5a4c] w-4 h-4"
                          />
                          <div>
                            <span className="text-gray-800 font-medium block">
                              {bienestar.nombre}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {bienestar.subtitulo}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Tipo de Artículo */}
              <div className="space-y-2 pt-4 border-t border-[#f4efe5]">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
                  Tipo de Artículo
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      filterType === "all"
                        ? "bg-[#3d5a4c] text-white border-[#3d5a4c]"
                        : "bg-white text-gray-700 border-[#e0d8cc] hover:bg-[#f6f2ea]"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType("products")}
                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      filterType === "products"
                        ? "bg-[#3d5a4c] text-white border-[#3d5a4c]"
                        : "bg-white text-gray-700 border-[#e0d8cc] hover:bg-[#f6f2ea]"
                    }`}
                  >
                    Productos
                  </button>
                  <button
                    onClick={() => setFilterType("services")}
                    className={`py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      filterType === "services"
                        ? "bg-[#3d5a4c] text-white border-[#3d5a4c]"
                        : "bg-white text-gray-700 border-[#e0d8cc] hover:bg-[#f6f2ea]"
                    }`}
                  >
                    Terapias
                  </button>
                </div>
              </div>

              {/* 4. Tarjeta Pepi te Asesora */}
              <div className="p-4 rounded-2xl bg-[#f2ecdf] border border-[#e0d8ca] space-y-2">
                <div className="flex items-center gap-2 text-[#3d5a4c] font-bold">
                  <Sparkles className="w-4 h-4 text-[#b08d4b]" />
                  <span>¿Dudas sobre qué elegir?</span>
                </div>
                <p className="text-[11px] text-[#55645a] leading-relaxed">
                  Pepi te ayuda a escoger el mineral o el ritual de autocuidado que mejor resuene con tu energía actual.
                </p>
                {config.whatsapp && (
                  <a
                    href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                      "Hola Pepi, tengo dudas y me gustaría que me asesores para elegir en la tienda."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Preguntar por WhatsApp &rarr;</span>
                  </a>
                )}
              </div>
            </div>

            {/* Pie del Drawer */}
            <div className="p-5 sm:p-6 bg-[#faf7f2] border-t border-[#ece4d8]">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-[#3d5a4c] hover:bg-[#2d473b] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ver {filteredAndSortedProducts.length} artículos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE PRODUCTO / TERAPIA GRANDE Y RESPONSIVE ================= */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-[96vw] max-w-5xl h-[92vh] sm:h-[88vh] max-h-[900px] overflow-hidden shadow-2xl border border-[#ebdcca] flex flex-col md:flex-row my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center font-bold shadow-lg border border-gray-200 text-lg transition-transform hover:scale-105 cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* COLUMNA IZQUIERDA: Galería y Carrusel de Fotos */}
            <div className="md:w-1/2 h-[40vh] sm:h-[45vh] md:h-full bg-[#f4efe5]/60 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#ece4d8] select-none shrink-0 overflow-hidden">
              <div
                className="relative w-full flex-1 max-h-[360px] md:max-h-none rounded-2xl overflow-hidden bg-white shadow-xs flex items-center justify-center group"
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
              >
                {activeProductImages[currentImgIndex] ? (
                  <Image
                    src={activeProductImages[currentImgIndex]}
                    alt={selectedProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 550px"
                    className="object-contain p-3 transition-all duration-500"
                    priority
                    unoptimized={activeProductImages[currentImgIndex]?.startsWith("data:")}
                    onError={() => {
                      const key = `${selectedProduct.id}-modal-${currentImgIndex}`;
                      setFailedImages((prev) => ({ ...prev, [key]: true }));
                    }}
                  />
                ) : null}

                {/* Flecha Izquierda */}
                {activeProductImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(
                        (prev) => (prev - 1 + activeProductImages.length) % activeProductImages.length
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#212924] shadow-md flex items-center justify-center cursor-pointer transition opacity-80 group-hover:opacity-100 hover:scale-105"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Flecha Derecha */}
                {activeProductImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex((prev) => (prev + 1) % activeProductImages.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#212924] shadow-md flex items-center justify-center cursor-pointer transition opacity-80 group-hover:opacity-100 hover:scale-105"
                    title="Foto siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Indicador de foto actual */}
                {activeProductImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span>
                      {currentImgIndex + 1} / {activeProductImages.length}
                    </span>
                    {!isCarouselPaused && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                        title="Auto-avance activo (3s)"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Tira de Miniaturas */}
              {activeProductImages.length > 1 && (
                <div className="w-full mt-3 flex items-center justify-center gap-2 overflow-x-auto py-1">
                  {activeProductImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 bg-white ${
                        currentImgIndex === idx
                          ? "border-[#3d5a4c] shadow-md scale-105 ring-2 ring-[#3d5a4c]/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        sizes="60px"
                        className="object-cover"
                        unoptimized={img?.startsWith("data:")}
                        onError={() => {
                          const key = `${selectedProduct.id}-modal-${idx}`;
                          setFailedImages((prev) => ({ ...prev, [key]: true }));
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {activeProductImages.length > 1 && (
                <p className="text-[10px] text-[#718276] mt-2 text-center">
                  Rotación automática cada 3s • Pasa el ratón para pausar
                </p>
              )}
            </div>

            {/* COLUMNA DERECHA: Información y Acciones */}
            <div className="p-5 sm:p-7 md:p-9 md:w-1/2 flex flex-col justify-between overflow-y-auto flex-1 bg-gradient-to-b from-white to-[#faf7f2]">
              <div className="space-y-4">
                {/* Badges de Categoría y Stock */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#f4efe5] text-[#3d5a4c] text-xs font-semibold">
                    {selectedProduct.familiaNombre || selectedProduct.categoryLabel || "Bienestar"}
                  </span>

                  {selectedProduct.badge && (
                    <span className="px-3 py-1 rounded-full bg-[#3d5a4c] text-[#dfc89f] text-xs font-bold shadow-xs">
                      {selectedProduct.badge}
                    </span>
                  )}

                  {selectedProduct.inStock || selectedProduct.esServicio ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedProduct.esServicio
                        ? "Citas Disponibles"
                        : selectedProduct.stockActual
                        ? `En stock (${selectedProduct.stockActual} disp.)`
                        : "En stock"}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Agotado
                    </span>
                  )}
                </div>

                {/* Título del Producto */}
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#212924] leading-tight">
                  {selectedProduct.name}
                </h2>

                {/* Precio */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif font-bold text-[#3d5a4c]">
                    {selectedProduct.price.toFixed(2)}€
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-base text-gray-400 line-through">
                      {selectedProduct.originalPrice.toFixed(2)}€
                    </span>
                  )}
                  <span className="text-xs text-[#718276]">
                    {selectedProduct.esServicio ? "Por sesión presencial" : "IVA incluido"}
                  </span>
                </div>

                {/* Descripción Corta */}
                <p className="text-xs sm:text-sm text-[#4a584f] leading-relaxed">
                  {selectedProduct.shortDescription}
                </p>

                {/* Descripción Completa */}
                {selectedProduct.fullDescription &&
                  selectedProduct.fullDescription !== selectedProduct.shortDescription && (
                    <p className="text-xs text-[#6e7d73] leading-relaxed whitespace-pre-line border-t border-[#f4efe5] pt-3">
                      {selectedProduct.fullDescription}
                    </p>
                  )}

                {/* Beneficios & Propiedades */}
                {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-[#212924] uppercase tracking-wider block">
                      Propiedades & Beneficios:
                    </span>
                    {selectedProduct.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#4a584f]">
                        <Sparkles className="w-3.5 h-3.5 text-[#dfc89f] flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cajas de detalles prácticos y energéticos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-gray-700">
                  <div className="p-3 bg-white rounded-2xl border border-[#ebdcca] shadow-2xs">
                    <p className="font-bold text-[#3d5a4c] flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#b08d4b]" />
                      <span>Presentación</span>
                    </p>
                    <p className="text-gray-600 text-[11px]">
                      {selectedProduct.esServicio
                        ? "En cabina individual en Boiro"
                        : "Preparado y protegido para envío"}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-[#ebdcca] shadow-2xs">
                    <p className="font-bold text-[#3d5a4c] flex items-center gap-1.5 mb-0.5">
                      <Store className="w-3.5 h-3.5 text-[#3d5a4c]" />
                      <span>Entrega / Ubicación</span>
                    </p>
                    <p className="text-gray-600 text-[11px]">
                      Recogida gratis en Boiro o envío rápido 24-48h
                    </p>
                  </div>
                </div>

                {/* Sello de confianza */}
                <div className="p-3.5 bg-[#f1f7f3] rounded-2xl border border-[#cbe3d2] flex items-center gap-3 text-xs text-[#284534]">
                  <span className="text-lg">🌿</span>
                  <p className="text-[11px] leading-tight">
                    <strong>Compromiso Blanco y Negro:</strong> Piezas auténticas seleccionadas y armonizadas con respeto hacia la naturaleza en nuestro centro de Boiro.
                  </p>
                </div>
              </div>

              {/* Acciones de Compra / Reserva */}
              <div className="pt-4 border-t border-[#ece4d8] space-y-2 mt-4">
                {selectedProduct.esServicio ? (
                  <button
                    type="button"
                    onClick={() => {
                      const name = selectedProduct.name;
                      setSelectedProduct(null);
                      handleOpenBooking(name);
                    }}
                    className="w-full py-4 rounded-2xl bg-[#3d5a4c] hover:bg-[#2d473b] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#dfc89f]" />
                    <span>Reservar Cita Presencial</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Selector de cantidad */}
                    <div className="flex items-center border border-[#d8cfc0] rounded-2xl bg-[#faf7f2] p-1">
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-2xs cursor-pointer"
                        title="Menos"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-[#212924]">
                        {modalQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-2xs cursor-pointer"
                        title="Más"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botón Añadir */}
                    <button
                      type="button"
                      onClick={handleModalAddToCart}
                      disabled={!selectedProduct.inStock}
                      className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !selectedProduct.inStock
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : modalJustAdded
                          ? "bg-[#25D366] text-white scale-102"
                          : "bg-[#3d5a4c] hover:bg-[#2d473b] text-white"
                      }`}
                    >
                      {modalJustAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Añadido a la cesta ({modalQuantity})!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#dfc89f]" />
                          <span>
                            Añadir a la cesta •{" "}
                            {(selectedProduct.price * modalQuantity).toFixed(2)}€
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {config.whatsapp && (
                  <p className="text-[11px] text-center text-gray-400 pt-1">
                    ¿Tienes dudas?{" "}
                    <a
                      href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                        `Hola Pepi, tengo una duda sobre ${selectedProduct.name}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3d5a4c] font-bold underline"
                    >
                      Habla con Pepi por WhatsApp
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal interactivo de reservas */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        config={config}
        therapies={therapies}
        preselectedService={bookingServiceName}
      />
    </div>
  );
};
