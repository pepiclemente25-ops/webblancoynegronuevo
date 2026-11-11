import { cache } from "react";
import { getWebData } from "@/lib/content";
import { conSlugs } from "@/lib/site";
import type { ShopProduct, Therapy, WebData } from "@/types/content";

export interface CatalogoSeo {
  data: WebData;
  productos: { slug: string; item: ShopProduct }[];
  terapias: { slug: string; item: Therapy }[];
}

/** Catálogo con URLs amigables, leído una sola vez por petición. */
export const getCatalogoSeo = cache(async (): Promise<CatalogoSeo> => {
  const data = await getWebData();
  const soloProductos = (data.products || []).filter((p) => !p.esServicio && p.category !== "terapias");
  return {
    data,
    productos: conSlugs(soloProductos, (p) => p.name, (p) => p.id),
    terapias: conSlugs(data.therapies || [], (t) => t.title, (t) => t.id),
  };
});

export function recortar(texto: string | undefined, max = 160): string {
  const t = (texto || "").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…";
}
