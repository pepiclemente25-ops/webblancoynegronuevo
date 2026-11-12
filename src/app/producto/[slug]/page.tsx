import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getCatalogoSeo, recortar } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function buscar(slug: string) {
  const cat = await getCatalogoSeo();
  const hallado = cat.productos.find((p) => p.slug === slug);
  return { cat, hallado };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { hallado } = await buscar(slug);
  if (!hallado) return { title: "Producto no encontrado", robots: { index: false } };
  const p = hallado.item;
  const descripcion = recortar(p.shortDescription || p.fullDescription, 160);
  return {
    title: p.name,
    description: descripcion,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      title: p.name,
      description: descripcion,
      url: `${SITE_URL}/producto/${slug}`,
      type: "website",
      images: p.imageUrl ? [{ url: p.imageUrl, alt: p.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: p.name, description: descripcion, images: p.imageUrl ? [p.imageUrl] : undefined },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const { cat, hallado } = await buscar(slug);
  if (!hallado) notFound();
  const p = hallado.item;
  const config = cat.data.config;
  const url = `${SITE_URL}/producto/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: recortar(p.fullDescription || p.shortDescription, 500),
    image: (p.images && p.images.length > 0 ? p.images : [p.imageUrl]).filter(Boolean),
    sku: p.id,
    category: p.categoryLabel,
    brand: { "@type": "Brand", name: config.name },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: p.price.toFixed(2),
      availability: p.inStock ? "https://schema.org/InStock" : p.accionAgotado === "bajo_encargo" ? "https://schema.org/BackOrder" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: config.name },
    },
  };

  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: p.name, item: url },
    ],
  };

  return (
    <>
      <Navbar config={config} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-28 sm:px-6">
        <JsonLd data={jsonLd} />
        <JsonLd data={migas} />
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-[#2f9a3b]">
          <Link href="/" className="hover:underline">Inicio</Link> · <Link href="/#tienda" className="hover:underline">Tienda</Link> · <span className="text-[#212924]">{p.name}</span>
        </nav>
        <article className="grid gap-8 md:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl} alt={p.name} className="w-full rounded-2xl object-cover shadow-sm" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2f9a3b]">{p.categoryLabel}</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-[#212924] sm:text-4xl">{p.name}</h1>
            <p className="mt-4 text-2xl font-bold text-[#237a2d]">
              {p.price.toFixed(2)} €
              {p.originalPrice ? <span className="ml-3 text-base font-normal text-gray-500 line-through">{p.originalPrice.toFixed(2)} €</span> : null}
            </p>
            <p className="mt-1 text-sm text-gray-600">{p.inStock ? "Disponible" : p.accionAgotado === "bajo_encargo" ? "Bajo encargo" : "Agotado"}</p>
            {p.shortDescription ? <p className="mt-5 text-lg text-[#212924]">{p.shortDescription}</p> : null}
            {p.fullDescription && p.fullDescription !== p.shortDescription ? (
              <p className="mt-3 whitespace-pre-line text-[#3b4740]">{p.fullDescription}</p>
            ) : null}
            {p.benefits.length > 0 ? (
              <ul className="mt-5 list-disc space-y-1 pl-5 text-[#3b4740]">
                {p.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddToCartButton product={p} />
              <Link href="/#tienda" className="font-semibold text-[#2f9a3b] hover:underline">Ver toda la tienda</Link>
            </div>
          </div>
        </article>
      </main>
      <Footer config={config} />
    </>
  );
}
