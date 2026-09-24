import { WebData, Therapy, Workshop, HarmonizationItem, Review, ShopProduct, WebSectionItem, FamiliaItem, BienestarPropositoItem, ExperienciaEstrellaData } from "@/types/content";
import { defaultWebData } from "@/data/defaultContent";
import { formatImageUrl } from "@/lib/drive";
import { getDb } from "@/lib/db";

export const defaultFamilias: FamiliaItem[] = [
  { id: 'minerales', nombre: 'Minerales y Cuarzos', orden: 1, activa: true },
  { id: 'aceites', nombre: 'Aceites Esenciales', orden: 2, activa: true },
  { id: 'inciensos', nombre: 'Inciensos y Resinas', orden: 3, activa: true },
  { id: 'quemadores', nombre: 'Quemadores y Difusores', orden: 4, activa: true },
  { id: 'velas', nombre: 'Velas e Iluminación', orden: 5, activa: true },
  { id: 'sonido', nombre: 'Cuencos y Sonoterapia', orden: 6, activa: true },
  { id: 'joyeria', nombre: 'Joyería Energética', orden: 7, activa: true },
];

export const defaultBienestares: BienestarPropositoItem[] = [
  {
    id: 'calma-ansiedad',
    nombre: 'Calma & Estrés',
    subtitulo: 'Desconecta la mente acelerada',
    descripcion: 'Artículos seleccionados con propiedades relajantes y aromaterapia de lavanda y cedro para disipar la tensión diaria.',
    imagenUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    colorBadge: 'emerald',
    orden: 1,
    activo: true,
  },
  {
    id: 'energia-vitalidad',
    nombre: 'Energía & Claridad',
    subtitulo: 'Reactiva tu impulso natural',
    descripcion: 'Cítricos vigorizantes y cuarzos solares diseñados para despertar la motivación y disolver el cansancio acumulado.',
    imagenUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
    colorBadge: 'amber',
    orden: 2,
    activo: true,
  },
  {
    id: 'armonizacion-hogar',
    nombre: 'Hogar Sagrado',
    subtitulo: 'Espacios limpios y serenos',
    descripcion: 'Sahumerios de salvia blanca, palo santo y campanas tibetanas para liberar energías estancadas en casa.',
    imagenUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    colorBadge: 'sky',
    orden: 3,
    activo: true,
  },
  {
    id: 'abundancia-prosperidad',
    nombre: 'Abundancia & Éxito',
    subtitulo: 'Sintoniza con el merecimiento',
    descripcion: 'Piritas doradas, canela y preparados alquímicos para atraer prosperidad material y apertura de caminos.',
    imagenUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    colorBadge: 'violet',
    orden: 4,
    activo: true,
  },
];

export const defaultExperienciaEstrella: ExperienciaEstrellaData = {
  badge: '★ NUESTRA EXPERIENCIA ESTRELLA',
  titulo: 'Ritual Integral Renacer (90 min)',
  duracion: '90 min',
  descripcion: 'Combina Quiromasaje terapéutico descontracturante + Envoltura de Fangoterapia marina remineralizante + Armonización final de Chakras con Reiki y sonido.',
  precio: 75,
  imagenFondoUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
  botonTexto: 'Reservar Experiencia',
  activo: true,
};

/**
 * Convierte filas de la tabla "productos" de Neon a ShopProduct[]
 */
