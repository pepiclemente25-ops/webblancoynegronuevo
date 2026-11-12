// Dirección pública definitiva de la web (sin barra final). Se puede sobrescribir con NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://blanconegro.es").replace(/\/+$/, "");

export function slugify(texto: string): string {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Asigna a cada elemento una URL amigable única (si dos nombres coinciden, añade el id). */
export function conSlugs<T>(
  items: T[],
  nombre: (t: T) => string,
  id: (t: T) => string
): { slug: string; item: T }[] {
  const usados = new Set<string>();
  return items.map((item, idx) => {
    let slug = slugify(nombre(item)) || `articulo-${idx + 1}`;
    if (usados.has(slug)) {
      const extra = slugify(id(item)) || String(idx + 1);
      slug = `${slug}-${extra}`;
      let n = 2;
      while (usados.has(slug)) slug = `${slug}-${n++}`;
    }
    usados.add(slug);
    return { slug, item };
  });
}

// Nombre completo de la terapeuta (el TPV aún no lo envía a la web). El nombre corto ("Pepi") sale de la configuración.
export const TERAPEUTA_NOMBRE_COMPLETO = "Josefa Clemente Martínez";

/**
 * Aviso temporal de "web en actualización". Para quitarlo: cambiar a false (o borrar este bloque
 * y el componente AvisoPruebas) y publicar.
 */
export const MOSTRAR_AVISO_PRUEBAS = true;
export const TEXTO_AVISO_PRUEBAS = "Web en pruebas: tratamientos y productos pueden ser erróneos";
