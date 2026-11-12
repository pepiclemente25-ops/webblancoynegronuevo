"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { ShopProduct } from "@/types/content";

export function AddToCartButton({ product }: { product: ShopProduct }) {
  const { addToCart } = useCart();
  const agotado = !product.inStock && product.accionAgotado !== "bajo_encargo";

  return (
    <button
      type="button"
      disabled={agotado}
      onClick={() => addToCart(product, 1)}
      className="inline-flex items-center gap-2 rounded-full bg-[#2f9a3b] px-6 py-3 font-semibold text-white transition hover:bg-[#237a2d] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingBag className="h-5 w-5" />
      {agotado ? "Agotado" : product.inStock ? "Añadir al carrito" : "Encargar"}
    </button>
  );
}
