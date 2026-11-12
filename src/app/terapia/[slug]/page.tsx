import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCatalogoSeo, recortar } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function buscar(slug: string) {
  const cat = await getCatalogoSeo();
  const hallado = cat.terapias.find((t) => t.slug === slug);
  return { cat, hallado };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { hallado } = await buscar(slug);
  if (!hallado) return { title: "Terapia no encontrada", robots: { index: false } };
  const t = hallado.item;
  const descripcion = recortar(t.shortDescription || t.fullDescription, 160);
  return {
    title: t.title,
    description: descripcion,
    alternates: { canonical: `/terapia/${slug}` },
    openGraph: {
      title: t.title,
      description: descripcion,
      url: `${SITE_URL}/terapia/${slug}`,
      type: "website",
      images: t.imageUrl ? [{ url: t.imageUrl, alt: t.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: t.title, description: descripcion, images: t.imageUrl ? [t.imageUrl] : undefined },
  };
}

export default async function TerapiaPage({ params }: Props) {
  const { slug } = await params;
  const { cat, hallado } = await buscar(slug);
  if (!hallado) notFound();
  const t = hallado.item;
  const config = cat.data.config;
  const url = `${SITE_URL}/terapia/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t.title,
    description: recortar(t.fullDescription || t.shortDescription, 500),
    image: t.imageUrl ? [t.imageUrl] : undefined,
    url,
    serviceType: t.categoryLabel,
    areaServed: config.city || "Boiro",
    provider: { "@type": "LocalBusiness", name: config.name, url: `${SITE_URL}/` },
  };

  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: t.title, item: url },
    ],
  };

  const whatsapp = config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola, quiero reservar: ${t.title}`)}` : null;

  return (
    <>
      <Navbar config={config} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-28 sm:px-6">
        <JsonLd data={jsonLd} />
        <JsonLd data={migas} />
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-[#2f9a3b]">
          <Link href="/" className="hover:underline">Inicio</Link> · <span className="text-[#212924]">{t.title}</span>
        </nav>
        <article className="grid gap-8 md:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.imageUrl} alt={t.title} className="w-full rounded-2xl object-cover shadow-sm" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2f9a3b]">{t.categoryLabel}</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-[#212924] sm:text-4xl">{t.title}</h1>
            <p className="mt-2 text-[#2f9a3b]">{t.subtitle}</p>
            <p className="mt-4 text-sm text-gray-700">Duración: {t.duration}{t.priceNote ? ` · ${t.priceNote}` : ""}</p>
            <p className="mt-5 whitespace-pre-line text-[#3b4740]">{t.fullDescription || t.shortDescription}</p>
            {t.benefits.length > 0 ? (
              <ul className="mt-5 list-disc space-y-1 pl-5 text-[#3b4740]">
                {t.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#2f9a3b] px-6 py-3 font-semibold text-white transition hover:bg-[#237a2d]">
                  Reservar por WhatsApp
                </a>
              ) : null}
              <Link href="/#carta-terapias" className="font-semibold text-[#2f9a3b] hover:underline">Ver todas las terapias</Link>
            </div>
          </div>
        </article>
      </main>
      <Footer config={config} />
    </>
  );
}
