import type { MetadataRoute } from "next";
import { getCatalogoSeo } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Se genera en cada petición a partir de la base de datos: los productos nuevos aparecen solos.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { productos, terapias } = await getCatalogoSeo();
  const ahora = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    ...terapias.map(({ slug }) => ({
      url: `${SITE_URL}/terapia/${slug}`,
      lastModified: ahora,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...productos.map(({ slug }) => ({
      url: `${SITE_URL}/producto/${slug}`,
      lastModified: ahora,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
