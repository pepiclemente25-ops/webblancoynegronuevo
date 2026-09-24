export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  therapistName: string;
  therapistBio: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  schedule: string;
  googleCalendarUrl: string;
  googleMapsUrl: string;
  googleReviewsUrl: string;
  disclaimerLegal?: string;
}

export interface Therapy {
  id: string;
  title: string;
  subtitle: string;
  category: "quiromasaje" | "reiki" | "registros_akashicos" | "respiracion";
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  duration: string;
  priceNote?: string;
  imageUrl: string;
  badge?: string;
}

export interface Workshop {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  modality: "Presencial" | "Online / Streaming" | "Híbrido";
  spots: string;
  description: string;
  includes: string[];
  imageUrl: string;
}

export interface HarmonizationItem {
  id: string;
  title: string;
  category: "aromaterapia" | "minerales" | "herramientas" | "espacios";
  categoryLabel: string;
  description: string;
  properties: string[];
  usageTip: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  author: string;
  service: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface ChakraItem {
  number: number;
  name: string;
  sanskritName: string;
  color: string;
  badgeColor: string;
  glowColor: string;
  meaning: string;
  symptoms: string;
}

export interface FamiliaItem {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
  activa?: boolean;
  modoVisibilidad?: 'mostrar' | 'ocultar' | 'auto';
}

export interface BienestarPropositoItem {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  imagenUrl: string;
  colorBadge?: string;
  orden?: number;
  activo?: boolean;
}

export interface ExperienciaEstrellaData {
  badge?: string;
  titulo: string;
  duracion?: string;
  descripcion: string;
  precio: number;
  imagenFondoUrl?: string;
  botonTexto?: string;
  activo?: boolean;
  productoId?: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  category: "aromaterapia" | "minerales" | "herramientas" | "armonizacion" | "terapias" | string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  benefits: string[];
  imageUrl: string;
  images?: string[];
  inStock: boolean;
  stockActual?: number;
  accionAgotado?: "ocultar" | "mostrar_agotado" | "bajo_encargo";
  esServicio?: boolean;
  duracionMinutos?: number;
  publicadoWeb?: boolean;
  familiaId?: string;
  familiaNombre?: string;
  bienestarId?: string;
  bienestarIds?: string[];
  tipoServicio?: "terapia" | "cuidado";
  esExperienciaEstrella?: boolean;
  experienciaEstrellaTitulo?: string;
  presentacionTexto?: string;
  entregaUbicacionTexto?: string;
  compromisoTexto?: string;
  compromisoActivo?: boolean;
  compromisoEtiqueta?: string;
  camposFichaWeb?: CampoFichaWeb[];
  orden?: number;
}

export interface CampoFichaWeb {
  id: string;
  activo: boolean;
  etiqueta: string;
  valor: string;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export interface WebSectionItem {
  id: string;
  idSeccion?: string;
  imagen?: string;
  orden: number;
  tipoPlantilla: string;
  titulo: string;
  subtitulo?: string;
  activo: boolean;
  contenido?: Record<string, any>;
}

export interface WebData {
  config: SiteConfig;
  therapies: Therapy[];
  workshops: Workshop[];
  harmonization: HarmonizationItem[];
  reviews: Review[];
  chakras: ChakraItem[];
  products?: ShopProduct[];
  sections?: WebSectionItem[];
  familias?: FamiliaItem[];
  bienestares?: BienestarPropositoItem[];
  experienciaEstrella?: ExperienciaEstrellaData;
}

