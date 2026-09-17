import { WebData, Therapy, Workshop, HarmonizationItem, Review, ShopProduct, WebSectionItem } from "@/types/content";
import { defaultWebData } from "@/data/defaultContent";
import { formatImageUrl } from "@/lib/drive";
import { getDb } from "@/lib/db";

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

    return {
      id: p.id || p.ref || `prod-${idx + 1}`,
      name: p.nombre || "Artículo Holístico",
      category: p.categoria || "aromaterapia",
      categoryLabel: p.categoria_label || "Holístico",
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
      return {
        id: s.id || `sec-${idx + 1}`,
        orden: typeof s.orden === "number" ? s.orden : idx + 1,
        tipoPlantilla: s.tipo_plantilla || "texto_foto",
        titulo: s.titulo || "Sección",
        subtitulo: s.subtitulo || "",
        activo: s.activo !== false,
        contenido: content,
      };
    })
    .filter((s) => s.activo)
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
    };
  }).filter((p: any) => p.publicadoWeb && !(p.accionAgotado === "ocultar" && !p.inStock));

  const rawSections = payload.secciones || payload.sections || defaultWebData.sections || [];
  const sections = Array.isArray(rawSections)
    ? rawSections.filter((s: any) => s && s.activo !== false).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
    : [];

  return {
    ...defaultWebData,
    config: {
      ...defaultWebData.config,
      ...(payload.config || {}),
    },
    products: parsedProducts.length > 0 ? parsedProducts : defaultWebData.products,
    sections: sections.length > 0 ? sections : defaultWebData.sections,
    therapies: payload.terapias || payload.therapies || defaultWebData.therapies,
    workshops: payload.talleres || payload.workshops || defaultWebData.workshops,
    harmonization: payload.armonizacion || payload.harmonization || defaultWebData.harmonization,
    reviews: payload.resenas || payload.reviews || defaultWebData.reviews,
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
        sql.query("SELECT * FROM productos WHERE publicado_web = true AND (archivado IS NOT TRUE) ORDER BY categoria, nombre ASC"),
        sql.query("SELECT * FROM secciones_web WHERE activo = true ORDER BY orden ASC"),
        sql.query("SELECT clave, valor FROM configuracion_web"),
      ]);

      const neonProducts = mapNeonProducts(prodsRes);
      const neonSections = mapNeonSections(secsRes);
      const neonTherapies = mapNeonTherapies(prodsRes);

      const customConfig = { ...defaultWebData.config };
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
        });
      }

      // Si la consulta a Neon tuvo éxito, devolvemos fielmente los datos de Neon (incluso si el catálogo está vacío)
      return {
        ...defaultWebData,
        config: customConfig,
        products: neonProducts,
        sections: neonSections.length > 0 ? neonSections : defaultWebData.sections,
        therapies: neonTherapies.length > 0 ? neonTherapies : defaultWebData.therapies,
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
      if (directJson && (directJson.productos || directJson.products)) {
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
          if (blobJson && (blobJson.productos || blobJson.products)) {
            return buildWebDataFromPayload(blobJson);
          }
        }
      }
    } catch {}
  }

  // 3. RESPALDO FINAL: Datos locales por defecto
  return defaultWebData;
}
