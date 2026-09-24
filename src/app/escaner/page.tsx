"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Barcode,
  Type,
  Tag,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

// Tipos para los desplegables de configuración
interface OpcionConfig {
  id: string;
  nombre: string;
}

// Helper para emitir un 'beep' agradable vía Web Audio API
function reproducirBeep(frecuencia = 880, duracion = 0.12, tipo: OscillatorType = "sine") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = frecuencia;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duracion);
  } catch {}
}

export default function EscanerPage() {
  // Estado general de seguridad y sesión
  const [estadoCarga, setEstadoCarga] = useState<"verificando" | "desactivado" | "pedir_pin" | "listo">("verificando");
  const [tokenSesion, setTokenSesion] = useState<string>("");
  const [pinEntrada, setPinEntrada] = useState<string>("");
  const [errorPin, setErrorPin] = useState<string>("");
  const [pinSacudida, setPinSacudida] = useState(false);

  // Estadísticas de la sesión
  const [articulosCatalogados, setArticulosCatalogados] = useState<number>(0);
  const [ultimoArticuloGuardado, setUltimoArticuloGuardado] = useState<string>("");

  // Opciones de configuración (familias y bienestares cargados desde Neon)
  const [familias, setFamilias] = useState<OpcionConfig[]>([
    { id: "sin-asignacion", nombre: "Sin asignación" },
  ]);
  const [bienestares, setBienestares] = useState<OpcionConfig[]>([
    { id: "sin-bienestar-asignado", nombre: "Sin bienestar asignado" },
  ]);
  const [siguienteCodigoSugerido, setSiguienteCodigoSugerido] = useState<string>("BN-10001");

  // Campos del formulario del producto actual
  const [nombre, setNombre] = useState<string>("");
  const [ean, setEan] = useState<string>("");
  const [ref, setRef] = useState<string>("");
  const [familiaId, setFamiliaId] = useState<string>("sin-asignacion");
  const [bienestarId, setBienestarId] = useState<string>("sin-bienestar-asignado");
  const [precioVenta, setPrecioVenta] = useState<string>("");
  const [precioCoste, setPrecioCoste] = useState<string>("");
  const [stockActual, setStockActual] = useState<number>(1);
  const [ubicacion, setUbicacion] = useState<string>("");
  const [publicadoWeb, setPublicadoWeb] = useState<boolean>(false);
  const [imagenes, setImagenes] = useState<string[]>([]);

  // Estados de modales de escaneo y cámara
  const [modalBarcode, setModalBarcode] = useState<boolean>(false);
  const [modalOcr, setModalOcr] = useState<"titulo" | "ref" | null>(null);
  const [textoDetectadoOcr, setTextoDetectadoOcr] = useState<string>("");
  const [procesandoOcr, setProcesandoOcr] = useState<boolean>(false);
  const [guardandoProducto, setGuardandoProducto] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string>("");
  const [mensajeAviso, setMensajeAviso] = useState<string>("");
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);

  // Referencias para elementos de cámara y escaneo
  const html5QrCodeRef = useRef<any>(null);
  const videoOcrRef = useRef<HTMLVideoElement | null>(null);
  const streamOcrRef = useRef<MediaStream | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  // 1. Verificación inicial de estado del escáner en Neon
  const verificarEstado = useCallback(async () => {
    setEstadoCarga("verificando");
    try {
      const storedToken = sessionStorage.getItem("escaner_token") || "";
      const res = await fetch("/api/escaner/auth", {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
      const data = await res.json();

      if (!data.activo) {
        setEstadoCarga("desactivado");
        return;
      }

      if (data.autenticado && storedToken) {
        setTokenSesion(storedToken);
        setEstadoCarga("listo");
        cargarConfiguracion(storedToken);
      } else {
        setEstadoCarga("pedir_pin");
      }
    } catch (err) {
      console.error("Error verificando estado:", err);
      setEstadoCarga("desactivado");
    }
  }, []);

  useEffect(() => {
    verificarEstado();
  }, [verificarEstado]);

  // Cargar familias, bienestares y código sugerido
  const cargarConfiguracion = async (token: string) => {
    try {
      const res = await fetch("/api/escaner/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.familias) && data.familias.length > 0) {
          setFamilias(data.familias);
        }
        if (Array.isArray(data.bienestares) && data.bienestares.length > 0) {
          setBienestares(data.bienestares);
        }
        if (data.siguienteCodigoInterno) {
          setSiguienteCodigoSugerido(data.siguienteCodigoInterno);
        }
      }
    } catch (e) {
      console.warn("Aviso cargando configuración:", e);
    }
  };

  // Manejar teclado PIN
  const handleDigitoPin = async (num: string) => {
    if (pinEntrada.length >= 4) return;
    const nuevoPin = pinEntrada + num;
    setPinEntrada(nuevoPin);
    setErrorPin("");

    if (nuevoPin.length === 4) {
      try {
        const res = await fetch("/api/escaner/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: nuevoPin }),
        });
        const data = await res.json();
        if (data.success && data.token) {
          sessionStorage.setItem("escaner_token", data.token);
          setTokenSesion(data.token);
          setEstadoCarga("listo");
          setPinEntrada("");
          reproducirBeep(987, 0.15, "triangle");
          cargarConfiguracion(data.token);
        } else {
          setErrorPin(data.error || "PIN incorrecto");
          setPinSacudida(true);
          reproducirBeep(300, 0.3, "sawtooth");
          setTimeout(() => {
            setPinSacudida(false);
            setPinEntrada("");
          }, 600);
        }
      } catch {
        setErrorPin("Error de conexión al validar PIN.");
        setPinEntrada("");
      }
    }
  };

  const handleBorrarPin = () => {
    setPinEntrada((prev) => prev.slice(0, -1));
    setErrorPin("");
  };

  const handleCerrarSesion = () => {
    sessionStorage.removeItem("escaner_token");
    setTokenSesion("");
    setPinEntrada("");
    setEstadoCarga("pedir_pin");
  };

  // -------------------------------------------------------------
  // ESCÁNER DE CÓDIGO DE BARRAS / QR (html5-qrcode)
  // -------------------------------------------------------------
  const iniciarEscanerBarras = async () => {
    setModalBarcode(true);
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode("reader-barcode");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.333333,
          },
          async (decodedText) => {
            reproducirBeep(1046, 0.12, "square");
            if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
            cerrarEscanerBarras();
            setEan(decodedText);
            // Comprobar si ya existe en catálogo
            await buscarProductoPorCodigo(decodedText);
          },
          () => {}
        );
      } catch (err: any) {
        console.error("Error abriendo cámara de código de barras:", err);
        alert("No se pudo acceder a la cámara. Compruebe los permisos del navegador.");
        cerrarEscanerBarras();
      }
    }, 150);
  };

  const cerrarEscanerBarras = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setModalBarcode(false);
  };

  // Buscar producto por código escaneado para no duplicar
  const buscarProductoPorCodigo = async (codigo: string) => {
    if (!tokenSesion || !codigo) return;
    try {
      const res = await fetch(`/api/escaner/buscar?q=${encodeURIComponent(codigo)}`, {
        headers: { Authorization: `Bearer ${tokenSesion}` },
      });
      const data = await res.json();
      if (data.encontrado && data.producto) {
        const p = data.producto;
        setNombre(p.nombre || "");
        if (p.ref) setRef(p.ref);
        if (p.precioVenta) setPrecioVenta(String(p.precioVenta));
        if (p.precioCoste) setPrecioCoste(String(p.precioCoste));
        if (p.familiaId) setFamiliaId(p.familiaId);
        if (p.bienestarId) setBienestarId(p.bienestarId);
        if (Array.isArray(p.imagenes) && p.imagenes.length > 0) setImagenes(p.imagenes);
        setMensajeAviso(`⚠️ Artículo existente ("${p.nombre}"). Stock actual en tienda: ${p.stockActual} uds.`);
        setTimeout(() => setMensajeAviso(""), 6000);
      }
    } catch (e) {
      console.warn("Aviso al buscar código:", e);
    }
  };

  // -------------------------------------------------------------
  // OCR BAJO DEMANDA (CÁMARA CON BOTÓN MANUAL PARA ETIQUETAS)
  // -------------------------------------------------------------
  const abrirVisorOcr = async (tipo: "titulo" | "ref") => {
    setModalOcr(tipo);
    setTextoDetectadoOcr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamOcrRef.current = stream;
      if (videoOcrRef.current) {
        videoOcrRef.current.srcObject = stream;
        await videoOcrRef.current.play();
      }
    } catch (err) {
      console.error("Error abriendo cámara OCR:", err);
      alert("No se pudo iniciar la cámara para el OCR. Compruebe los permisos.");
      cerrarVisorOcr();
    }
  };

  const cerrarVisorOcr = () => {
    if (streamOcrRef.current) {
      streamOcrRef.current.getTracks().forEach((track) => track.stop());
      streamOcrRef.current = null;
    }
    setModalOcr(null);
    setTextoDetectadoOcr("");
    setProcesandoOcr(false);
  };

  // Botón manual de disparo: congela el recuadro y lee con Tesseract OCR
  const capturarYProcesarOcr = async () => {
    if (!videoOcrRef.current) return;
    setProcesandoOcr(true);
    reproducirBeep(659, 0.08, "triangle");

    try {
      const video = videoOcrRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo crear contexto de imagen");

      // Dimensiones de captura
      const vWidth = video.videoWidth || 1280;
      const vHeight = video.videoHeight || 720;

      // Recortar la franja central (área de la guía donde el usuario enfoca la etiqueta)
      const cropWidth = Math.round(vWidth * 0.85);
      const cropHeight = Math.round(vHeight * 0.35);
      const cropX = Math.round((vWidth - cropWidth) / 2);
      const cropY = Math.round((vHeight - cropHeight) / 2);

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Dibujar y optimizar contraste para texto impreso
      ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Importar Tesseract dinámicamente en el cliente
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(canvas, "spa+eng", {
        logger: () => {},
      });

      let textoLimpio = (result.data.text || "")
        .replace(/[\r\n]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      // Si es para referencia, filtrar caracteres habituales de códigos
      if (modalOcr === "ref") {
        textoLimpio = textoLimpio.replace(/[^a-zA-Z0-9\-_./]/g, " ").trim().split(" ")[0] || textoLimpio;
      }

      if (textoLimpio) {
        setTextoDetectadoOcr(textoLimpio);
        reproducirBeep(1174, 0.15, "sine");
      } else {
        setTextoDetectadoOcr("No se detectó texto claro. Pruebe a enfocar más cerca o con mejor luz.");
      }
    } catch (err: any) {
      console.error("Error en procesamiento OCR:", err);
      setTextoDetectadoOcr("Error al procesar la imagen. Inténtelo de nuevo.");
    } finally {
      setProcesandoOcr(false);
    }
  };

  const aplicarTextoOcr = () => {
    if (!textoDetectadoOcr) return;
    if (modalOcr === "titulo") {
      setNombre(textoDetectadoOcr);
    } else if (modalOcr === "ref") {
      setRef(textoDetectadoOcr);
    }
    cerrarVisorOcr();
  };

  // -------------------------------------------------------------
  // FOTOS Y OPTIMIZACIÓN WEBP EN CLIENTE
  // -------------------------------------------------------------
  const handleSeleccionarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    try {
      // 1. Optimizar imagen en Canvas a WebP (max 1200px)
      const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (re) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al convertir a WebP"));
              },
              "image/webp",
              0.82
            );
          };
          img.src = re.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Subir a /api/escaner/upload
      const formData = new FormData();
      formData.append("file", optimizedBlob, `producto_${Date.now()}.webp`);

      const res = await fetch("/api/escaner/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenSesion}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImagenes((prev) => [...prev, data.url]);
        reproducirBeep(880, 0.1, "sine");
      } else {
        alert(data.error || "Error al subir la imagen");
      }
    } catch (err: any) {
      console.error("Error optimizando/subiendo imagen:", err);
      alert("No se pudo procesar la foto.");
    } finally {
      setSubiendoFoto(false);
      if (inputFileRef.current) inputFileRef.current.value = "";
    }
  };

  const eliminarFoto = (idx: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
  };

  // -------------------------------------------------------------
  // GENERAR CÓDIGO INTERNO PROPIO
  // -------------------------------------------------------------
  const generarCodigoInterno = () => {
    setEan(siguienteCodigoSugerido);
    // Calcular siguiente código
    const numRandom = Math.floor(10000 + Math.random() * 90000);
    setSiguienteCodigoSugerido(`BN-${numRandom}`);
    reproducirBeep(950, 0.1, "sine");
  };

  // -------------------------------------------------------------
  // GUARDAR PRODUCTO EN NEON POSTGRES
  // -------------------------------------------------------------
  const handleGuardarProducto = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEan = ean.trim();
    const cleanRef = ref.trim();
    let finalNombre = nombre.trim();
    if (!finalNombre) {
      finalNombre = cleanEan
        ? `Artículo ${cleanEan}`
        : (cleanRef ? `Artículo ${cleanRef}` : (siguienteCodigoSugerido ? `Artículo ${siguienteCodigoSugerido}` : `Artículo sin nombre`));
    }

    const pVentaParsedRaw = parseFloat(precioVenta.replace(",", "."));
    const pVentaNum = (!isNaN(pVentaParsedRaw) && pVentaParsedRaw >= 0) ? pVentaParsedRaw : 0;

    const pCosteNum = parseFloat(precioCoste.replace(",", ".")) || 0;
    const famObj = familias.find((f) => f.id === familiaId);

    setGuardandoProducto(true);
    setMensajeExito("");
    setMensajeAviso("");

    try {
      const payload = {
        nombre: finalNombre,
        ean: cleanEan,
        ref: cleanRef,
        categoria: familiaId,
        categoriaLabel: famObj?.nombre || "Sin asignación",
        familiaId,
        familiaNombre: famObj?.nombre || "Sin asignación",
        bienestarId,
        precioVenta: pVentaNum,
        precioCoste: pCosteNum,
        stockActual,
        stockMinimo: 1,
        ubicacion: ubicacion.trim(),
        publicadoWeb,
        imagenes,
        imagenUrl: imagenes[0] || "",
        acumularStock: true,
      };

      const res = await fetch("/api/escaner/producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenSesion}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // Feedback de éxito
        reproducirBeep(1046, 0.1, "sine");
        setTimeout(() => reproducirBeep(1318, 0.15, "triangle"), 120);
        if (navigator.vibrate) navigator.vibrate([100, 50, 150]);

        setArticulosCatalogados((prev) => prev + 1);
        setUltimoArticuloGuardado(nombre.trim());
        setMensajeExito(data.mensaje || "✅ Guardado y sincronizado con Neon Postgres");

        // Resetear formulario para el siguiente artículo
        setNombre("");
        setEan("");
        setRef("");
        setFamiliaId("sin-asignacion");
        setBienestarId("sin-bienestar-asignado");
        setPrecioVenta("");
        setPrecioCoste("");
        setStockActual(1);
        setUbicacion("");
        setImagenes([]);
        setPublicadoWeb(false);

        // Nuevo código sugerido listo
        const numRandom = Math.floor(10000 + Math.random() * 90000);
        setSiguienteCodigoSugerido(`BN-${numRandom}`);

        setTimeout(() => setMensajeExito(""), 5000);
      } else {
        alert(data.error || "Error al guardar el producto.");
      }
    } catch (err: any) {
      console.error("Error guardando producto:", err);
      alert("Error de conexión al guardar el producto.");
    } finally {
      setGuardandoProducto(false);
    }
  };

  // Cálculo visual de margen
  const pVentaParsed = parseFloat(precioVenta.replace(",", ".")) || 0;
  const pCosteParsed = parseFloat(precioCoste.replace(",", ".")) || 0;
  const beneficioEuros = pVentaParsed - pCosteParsed;
  const porcentajeMargen = pVentaParsed > 0 && pCosteParsed > 0
    ? Math.round(((pVentaParsed - pCosteParsed) / pVentaParsed) * 100)
    : 0;

  // =========================================================================
  // VISTA 1: COMPROBANDO ESTADO
  // =========================================================================
  if (estadoCarga === "verificando") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-slate-200">Conectando con el TPV...</h2>
        <p className="text-sm text-slate-400 mt-2">Verificando estado de seguridad y permisos de escáner.</p>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: BLOQUEO ABSOLUTO (ESCANER DESACTIVADO DESDE EL TPV)
  // =========================================================================
  if (estadoCarga === "desactivado") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Escáner Móvil Desactivado</h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Por motivos de seguridad, el acceso a este terminal móvil se encuentra inhabilitado en los ajustes de la tienda física.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 text-left w-full space-y-2">
          <p className="font-semibold text-slate-200">Para habilitarlo:</p>
          <p>1. Abra la aplicación de TPV en el ordenador de la tienda.</p>
          <p>2. Vaya a la pestaña <span className="text-emerald-400 font-mono">Ajustes &gt; Escáner Móvil</span>.</p>
          <p>3. Active el interruptor de encendido.</p>
        </div>
        <button
          onClick={verificarEstado}
          className="mt-6 w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Comprobar estado de nuevo</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // VISTA 3: TECLADO PIN DE 4 DÍGITOS
  // =========================================================================
  if (estadoCarga === "pedir_pin") {
    return (
      <div className="flex-1 flex flex-col items-center justify-between p-6 max-w-sm mx-auto w-full">
        {/* Cabecera */}
        <div className="text-center pt-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Blanco y Negro</h1>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mt-1">Terminal de Catalogación</p>
          <p className="text-sm text-slate-400 mt-3">Introduzca el PIN de 4 dígitos configurado en el TPV</p>
        </div>

        {/* Indicadores de 4 dígitos */}
        <div className={`flex justify-center gap-4 my-8 transition-transform duration-200 ${pinSacudida ? "animate-bounce text-rose-500" : ""}`}>
          {[0, 1, 2, 3].map((idx) => {
            const rellenado = pinEntrada.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  rellenado
                    ? "bg-emerald-400 border-emerald-400 scale-125 shadow-lg shadow-emerald-500/40"
                    : "border-slate-700 bg-slate-900"
                }`}
              />
            );
          })}
        </div>

        {errorPin && (
          <div className="mb-4 text-xs font-medium text-rose-400 text-center bg-rose-500/10 py-2 px-4 rounded-lg border border-rose-500/20">
            {errorPin}
          </div>
        )}

        {/* Teclado numérico táctil */}
        <div className="w-full pb-8">
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitoPin(num)}
                className="h-16 rounded-2xl bg-slate-900/90 active:bg-emerald-600 active:scale-95 text-2xl font-semibold text-slate-100 border border-slate-800/80 shadow transition flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPinEntrada("")}
              className="h-16 rounded-2xl bg-slate-900/40 active:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800/40 transition flex items-center justify-center uppercase tracking-wider"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleDigitoPin("0")}
              className="h-16 rounded-2xl bg-slate-900/90 active:bg-emerald-600 active:scale-95 text-2xl font-semibold text-slate-100 border border-slate-800/80 shadow transition flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBorrarPin}
              className="h-16 rounded-2xl bg-slate-900/40 active:bg-slate-800 text-slate-300 border border-slate-800/40 transition flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 4: TERMINAL DE CATALOGACIÓN RÁPIDA (MULTIMODAL Y LIBRE)
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full pb-24">
      {/* Barra de cabecera fija */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-200">Catalogación Móvil</h1>
            <p className="text-[10px] text-emerald-400 font-mono">Neon Postgres Conectado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-300">
            📦 {articulosCatalogados} creados
          </div>
          <button
            onClick={handleCerrarSesion}
            title="Bloquear sesión"
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Avisos flotantes */}
      {mensajeExito && (
        <div className="m-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeAviso && (
        <div className="m-3 p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl text-xs text-amber-300 flex items-center gap-2 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{mensajeAviso}</span>
        </div>
      )}

      {/* BARRA DE BOTONES DE CAPTURA RÁPIDA (MULTIMODAL SIN ORDEN OBLIGATORIO) */}
      <section className="p-4 bg-slate-900/60 border-b border-slate-800/80">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
          Herramientas de Captura con Cámara:
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Botón 1: Código de Barras / QR */}
          <button
            type="button"
            onClick={iniciarEscanerBarras}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-left transition"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Código Barras</p>
              <p className="text-[10px] text-slate-400">Pistolear EAN / QR</p>
            </div>
          </button>

          {/* Botón 2: OCR Título (Bajo demanda manual) */}
          <button
            type="button"
            onClick={() => abrirVisorOcr("titulo")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-left transition"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Leer Nombre</p>
              <p className="text-[10px] text-slate-400">OCR de etiqueta</p>
            </div>
          </button>

          {/* Botón 3: OCR Referencia */}
          <button
            type="button"
            onClick={() => abrirVisorOcr("ref")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-left transition"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Leer Ref.</p>
              <p className="text-[10px] text-slate-400">OCR número ref.</p>
            </div>
          </button>

          {/* Botón 4: Hacer Foto del Producto */}
          <button
            type="button"
            onClick={() => inputFileRef.current?.click()}
            disabled={subiendoFoto}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-left transition"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              {subiendoFoto ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">{subiendoFoto ? "Subiendo..." : "Hacer Foto"}</p>
              <p className="text-[10px] text-slate-400">Auto-optimiza WebP</p>
            </div>
          </button>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleSeleccionarFoto}
          />
        </div>
      </section>

      {/* FORMULARIO EDITABLE EN VIVO */}
      <form onSubmit={handleGuardarProducto} className="p-4 space-y-4">
        {/* Galería de fotos capturadas */}
        {imagenes.length > 0 && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Fotos del artículo ({imagenes.length}):
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagenes.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0 group">
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => eliminarFoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. Nombre / Título */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-200">
              Nombre / Título del Producto
            </label>
            <button
              type="button"
              onClick={() => abrirVisorOcr("titulo")}
              className="text-[11px] text-sky-400 font-medium hover:underline flex items-center gap-1"
            >
              <Type className="w-3 h-3" /> Leer con OCR
            </button>
          </div>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Incienso Ruda y Romero 15g (opcional)"
            className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none"
          />
        </div>

        {/* 2. Código de Barras (EAN) y Referencia */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Código EAN</label>
              <button
                type="button"
                onClick={iniciarEscanerBarras}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <Barcode className="w-3 h-3" /> Pistola
              </button>
            </div>
            <input
              type="text"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              placeholder="8400000000000"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-slate-200 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Referencia</label>
              <button
                type="button"
                onClick={() => abrirVisorOcr("ref")}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <Tag className="w-3 h-3" /> OCR Ref
              </button>
            </div>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="REF-1049"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* BLOQUE: GENERAR CÓDIGO INTERNO SI NO TIENE DE FÁBRICA */}
        {!ean && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">¿Sin código de barras de fábrica?</span>
              <p className="text-slate-400 text-[10px]">Genera un código interno para etiquetarlo en el TPV.</p>
            </div>
            <button
              type="button"
              onClick={generarCodigoInterno}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white whitespace-nowrap shadow transition"
            >
              + Generar BN
            </button>
          </div>
        )}

        {/* 3. Desplegables de Clasificación (Categoría y Bienestar) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Categoría / Familia */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Categoría / Familia
            </label>
            <select
              value={familiaId}
              onChange={(e) => setFamiliaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              {familias.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Por defecto: Sin asignación</p>
          </div>

          {/* Bienestar y Propósito */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bienestar y Propósito
            </label>
            <select
              value={bienestarId}
              onChange={(e) => setBienestarId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              {bienestares.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Por defecto: Sin bienestar</p>
          </div>
        </div>

        {/* 4. Precios (Coste y Venta con cálculo en tiempo real) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precio Venta (€)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-emerald-400 outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precio Coste (€)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={precioCoste}
                  onChange={(e) => setPrecioCoste(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-slate-300 outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">€</span>
              </div>
            </div>
          </div>

          {/* Margen informativo si hay datos */}
          {pVentaParsed > 0 && pCosteParsed > 0 && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
              <span>Margen comercial estimado:</span>
              <span className="font-semibold text-emerald-400">
                {porcentajeMargen}% (+{beneficioEuros.toFixed(2)} €)
              </span>
            </div>
          )}
        </div>

        {/* 5. Contador de Stock en Tienda Físico */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-200 block">Unidades en Tienda</label>
            <p className="text-[10px] text-slate-400">Stock físico contado en estantería</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStockActual((prev) => Math.max(0, prev - 1))}
              className="w-10 h-10 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 text-lg font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-lg text-emerald-400 font-mono">
              {stockActual}
            </span>
            <button
              type="button"
              onClick={() => setStockActual((prev) => prev + 1)}
              className="w-10 h-10 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 text-lg font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6. Ubicación y Publicación */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ubicación Física</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Balda A-2"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
            />
          </div>

          <div className="pt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="checkWeb"
              checked={publicadoWeb}
              onChange={(e) => setPublicadoWeb(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="checkWeb" className="text-xs text-slate-300 cursor-pointer">
              Publicar en web
            </label>
          </div>
        </div>

        {/* BOTÓN FLOTANTE INFERIOR PRINCIPAL */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-30 max-w-xl mx-auto">
          <button
            type="submit"
            disabled={guardandoProducto}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold text-base shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {guardandoProducto ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Guardando en Neon Postgres...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <span>Guardar y Catalogar Artículo</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* MODAL 1: ESCÁNER DE CÓDIGO DE BARRAS / QR                                 */}
      {/* ========================================================================= */}
      {modalBarcode && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Escáner de Códigos de Barras / QR</h2>
              <p className="text-[11px] text-slate-400">Apunte la cámara trasera al código del producto</p>
            </div>
            <button
              onClick={cerrarEscanerBarras}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4 overflow-hidden rounded-2xl border border-slate-800 relative bg-black">
            <div id="reader-barcode" className="w-full max-w-sm overflow-hidden" />
          </div>

          <div className="text-center py-2">
            <button
              onClick={cerrarEscanerBarras}
              className="py-3 px-6 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Cancelar Escaneo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VISOR OCR MANUAL (DISPARO BAJO DEMANDA PARA ETIQUETAS)           */}
      {/* ========================================================================= */}
      {modalOcr && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in">
          {/* Cabecera */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {modalOcr === "titulo" ? "Leer Nombre de Producto (OCR)" : "Leer Referencia (OCR)"}
              </h2>
              <p className="text-[11px] text-slate-400">
                Enfoque la etiqueta y pulse el botón cuando esté centrada
              </p>
            </div>
            <button onClick={cerrarVisorOcr} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visor de Cámara con Guía Central */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoOcrRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Guía rectangular central (mira) */}
            <div className="absolute inset-x-8 h-28 border-2 border-dashed border-sky-400/80 rounded-2xl bg-sky-500/10 pointer-events-none flex flex-col items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              <span className="text-[11px] font-semibold text-sky-200 bg-slate-950/80 px-3 py-1 rounded-full border border-sky-400/40">
                Enfoque aquí el texto
              </span>
            </div>

            {/* Spinner de lectura */}
            {procesandoOcr && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-10 h-10 text-sky-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">Reconociendo texto con OCR...</p>
                <p className="text-xs text-slate-400">Analizando etiqueta en alta resolución</p>
              </div>
            )}
          </div>

          {/* Cuadro de texto detectado si ya se disparó */}
          {textoDetectadoOcr && !procesandoOcr && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Texto reconocido (puede corregirlo antes de aplicar):
              </label>
              <textarea
                rows={2}
                value={textoDetectadoOcr}
                onChange={(e) => setTextoDetectadoOcr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={capturarYProcesarOcr}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Reintentar
                </button>
                <button
                  type="button"
                  onClick={aplicarTextoOcr}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" /> Aplicar al {modalOcr === "titulo" ? "Título" : "Referencia"}
                </button>
              </div>
            </div>
          )}

          {/* Botón Manual Grande de Disparo (si aún no hay texto o se quiere recapturar) */}
          {(!textoDetectadoOcr || procesandoOcr) && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center">
              <button
                type="button"
                disabled={procesandoOcr}
                onClick={capturarYProcesarOcr}
                className="w-full max-w-sm py-4 px-6 rounded-2xl bg-sky-600 active:bg-sky-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capturar y Leer Texto Ahora</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
