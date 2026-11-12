"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  Store,
  Truck,
  CreditCard,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

type DrawerStep = "cart" | "checkout" | "success";

// Bizum desactivado: el número mostrado era ficticio (600 123 456).
// Para reactivarlo, poner a true y pasar el teléfono real de Bizum a <CartDrawer />.
const BIZUM_ENABLED = false;

interface CartDrawerProps {
  phoneDisplay?: string;
  bizumPhone?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  phoneDisplay = "600 123 456",
  bizumPhone = "600123456",
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();

  const [step, setStep] = useState<DrawerStep>("cart");

  // Formulario del cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"tienda" | "envio">("tienda");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [selectedPaymentMethod, setPaymentMethod] = useState<"bizum" | "tienda">("bizum");
  // Con Bizum desactivado: recogida = pago en tienda; envío = pago a convenir con la tienda.
  const paymentMethod: "bizum" | "tienda" | "a_convenir" = BIZUM_ENABLED
    ? selectedPaymentMethod
    : deliveryType === "envio"
      ? "a_convenir"
      : "tienda";
  const [notes, setNotes] = useState("");

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    orderDate: string;
    finalTotal: number;
    clientName: string;
  } | null>(null);

  // Estados de copiado
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setErrorMessage("");
    setStep("checkout");
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage("Por favor, rellena nombre, correo electrónico y teléfono.");
      return;
    }

    if (deliveryType === "envio" && (!clientAddress.trim() || !clientCity.trim())) {
      setErrorMessage("Por favor, indica tu dirección y ciudad para el envío.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total: totalPrice,
          deliveryType,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          clientAddress: clientAddress.trim(),
          clientCity: clientCity.trim(),
          clientPostalCode: clientPostalCode.trim(),
          paymentMethod,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al procesar el pedido");
      }

      setOrderResult({
        orderId: data.orderId,
        orderDate: data.orderDate,
        finalTotal: totalPrice,
        clientName: clientName.trim(),
      });

      // Vaciar carrito
      clearCart();
      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo tramitar el pedido. Inténtalo de nuevo.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setIsCartOpen(false);
    if (step === "success") {
      setStep("cart");
      setOrderResult(null);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setClientAddress("");
      setClientCity("");
      setClientPostalCode("");
      setNotes("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleCloseAndReset}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#d3ebcf]">
          
          {/* ============================================================ */}
          {/* CABECERA DEL DRAWER */}
          {/* ============================================================ */}
          <div className="bg-[#2f9a3b] px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step === "checkout" ? (
                <button
                  onClick={() => setStep("cart")}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer"
                  title="Volver a la cesta"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#7fd6c2]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              )}

              <div>
                <h3 className="font-serif text-base font-semibold leading-tight">
                  {step === "cart" && "Tu Cesta Holística"}
                  {step === "checkout" && "Finalizar Pedido"}
                  {step === "success" && "¡Pedido Confirmado!"}
                </h3>
                <p className="text-xs text-white/80">
                  {step === "cart" && `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`}
                  {step === "checkout" && "Paso 2 de 2: Datos de entrega"}
                  {step === "success" && "Comanda registrada con éxito"}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* VISTA 1: LISTA DEL CARRITO */}
          {/* ============================================================ */}
          {step === "cart" && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#eff9e6] text-[#2f9a3b] mx-auto flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 opacity-60" />
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-[#212924]">Tu cesta está vacía</h4>
                    <p className="text-xs text-[#6e7d73] max-w-xs mx-auto">
                      Añade algún aceite botánico, mineral o saquito de autocuidado para iniciar tu pedido.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2f9a3b] hover:underline cursor-pointer"
                    >
                      <span>Explorar tienda &rarr;</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#f7fbef] border border-[#d3ebcf]"
                      >
                        {/* Miniatura */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#d3ebcf] flex-shrink-0">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Datos */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#212924] truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs font-bold text-[#2f9a3b] mt-0.5">
                            {item.product.price.toFixed(2)}€
                          </p>

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="inline-flex items-center border border-[#cdeccb] rounded-lg bg-white">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-[#eaf7e3] text-[#4a584f] cursor-pointer"
                                aria-label="Restar una unidad"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-[#212924]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-[#eaf7e3] text-[#4a584f] cursor-pointer"
                                aria-label="Añadir una unidad"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-[#9aa79f] hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal del item */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-[#212924]">
                            {(item.product.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pie con Subtotal y Botón Tramitar */}
              {items.length > 0 && (
                <div className="p-6 border-t border-[#d3ebcf] bg-[#f7fbef] space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#6e7d73]">
                      <span>Subtotal ({totalItems} productos)</span>
                      <span>{totalPrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6e7d73]">
                      <span>Entrega</span>
                      <span className="text-[#2f9a3b] font-semibold">Gratis en tienda (Boiro) / A consultar</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-[#212924] pt-1.5 border-t border-[#d3ebcf]">
                      <span>Total</span>
                      <span className="text-base text-[#2f9a3b]">{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-2xl bg-[#2f9a3b] hover:bg-[#237a2d] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Continuar y Tramitar Pedido</span>
                    <ArrowRight className="w-4 h-4 text-[#7fd6c2]" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#718276]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2f9a3b]" />
                    <span>Sin registros ni contraseñas. Directo y seguro.</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* VISTA 2: FORMULARIO DE CHECKOUT INTERNO */}
          {/* ============================================================ */}
          {step === "checkout" && (
            <form onSubmit={handleConfirmOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Resumen del pedido */}
                <div className="p-3 rounded-xl bg-[#eff9e6] border border-[#d3ebcf] flex items-center justify-between text-xs">
                  <span className="text-[#4a584f]">
                    Comprando <strong>{totalItems}</strong> {totalItems === 1 ? "artículo" : "artículos"}
                  </span>
                  <span className="font-serif font-bold text-sm text-[#2f9a3b]">
                    Total: {totalPrice.toFixed(2)}€
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* 1. Datos Personales */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                    1. Tus Datos de Contacto
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4a584f] mb-1">
                        Nombre y Apellidos *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carmen Martínez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9a3b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4a584f] mb-1">
                        Correo Electrónico * (para enviarte el recibo)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="carmen@ejemplo.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9a3b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4a584f] mb-1">
                        Teléfono Móvil * (para avisarte de la entrega)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="600 000 000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9a3b]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Modalidad de Entrega */}
                <div className="space-y-3 pt-2 border-t border-[#d3ebcf]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                    2. Modalidad de Entrega
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("tienda")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        deliveryType === "tienda"
                          ? "bg-[#e3f5e0] border-[#2f9a3b] ring-1 ring-[#2f9a3b]"
                          : "bg-white border-[#cfe6cb] hover:bg-[#f1faea]"
                      }`}
                    >
                      <Store className="w-4 h-4 text-[#2f9a3b] mb-1.5" />
                      <span className="block text-xs font-semibold text-[#212924]">Recogida en Tienda</span>
                      <span className="text-[10px] text-[#2f9a3b] font-medium">Gratis · Boiro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("envio")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        deliveryType === "envio"
                          ? "bg-[#e3f5e0] border-[#2f9a3b] ring-1 ring-[#2f9a3b]"
                          : "bg-white border-[#cfe6cb] hover:bg-[#f1faea]"
                      }`}
                    >
                      <Truck className="w-4 h-4 text-[#2f9a3b] mb-1.5" />
                      <span className="block text-xs font-semibold text-[#212924]">Envío a Domicilio</span>
                      <span className="text-[10px] text-[#718276]">Consultar mensajería</span>
                    </button>
                  </div>

                  {deliveryType === "envio" && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        required
                        placeholder="Calle, número, piso y puerta"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f9a3b]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Código Postal"
                          value={clientPostalCode}
                          onChange={(e) => setClientPostalCode(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f9a3b]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Ciudad / Provincia"
                          value={clientCity}
                          onChange={(e) => setClientCity(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f9a3b]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Método de Pago Preferido */}
                <div className="space-y-3 pt-2 border-t border-[#d3ebcf]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                    3. Método de Pago Preferido
                  </h4>
                  <div className="space-y-2">
                    {BIZUM_ENABLED && (
                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "bizum"
                          ? "bg-[#f0fbf6] border-[#2f9a3b] ring-1 ring-[#2f9a3b]"
                          : "bg-white border-[#cfe6cb]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "bizum"}
                        onChange={() => setPaymentMethod("bizum")}
                        className="mt-0.5 text-[#2f9a3b] focus:ring-[#2f9a3b]"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-semibold text-[#212924] block">Bizum Directo</span>
                        <span className="text-[11px] text-[#6e7d73]">
                          Al confirmar verás el número de Bizum y tu concepto de pedido para hacer el abono.
                        </span>
                      </div>
                    </label>
                    )}

                    {deliveryType === "tienda" && (
                      <label
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === "tienda"
                            ? "bg-[#f0fbf6] border-[#2f9a3b] ring-1 ring-[#2f9a3b]"
                            : "bg-white border-[#cfe6cb]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "tienda"}
                          onChange={() => setPaymentMethod("tienda")}
                          className="mt-0.5 text-[#2f9a3b] focus:ring-[#2f9a3b]"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-[#212924] block">En Efectivo / Tarjeta al Recoger</span>
                          <span className="text-[11px] text-[#6e7d73]">
                            Paga en persona en la tienda en Boiro al retirar tu paquete.
                          </span>
                        </div>
                      </label>
                    )}

                    {!BIZUM_ENABLED && deliveryType === "envio" && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl border bg-[#f0fbf6] border-[#2f9a3b] ring-1 ring-[#2f9a3b]">
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-[#212924] block">Pago a convenir con la tienda</span>
                          <span className="text-[11px] text-[#6e7d73]">
                            Te llamaremos al teléfono indicado para confirmar el envío y acordar la forma de pago.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Notas adicionales */}
                <div className="pt-2 border-t border-[#d3ebcf]">
                  <label className="block text-[11px] font-medium text-[#4a584f] mb-1">
                    Notas o peticiones especiales (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Si tenéis otra variedad de incienso, avisadme..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdeccb] text-[#212924] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f9a3b]"
                  />
                </div>

              </div>

              {/* Botón de Confirmación */}
              <div className="p-6 border-t border-[#d3ebcf] bg-[#f7fbef] space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-[#2f9a3b] hover:bg-[#237a2d] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#7fd6c2]" />
                      <span>Registrando pedido...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#7fd6c2]" />
                      <span>Confirmar Pedido ({totalPrice.toFixed(2)}€)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#718276]">
                  Al confirmar, recibirás tu código de pedido oficial y las instrucciones en pantalla.
                </p>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VISTA 3: CONFIRMACIÓN DE ÉXITO INTERNA */}
          {/* ============================================================ */}
          {step === "success" && orderResult && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                
                {/* Cabecera de éxito */}
                <div className="text-center pt-2 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#e3f5e0] text-[#2e7d32] mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#212924]">
                    ¡Pedido Registrado con Éxito!
                  </h4>
                  <p className="text-xs text-[#55645a]">
                    Gracias, <strong>{orderResult.clientName}</strong>. Hemos generado tu comanda correctamente.
                  </p>
                </div>

                {/* Tarjeta con Número de Pedido Oficial */}
                <div className="p-4 rounded-2xl bg-[#f1faea] border border-[#7fd6c2] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7c6332]">
                    Tu Número de Pedido
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xl font-bold text-[#212924]">
                      {orderResult.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderResult.orderId, "orderId")}
                      className="p-1 rounded-lg hover:bg-[#d3ebcf] text-[#2f9a3b] transition-colors cursor-pointer"
                      title="Copiar código de pedido"
                    >
                      {copiedField === "orderId" ? (
                        <Check className="w-4 h-4 text-green-700" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-[#6e7d73] block">
                    Fecha: {orderResult.orderDate} · Total: {orderResult.finalTotal.toFixed(2)}€
                  </span>
                </div>

                {/* Instrucciones de Pago */}
                {BIZUM_ENABLED && paymentMethod === "bizum" ? (
                  <div className="p-4 rounded-2xl bg-[#f7fbef] border border-[#cdeccb] space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2f9a3b]" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                        Instrucciones para tu Bizum
                      </h5>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#d3ebcf]">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Número de teléfono:</span>
                          <strong className="text-sm text-[#212924]">{phoneDisplay}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bizumPhone, "bizumPhone")}
                          className="px-2.5 py-1 rounded-lg bg-[#e3f5e0] hover:bg-[#cdeccb] text-[#2f9a3b] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === "bizumPhone" ? (
                            <>
                              <Check className="w-3 h-3 text-green-700" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#d3ebcf]">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Concepto obligatorio:</span>
                          <strong className="text-sm font-mono text-[#2f9a3b]">{orderResult.orderId}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(orderResult.orderId, "concept")}
                          className="px-2.5 py-1 rounded-lg bg-[#e3f5e0] hover:bg-[#cdeccb] text-[#2f9a3b] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === "concept" ? (
                            <>
                              <Check className="w-3 h-3 text-green-700" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#d3ebcf]">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Importe exacto:</span>
                          <strong className="text-sm text-[#212924]">{orderResult.finalTotal.toFixed(2)}€</strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6e7d73] leading-relaxed">
                      💡 Realiza el Bizum con ese número y concepto. En cuanto Pepi lo confirme, te avisará al teléfono facilitado para coordinar la recogida o entrega.
                    </p>
                  </div>
                ) : paymentMethod === "a_convenir" ? (
                  <div className="p-4 rounded-2xl bg-[#f7fbef] border border-[#cdeccb] space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                      Envío a Domicilio
                    </h5>
                    <p className="text-xs text-[#55645a] leading-relaxed">
                      Hemos recibido tu pedido. Te llamaremos al teléfono que nos has facilitado para confirmar el envío y acordar la forma de pago.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#f7fbef] border border-[#cdeccb] space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#2f9a3b]">
                      Recogida en Tienda
                    </h5>
                    <p className="text-xs text-[#55645a] leading-relaxed">
                      Tu pedido te estará esperando en nuestra tienda en <strong>Boiro</strong>. Podrás abonarlo cómodamente en efectivo o con tarjeta en el momento de la recogida.
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de cierre */}
              <div className="pt-4 border-t border-[#d3ebcf] space-y-2">
                <button
                  onClick={handleCloseAndReset}
                  className="w-full py-3 rounded-2xl bg-[#2f9a3b] hover:bg-[#237a2d] text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
