import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get("host") || "").toLowerCase();
  const esDominioPrincipal = host === "blanconegro.es" || host === "www.blanconegro.es";

  // Cualquier otra dirección (p. ej. *.workers.dev) no debe indexarse, para no duplicar contenido
  if (!esDominioPrincipal) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/escaner"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
