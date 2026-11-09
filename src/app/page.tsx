import Link from "next/link";
import { getCatalogoSeo } from "@/lib/seo";
import { MainPageClient } from "@/components/MainPageClient";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { data, productos, terapias } = await getCatalogoSeo();
  const c = data.config;

  const negocio = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#negocio`,
    name: c.name,
    description: c.description,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/icon.png`,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: c.city,
      addressCountry: "ES",
    },
    ...(c.schedule ? { openingHours: c.schedule } : {}),
    sameAs: [c.googleMapsUrl, c.googleReviewsUrl].filter(Boolean),
  };

  const sitio = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: c.name,
    url: `${SITE_URL}/`,
    inLanguage: "es",
  };

  return (
    <>
      <JsonLd data={negocio} />
      <JsonLd data={sitio} />
      <MainPageClient data={data} />
      {/* Enlaces rastreables a cada ficha, para que Google y los asistentes de IA las encuentren */}
      <section aria-label="Catálogo completo" className="bg-[#fbf9f5] px-4 py-12 text-[#212924]">
        <div className="mx-auto max-w-7xl">
          {terapias.length > 0 ? (
            <>
              <h2 className="font-serif text-2xl font-bold">Nuestras terapias</h2>
              <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {terapias.map(({ slug, item }) => (
                  <li key={slug}><Link href={`/terapia/${slug}`} className="text-[#4a6b5d] hover:underline">{item.title}</Link></li>
                ))}
              </ul>
            </>
          ) : null}
          {productos.length > 0 ? (
            <>
              <h2 className="mt-8 font-serif text-2xl font-bold">Productos de la tienda</h2>
              <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {productos.map(({ slug, item }) => (
                  <li key={slug}><Link href={`/producto/${slug}`} className="text-[#4a6b5d] hover:underline">{item.name}</Link></li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