function mapNeonProducts(rows: any[]): ShopProduct[] {
  return rows.map((p, idx) => {
    const rawImg = p.imagen_url || p.imagenUrl || p.foto || "";
    const priceNum = typeof p.precio_venta === "number" ? p.precio_venta : (parseFloat(String(p.precio_venta || "0")) || 0);
    const origPriceNum = p.precio_anterior ? parseFloat(String(p.precio_anterior)) : undefined;
    const stockNum = typeof p.stock_actual === "number" ? p.stock_actual : (parseInt(String(p.stock_actual || "0"), 10) || 0);
    const inStock = stockNum > 0;
    const accion = (p.accion_agotado || "mostrar_agotado") as ShopProduct["accionAgotado"];

    let parsedBenefits: string[] = [];
    if (Array.isArray(p.beneficios)) {
      parsedBenefits = p.beneficios;
    } else if (typeof p.beneficios === "string") {
      try {
        const json = JSON.parse(p.beneficios);
        parsedBenefits = Array.isArray(json) ? json : [p.beneficios];
      } catch {
        parsedBenefits = p.beneficios.split(";").map((b: string) => b.trim()).filter(Boolean);
      }
    }

    let parsedImages: string[] = [];
    if (Array.isArray(p.imagenes)) {
      parsedImages = p.imagenes;
    } else if (typeof p.imagenes === "string" && p.imagenes.trim()) {
      try {
        const json = JSON.parse(p.imagenes);
        if (Array.isArray(json)) parsedImages = json;
      } catch {}
    }

    const defaultFallback = "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80";
    const mainImgUrl = formatImageUrl(rawImg || parsedImages[0] || "", defaultFallback);

    const formattedImages = parsedImages.length > 0
      ? parsedImages.map((img: string) => formatImageUrl(img, defaultFallback))
      : [mainImgUrl];

    const rawFamId = p.familia_id || p.familiaId || undefined;
    const rawFamNom = p.familia_nombre || p.familiaNombre || undefined;
    const esSinAsig =
      rawFamId === "sin-asignacion" ||
      rawFamId === "sin_asignacion" ||
      (rawFamNom && rawFamNom.toLowerCase().includes("sin asignaci")) ||
      p.categoria === "sin-asignacion";

    const finalFamId = esSinAsig ? undefined : rawFamId;
    const finalFamNom = esSinAsig ? undefined : rawFamNom;
    const finalCatLabel = esSinAsig ? "Bienestar" : (rawFamNom || p.categoria_label || "Holístico");

    return {
      id: p.id || p.ref || `prod-${idx + 1}`,
      name: p.nombre || "Artículo Holístico",
      category: esSinAsig ? "aromaterapia" : (p.categoria || "aromaterapia"),
      categoryLabel: finalCatLabel,
      shortDescription: p.descripcion_corta || "",
      fullDescription: p.descripcion_completa || "",
      price: priceNum,
      originalPrice: origPriceNum,
      badge: p.destacado || undefined,
      benefits: parsedBenefits,
      imageUrl: mainImgUrl,
      images: formattedImages,
      inStock,
      stockActual: stockNum,
      accionAgotado: accion,
      publicadoWeb: p.publicado_web !== false,
      esServicio: Boolean(p.es_servicio || p.esServicio || p.categoria === "terapias"),
      duracionMinutos: p.duracion_minutos || p.duracionMinutos || undefined,
      familiaId: finalFamId,
      familiaNombre: finalFamNom,
      bienestarId: p.bienestar_id || p.bienestarId || undefined,
      bienestarIds: Array.isArray(p.bienestar_ids) ? p.bienestar_ids : (p.bienestar_id ? [p.bienestar_id] : []),
      tipoServicio: p.tipo_servicio || p.tipoServicio || (p.categoria === "terapias" ? "terapia" : undefined),
      esExperienciaEstrella: Boolean(p.es_experiencia_estrella || p.esExperienciaEstrella),
      experienciaEstrellaTitulo: p.experiencia_estrella_titulo || p.experienciaEstrellaTitulo || undefined,
      presentacionTexto: p.presentacion_texto ? String(p.presentacion_texto).trim() : (p.presentacionTexto ? String(p.presentacionTexto).trim() : undefined),
      entregaUbicacionTexto: p.entrega_ubicacion_texto ? String(p.entrega_ubicacion_texto).trim() : (p.entregaUbicacionTexto ? String(p.entregaUbicacionTexto).trim() : undefined),
      compromisoTexto: p.compromiso_texto ? String(p.compromiso_texto).trim() : (p.compromisoTexto ? String(p.compromisoTexto).trim() : undefined),
      compromisoActivo: p.compromiso_activo !== undefined ? (p.compromiso_activo === true || p.compromiso_activo === 'true' || p.compromiso_activo === 1) : (p.compromisoActivo !== undefined ? Boolean(p.compromisoActivo) : true),
      compromisoEtiqueta: p.compromiso_etiqueta || p.compromisoEtiqueta || 'Compromiso Blanco y Negro',
      camposFichaWeb: Array.isArray(p.campos_ficha_web) 
        ? p.campos_ficha_web 
        : (Array.isArray(p.camposFichaWeb) 
            ? p.camposFichaWeb 
            : (typeof p.campos_ficha_web === 'string' 
                ? (() => { try { const parsed = JSON.parse(p.campos_ficha_web); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })() 
                : [])),
      orden: typeof p.orden === "number" ? p.orden : (typeof p.orden_web === "number" ? p.orden_web : undefined),
    };
  }).filter((p) => p.publicadoWeb && !(p.accionAgotado === "ocultar" && !p.inStock));
}

/**
 * Convierte filas de servicios/terapias de Neon a Therapy[]
 */
function mapNeonTherapies(rows: any[]): Therapy[] {
  const serviceRows = rows.filter((p) => p.publicado_web !== false && (p.es_servicio || p.categoria === "terapias"));
  if (serviceRows.length === 0) return defaultWebData.therapies;

  return serviceRows.map((p, idx) => {
    const rawImg = p.imagen_url || p.imagenUrl || p.foto || "";
    let cat: Therapy["category"] = "reiki";
    const nameLower = (p.nombre || "").toLowerCase();
    if (nameLower.includes("quiro") || nameLower.includes("masaje")) cat = "quiromasaje";
    else if (nameLower.includes("akash") || nameLower.includes("registro")) cat = "registros_akashicos";
    else if (nameLower.includes("respira") || nameLower.includes("prana")) cat = "respiracion";
    else if (nameLower.includes("reiki") || nameLower.includes("chakra")) cat = "reiki";

    let benefits: string[] = [];
    if (Array.isArray(p.beneficios)) benefits = p.beneficios;
    else if (typeof p.beneficios === "string" && p.beneficios.trim()) {
      try {
        const j = JSON.parse(p.beneficios);
        benefits = Array.isArray(j) ? j : [p.beneficios];
      } catch {
        benefits = p.beneficios.split(";").map((b: string) => b.trim()).filter(Boolean);
      }
    }
    if (benefits.length === 0) {
      benefits = [
        "Sesión personalizada de armonización y bienestar",
        "Disolución de bloqueos y recarga de vitalidad natural",
      ];
    }

    const price = typeof p.precio_venta === "number" ? p.precio_venta : parseFloat(String(p.precio_venta || "0")) || 0;

    return {
      id: p.id || p.ref || `therapy-${idx + 1}`,
      title: p.nombre || "Sesión Terapéutica",
      subtitle: p.descripcion_corta || "Cuidado integral y equilibrio consciente",
      category: cat,
      categoryLabel: p.categoria_label || "Terapias & Masajes",
      shortDescription: p.descripcion_corta || "Tratamiento personalizado para devolver la calma y bienestar a tu cuerpo y alma.",
      fullDescription: p.descripcion_completa || p.descripcion_corta || "Sesión individual realizada con técnicas tradicionales en nuestro espacio en Boiro.",
      benefits,
      duration: p.duracion_minutos ? `${p.duracion_minutos} minutos` : "60 minutos",
      priceNote: price > 0 ? `${price.toFixed(2)} € por sesión` : "Consultar sesión",
      imageUrl: formatImageUrl(rawImg, "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"),
      badge: p.destacado || (p.es_servicio ? "Sesión Presencial" : undefined),
    };
  });
}

/**
 * Convierte filas de la tabla "secciones_web" de Neon a WebSectionItem[]
 */
function mapNeonSections(rows: any[]): WebSectionItem[] {
  return rows
    .map((s, idx) => {
      let content = s.contenido || {};
      if (typeof content === "string") {
        try {
          content = JSON.parse(content);
        } catch {}
      }
      const canonicalId = s.id || `sec-${idx + 1}`;
      return {
        id: canonicalId,
        idSeccion: canonicalId,
        imagen: s.imagen || content?.imagenUrl || "",
        orden: typeof s.orden === "number" ? s.orden : idx + 1,
        tipoPlantilla: s.tipo_plantilla || "texto_foto",
        titulo: s.titulo || "Sección",
        subtitulo: s.subtitulo || "",
        activo: s.activo !== false,
        contenido: content,
      };
    })
    .sort((a, b) => a.orden - b.orden);
}

/**
 * Convierte un payload JSON recibido desde el TPV o Vercel Blob en una estructura WebData completa.
 */
function buildWebDataFromPayload(payload: any): WebData {
  const rawProds = payload.productos || payload.products || [];
  const parsedProducts: ShopProduct[] = rawProds.map((p: any, idx: number) => {
    const rawImg = p.imagenUrl || p.imageUrl || p.imagen || p.foto || "";
    const priceNum = typeof p.precioVenta === "number"
      ? p.precioVenta
      : (parseFloat(String(p.precioVenta || p.precio || "0").replace(",", ".")) || 0);
    const origPriceNum = p.precioAnterior || p.originalPrice ? parseFloat(String(p.precioAnterior || p.originalPrice).replace(",", ".")) : undefined;
    const stockNum = typeof p.stockActual === "number"
      ? p.stockActual
      : (parseInt(String(p.stockActual || p.stock || "0"), 10) || 0);
    const accion = (p.accionAgotado || p.agotado || "mostrar_agotado") as ShopProduct["accionAgotado"];
    const isPublicado = p.publicadoWeb !== false && String(p.publicadoWeb).toLowerCase() !== "false";
    const inStock = stockNum > 0;

    return {
      id: p.id || p._id || p.ref || `prod-${idx + 1}`,
      name: p.nombre || p.name || p.titulo || "Artículo Holístico",
      category: p.categoria || p.category || "aromaterapia",
      categoryLabel: p.categoriaLabel || p.categoryLabel || "Holístico",
      shortDescription: p.descripcionCorta || p.shortDescription || "",
      fullDescription: p.descripcionCompleta || p.fullDescription || p.descripcion || "",
      price: priceNum,
      originalPrice: origPriceNum,
      badge: p.destacado || p.badge || undefined,
      benefits: Array.isArray(p.beneficios || p.benefits)
        ? (p.beneficios || p.benefits)
        : (p.beneficios || "").split(";").map((b: string) => b.trim()).filter(Boolean),
      imageUrl: formatImageUrl(rawImg, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"),
      inStock,
      stockActual: stockNum,
      accionAgotado: accion,
      publicadoWeb: isPublicado,
      esServicio: Boolean(p.es_servicio || p.esServicio),
      duracionMinutos: p.duracion_minutos || p.duracionMinutos || undefined,
      familiaId: p.familiaId || p.familia_id || undefined,
      familiaNombre: p.familiaNombre || p.familia_nombre || undefined,
      bienestarId: p.bienestarId || p.bienestar_id || undefined,
      bienestarIds: Array.isArray(p.bienestarIds || p.bienestar_ids) ? (p.bienestarIds || p.bienestar_ids) : (p.bienestarId || p.bienestar_id ? [p.bienestarId || p.bienestar_id] : []),
      tipoServicio: p.tipoServicio || p.tipo_servicio || (p.categoria === "terapias" ? "terapia" : undefined),
      esExperienciaEstrella: Boolean(p.esExperienciaEstrella || p.es_experiencia_estrella),
      experienciaEstrellaTitulo: p.experienciaEstrellaTitulo || p.experiencia_estrella_titulo || undefined,
      presentacionTexto: p.presentacionTexto || p.presentacion_texto ? String(p.presentacionTexto || p.presentacion_texto).trim() : undefined,
      entregaUbicacionTexto: p.entregaUbicacionTexto || p.entrega_ubicacion_texto ? String(p.entregaUbicacionTexto || p.entrega_ubicacion_texto).trim() : undefined,
      compromisoTexto: p.compromisoTexto || p.compromiso_texto ? String(p.compromisoTexto || p.compromiso_texto).trim() : undefined,
      compromisoActivo: p.compromisoActivo !== undefined ? Boolean(p.compromisoActivo) : (p.compromiso_activo !== undefined ? Boolean(p.compromiso_activo) : true),
      compromisoEtiqueta: p.compromisoEtiqueta || p.compromiso_etiqueta || 'Compromiso Blanco y Negro',
      camposFichaWeb: Array.isArray(p.camposFichaWeb)
        ? p.camposFichaWeb
        : (Array.isArray(p.campos_ficha_web)
            ? p.campos_ficha_web
            : (typeof p.campos_ficha_web === 'string'
                ? (() => { try { const parsed = JSON.parse(p.campos_ficha_web); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })()
                : [])),
      orden: typeof p.orden === "number" ? p.orden : (typeof p.orden_web === "number" ? p.orden_web : undefined),
    };
  }).filter((p: any) => p.publicadoWeb && !(p.accionAgotado === "ocultar" && !p.inStock));

  const rawSections = payload.secciones || payload.sections || defaultWebData.sections || [];
  const sections = Array.isArray(rawSections)
    ? rawSections.map((s: any, idx: number) => ({
        ...s,
        id: s.id || s.idSeccion || `sec-${idx + 1}`,
        idSeccion: s.idSeccion || s.id || `sec-${idx + 1}`,
        activo: s.activo !== false,
      })).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
    : [];

  return {
    ...defaultWebData,
    config: {
      ...defaultWebData.config,
      ...(payload.config || {}),
    },
    products: parsedProducts,
    sections: sections.length > 0 ? sections : defaultWebData.sections,
    therapies: payload.terapias || payload.therapies || defaultWebData.therapies,
    workshops: payload.talleres || payload.workshops || defaultWebData.workshops,
    harmonization: payload.armonizacion || payload.harmonization || defaultWebData.harmonization,
    reviews: payload.resenas || payload.reviews || defaultWebData.reviews,
    familias: (payload.familias || payload.familiasConfig || defaultFamilias).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0)),
    bienestares: (payload.bienestares || payload.bienestaresConfig || defaultBienestares).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0)),
    experienciaEstrella: payload.experienciaEstrella || payload.experienciaEstrellaConfig || defaultExperienciaEstrella,
  };
}

