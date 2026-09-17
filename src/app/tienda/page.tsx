import { Metadata } from "next";
import { getWebData } from "@/lib/content";
import { defaultShopProducts } from "@/data/shopProducts";
import { ShopClient } from "./ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tienda Holística & Autocuidado | Blanco y Negro - Terapias",
  description:
    "Selección botánica, aromaterapia pura, minerales y herramientas de bienestar para prolongar tu armonía en casa. Pedidos directos en la web, Bizum y recogida en tienda en Boiro.",
  openGraph: {
    title: "Tienda Holística & Autocuidado | Blanco y Negro",
    description: "Aceites esenciales puros, minerales para chakras y herramientas de masaje consciente.",
  },
};

export default async function TiendaPage() {
  const data = await getWebData();
  const products = data.products ?? [];

  return (
    <ShopClient
      config={data.config}
      products={products}
      therapies={data.therapies}
      sections={data.sections}
    />
  );
}
