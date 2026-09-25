import { verificarTokenSesion, getEscanerEstado } from "@/lib/escanerAuth";
import { getDb } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const estado = await getEscanerEstado();
    if (!estado.activo) {
      return NextResponse.json(
        {
          success: false,
          error: estado.mensaje || "El TPV del mostrador está apagado. No se pueden guardar productos.",
          desactivado: true,
          motivo: estado.motivo,
        },
        { status: 403 }
      );
    }

    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "") || null;
    const authValida = await verificarTokenSesion(authHeader);

    if (!authValida) {
      return NextResponse.json(
        { success: false, error: "No autorizado o sesión expirada. Vuelva a ingresar el PIN." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      nombre,
      ean = "",
      ref = "",
      categoria = "sin-asignacion",
      categoriaLabel = "Sin asignación",
      familiaId = "sin-asignacion",
      familiaNombre = "Sin asignación",
      bienestarId = "sin-bienestar-asignado",
      precioVenta = 0,
      precioCoste = 0,
      iva = 21,
      stockActual = 1,
      stockMinimo = 1,
      imagenes = [],
      imagenUrl = "",
      descripcionCorta = "",
      publicadoWeb = false,
      ubicacion = "",
      proveedor = "",
    } = body;

    const cleanEan = String(ean || "").trim();
    const cleanRef = String(ref || "").trim();

    let nombreLimpio = String(nombre || "").trim();
    if (!nombreLimpio) {
      nombreLimpio = cleanEan 
        ? `Artículo ${cleanEan}` 
        : (cleanRef ? `Artículo ${cleanRef}` : `Artículo sin nombre`);
    }

    const pVentaRaw = Number(precioVenta);
    const pVenta = (!isNaN(pVentaRaw) && pVentaRaw >= 0) ? pVentaRaw : 0;

    const sql = getDb();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Base de datos Neon no disponible." },
        { status: 503 }
      );
    }

    // Comprobar si ya existe un producto con este EAN o Referencia
    let existingId: string | null = null;
    let stockPrevio = 0;

    if (cleanEan || cleanRef) {
      const checkRows = await sql.query(
        `SELECT id, stock_actual, nombre FROM productos 
         WHERE (ean != '' AND ean = $1) OR (ref != '' AND ref = $2) 
         LIMIT 1`,
        [cleanEan || "___NO_EAN___", cleanRef || "___NO_REF___"]
      );

      if (checkRows && checkRows.length > 0) {
        existingId = checkRows[0].id;
        stockPrevio = Number(checkRows[0].stock_actual) || 0;
      }
    }

    const prodId = existingId || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalStock = existingId && body.acumularStock ? stockPrevio + Number(stockActual) : Number(stockActual);

    const imagenesArray = Array.isArray(imagenes) && imagenes.length > 0
      ? imagenes
      : (imagenUrl ? [imagenUrl] : []);
    const mainImg = imagenUrl || imagenesArray[0] || "";

    const bienestarIds = bienestarId ? [bienestarId] : ["sin-bienestar-asignado"];

    // Ejecutar INSERT o UPDATE en la tabla productos de Neon
    await sql.query(
      `INSERT INTO productos (
        id, ref, ean, nombre, categoria, categoria_label,
        precio_venta, precio_coste, iva,
        stock_actual, stock_minimo, accion_agotado, publicado_web,
        es_servicio, descripcion_corta, descripcion_completa,
        beneficios, imagen_url, imagenes,
        familia_id, familia_nombre, bienestar_id, bienestar_ids,
        ubicacion, proveedor, coste_incluye_iva, archivado,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, 'mostrar_agotado', $12,
        false, $13, $14,
        '[]'::jsonb, $15, $16::jsonb,
        $17, $18, $19, $20::jsonb,
        $21, $22, false, false,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        ref = EXCLUDED.ref,
        ean = EXCLUDED.ean,
        nombre = EXCLUDED.nombre,
        categoria = EXCLUDED.categoria,
        categoria_label = EXCLUDED.categoria_label,
        precio_venta = EXCLUDED.precio_venta,
        precio_coste = EXCLUDED.precio_coste,
        iva = EXCLUDED.iva,
        stock_actual = EXCLUDED.stock_actual,
        stock_minimo = EXCLUDED.stock_minimo,
        publicado_web = EXCLUDED.publicado_web,
        descripcion_corta = EXCLUDED.descripcion_corta,
        descripcion_completa = EXCLUDED.descripcion_completa,
        imagen_url = CASE WHEN EXCLUDED.imagen_url != '' THEN EXCLUDED.imagen_url ELSE productos.imagen_url END,
        imagenes = CASE WHEN EXCLUDED.imagenes != '[]'::jsonb THEN EXCLUDED.imagenes ELSE productos.imagenes END,
        familia_id = EXCLUDED.familia_id,
        familia_nombre = EXCLUDED.familia_nombre,
        bienestar_id = EXCLUDED.bienestar_id,
        bienestar_ids = EXCLUDED.bienestar_ids,
        ubicacion = EXCLUDED.ubicacion,
        proveedor = EXCLUDED.proveedor,
        updated_at = NOW()`,
      [
        prodId,
        cleanRef || null,
        cleanEan || null,
        nombreLimpio,
        categoria || "sin-asignacion",
        categoriaLabel || "Sin asignación",
        pVenta,
        Number(precioCoste) || 0,
        Number(iva) || 21,
        finalStock,
        Number(stockMinimo) || 1,
        Boolean(publicadoWeb),
        descripcionCorta || "",
        body.descripcionCompleta || descripcionCorta || "",
        mainImg,
        JSON.stringify(imagenesArray),
        familiaId || "sin-asignacion",
        familiaNombre || "Sin asignación",
        bienestarId || "sin-bienestar-asignado",
        JSON.stringify(bienestarIds),
        ubicacion || "",
        proveedor || "",
      ]
    );

    // Revalidación de la web
    try {
      revalidatePath("/tienda");
      revalidateTag("web-catalog-data", "default");
    } catch {}

    return NextResponse.json({
      success: true,
      mensaje: existingId
        ? `Artículo actualizado con éxito. Stock total: ${finalStock} uds.`
        : `Artículo "${nombreLimpio}" registrado con éxito en Neon Postgres.`,
      esActualizacion: Boolean(existingId),
      producto: {
        id: prodId,
        nombre: nombreLimpio,
        ean: cleanEan,
        ref: cleanRef,
        precioVenta: pVenta,
        stockActual: finalStock,
      },
    });
  } catch (err: any) {
    console.error("Error al guardar producto desde escáner móvil:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al registrar el producto." },
      { status: 500 }
    );
  }
}