/**
 * Carga los datos de la web directamente desde Neon Serverless Postgres.
 * Respaldo automático mediante Vercel Blob y datos por defecto.
 */
export async function getWebData(): Promise<WebData> {
  const sql = getDb();

  // 1. INTENTO PRINCIPAL: Neon Serverless Postgres
  if (sql) {
    try {
      const [prodsRes, secsRes, cfgRes] = await Promise.all([
        sql.query("SELECT * FROM productos WHERE publicado_web = true AND (archivado IS NOT TRUE) ORDER BY COALESCE(orden, 9999) ASC, categoria, nombre ASC"),
        sql.query("SELECT * FROM secciones_web ORDER BY orden ASC"),
        sql.query("SELECT clave, valor FROM configuracion_web"),
      ]);

      const neonProducts = mapNeonProducts(prodsRes);
      const neonSections = mapNeonSections(secsRes);
      const neonTherapies = mapNeonTherapies(prodsRes);

      const customConfig = { ...defaultWebData.config };
      let neonFamilias: FamiliaItem[] = defaultFamilias;
      let neonBienestares: BienestarPropositoItem[] = defaultBienestares;
      let neonExperiencia: ExperienciaEstrellaData = defaultExperienciaEstrella;

      if (cfgRes && cfgRes.length > 0) {
        cfgRes.forEach((row: any) => {
          const k = String(row.clave || "").toLowerCase();
          const v = String(row.valor || "");
          if (!k || !v) return;
          if (k === "nombrecomercial" || k === "nombre") customConfig.name = v;
          if (k === "tagline" || k === "lema") customConfig.tagline = v;
          if (k === "descripcion" || k === "description") customConfig.description = v;
          if (k === "biografia" || k === "bio") customConfig.therapistBio = v;
          if (k === "telefono" || k === "phone") {
            customConfig.phone = v;
            customConfig.phoneDisplay = v;
          }
          if (k === "whatsapp") customConfig.whatsapp = v.replace(/[^0-9]/g, "");
          if (k === "email") customConfig.email = v;
          if (k === "direccion" || k === "address") customConfig.address = v;
          if (k === "horario" || k === "schedule") customConfig.schedule = v;
          if (k === "familias_config" || k === "familiasconfig" || k === "familias") {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed) && parsed.length > 0) {
                neonFamilias = parsed
                  .filter((f: any) => f && f.id !== "sin-asignacion" && f.id !== "sin_asignacion" && !String(f.nombre || "").toLowerCase().includes("sin asignaci"))
                  .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
              }
            } catch {}
          }
          if (k === "bienestares_config" || k === "bienestaresconfig" || k === "bienestares") {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed) && parsed.length > 0) {
                neonBienestares = parsed.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
              }
            } catch {}
          }
          if (k === "experiencia_estrella_config" || k === "experienciaestrellaconfig" || k === "experiencia_estrella") {
            try {
              const parsed = JSON.parse(v);
              if (parsed && typeof parsed === "object") neonExperiencia = { ...defaultExperienciaEstrella, ...parsed };
            } catch {}
          }
        });
      }

      // Si la consulta a Neon tuvo éxito, devolvemos fielmente los datos de Neon (incluso si el catálogo está vacío)
      return {
        ...defaultWebData,
        config: customConfig,
        products: neonProducts,
        sections: neonSections.length > 0 ? neonSections : defaultWebData.sections,
        therapies: neonTherapies.length > 0 ? neonTherapies : defaultWebData.therapies,
        familias: neonFamilias,
        bienestares: neonBienestares,
        experienciaEstrella: neonExperiencia,
      };
    } catch (neonErr) {
      console.warn("[Neon] Aviso consultando base de datos, usando fallback:", neonErr);
    }
  }

  // 2. RESPALDO SECUNDARIO: Vercel Blob (CDN instantáneo)
  try {
    const directRes = await fetch("https://8jpivd50e95ayxtx.public.blob.vercel-storage.com/data/catalog.json", {
      next: { revalidate: 30, tags: ["web-catalog-data"] },
    });
    if (directRes.ok) {
      const directJson = await directRes.json();
      if (directJson && (Array.isArray(directJson.productos) || Array.isArray(directJson.products))) {
        return buildWebDataFromPayload(directJson);
      }
    }
  } catch {}

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const result = await list({ prefix: "data/catalog.json", limit: 1 });
      if (result.blobs && result.blobs.length > 0) {
        const catalogBlob = result.blobs[0];
        const res = await fetch(catalogBlob.url, {
          next: { revalidate: 30, tags: ["web-catalog-data"] },
        });
        if (res.ok) {
          const blobJson = await res.json();
          if (blobJson && (Array.isArray(blobJson.productos) || Array.isArray(blobJson.products))) {
            return buildWebDataFromPayload(blobJson);
          }
        }
      }
    } catch {}
  }

  // 3. RESPALDO FINAL: Datos locales por defecto (con catálogo vacío si no hay sincronización)
  return {
    ...defaultWebData,
    products: [],
    familias: defaultFamilias,
    bienestares: defaultBienestares,
    experienciaEstrella: defaultExperienciaEstrella,
  };
}
