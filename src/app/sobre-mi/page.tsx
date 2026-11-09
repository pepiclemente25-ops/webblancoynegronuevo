import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCatalogoSeo, recortar } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCatalogoSeo();
  const nombre = data.config.therapistName || "Pepi";
  const descripcion = recortar(
    `Conoce a ${nombre}, terapeuta holística en ${data.config.city || "Boiro"}: quiromasaje, Reiki, Registros Akáshicos y respiración consciente en Blanco y Negro.`,
    160
  );
  return {
    title: `Sobre mí: ${nombre}, terapeuta holística en ${data.config.city || "Boiro"}`,
    description: descripcion,
    alternates: { canonical: "/sobre-mi" },
    openGraph: { title: `Sobre mí | ${data.config.name}`, description: descripcion, url: `${SITE_URL}/sobre-mi`, type: "profile" },
  };
}

export default async function SobreMiPage() {
  const { data, terapias } = await getCatalogoSeo();
  const c = data.config;
  const nombre = c.therapistName || "Pepi";
  const url = `${SITE_URL}/sobre-mi`;
  const ubicacion = [c.address, c.city].filter(Boolean).join(", ");

  const persona = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#terapeuta`,
    name: nombre,
    jobTitle: "Terapeuta holística",
    description: recortar(c.therapistBio, 300),
    url,
    worksFor: { "@type": "HealthAndBeautyBusiness", "@id": `${SITE_URL}/#negocio`, name: c.name, url: `${SITE_URL}/` },
    workLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: c.city, addressCountry: "ES" } },
    knowsAbout: ["Quiromasaje", "Reiki Usui", "Registros Akáshicos", "Respiración consciente", "Terapias holísticas"],
  };
  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Sobre mí", item: url },
    ],
  };

  return (
    <>
      <Navbar config={c} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-28 sm:px-6">
        <JsonLd data={persona} />
        <JsonLd data={migas} />
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-[#4a6b5d]">
          <Link href="/" className="hover:underline">Inicio</Link> · <span className="text-[#212924]">Sobre mí</span>
        </nav>

        <h1 className="font-serif text-3xl font-bold text-[#212924] sm:text-4xl">
          Hola, soy {nombre}
        </h1>
        <p className="mt-2 text-lg text-[#4a6b5d]">Terapeuta holística en {c.city || "Boiro"} · {c.name}</p>

        <section className="mt-8 space-y-4 text-[#3b4740]">
          <p className="whitespace-pre-line">{c.therapistBio}</p>
          <p>
            {c.name} es mi espacio en {c.city || "Boiro"}. Está pensado como un lugar tranquilo al que venir a parar, a soltar
            tensión y a escucharte, ya sea con una sesión de terapia o paseando entre los productos de la tienda.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-[#212924]">Qué ofrezco</h2>
          <p className="mt-3 text-[#3b4740]">
            Trabajo con técnicas de cuidado corporal y de armonización energética: quiromasaje, Reiki Usui, lectura de
            Registros Akáshicos y respiración consciente. Además, en la tienda encontrarás aromaterapia, minerales,
            inciensos y otros artículos para tu bienestar diario.
          </p>
          {terapias.length > 0 ? (
            <ul className="mt-4 grid gap-1 sm:grid-cols-2">
              {terapias.map(({ slug, item }) => (
                <li key={slug}><Link href={`/terapia/${slug}`} className="text-[#4a6b5d] hover:underline">{item.title}</Link></li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-[#212924]">Cómo trabajo</h2>
          <p className="mt-3 text-[#3b4740]">
            Cada persona llega en un momento distinto, así que cada sesión empieza escuchando qué necesitas y se adapta a
            ti. Sin prisas y con respeto por tus tiempos.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-[#212924]">Dónde encontrarme</h2>
          <ul className="mt-3 space-y-1 text-[#3b4740]">
            {ubicacion ? <li><strong>Dirección:</strong> {ubicacion}</li> : null}
            {c.schedule ? <li><strong>Horario:</strong> {c.schedule}</li> : null}
            {c.phoneDisplay || c.phone ? <li><strong>Teléfono:</strong> {c.phoneDisplay || c.phone}</li> : null}
            {c.email ? <li><strong>Email:</strong> {c.email}</li> : null}
          </ul>
          <p className="mt-4">
            <Link href="/#carta-terapias" className="font-semibold text-[#4a6b5d] hover:underline">Ver terapias y reservar</Link>
            {" · "}
            <Link href="/" className="font-semibold text-[#4a6b5d] hover:underline">Volver al inicio</Link>
          </p>
        </section>

        <p className="mt-10 border-t border-[#ebdcca] pt-6 text-sm text-gray-600">
          {c.disclaimerLegal ||
            "Las terapias y actividades ofrecidas son herramientas de bienestar, relajación y desarrollo personal. En ningún caso constituyen un acto médico ni sustituyen tratamientos médicos o psicológicos."}
        </p>
      </main>
      <Footer config={c} />
    </>
  );
}
