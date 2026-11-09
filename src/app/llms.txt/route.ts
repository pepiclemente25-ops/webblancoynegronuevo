import { getCatalogoSeo, recortar } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Resumen del sitio en texto plano para asistentes de IA (formato llms.txt)
export async function GET() {
  const { data, productos, terapias } = await getCatalogoSeo();
  const c = data.config;

  const lineas: string[] = [
    `# ${c.name}`,
    "",
    `> ${recortar(c.description || c.tagline, 300)}`,
    "",
    "## Contacto",
    `- Dirección: ${[c.address, c.city].filter(Boolean).join(", ")}`,
    ...(c.phoneDisplay || c.phone ? [`- Teléfono: ${c.phoneDisplay || c.phone}`] : []),
    ...(c.email ? [`- Email: ${c.email}`] : []),
    ...(c.schedule ? [`- Horario: ${c.schedule}`] : []),
    "",
    "## Terapias y servicios",
    ...terapias.map(({ slug, item }) => `- [${item.title}](${SITE_URL}/terapia/${slug}): ${recortar(item.shortDescription, 140)}`),
    "",
    "## Tienda",
    ...productos.map(({ slug, item }) => `- [${item.name}](${SITE_URL}/producto/${slug}): ${recortar(item.shortDescription, 140)} (${item.price.toFixed(2)} €)`),
    "",
    "## Más",
    `- [Inicio](${SITE_URL}/)`,
    `- [Mapa del sitio](${SITE_URL}/sitemap.xml)`,
    "",
  ].filter((l, i, arr) => !(l === "" && arr[i - 1] === ""));

  return new Response(lineas.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
