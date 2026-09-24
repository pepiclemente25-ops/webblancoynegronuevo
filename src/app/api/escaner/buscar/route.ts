import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/lib/escanerAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "") || null;
    const authValida = await verificarTokenSesion(token);

    if (!authValida) {
      return NextResponse.json(
        { error: "No autorizado o sesión expirada." },
        { status: 401 }
      );
    }

    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ encontrado: false, message: "Parámetro de búsqueda vacío." });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ encontrado: false, message: "Base de datos no disponible." });
    }

    const rows = await sql.query(
      `SELECT * FROM productos 
       WHERE ean = $1 OR ref = $1 OR id = $1 
       LIMIT 1`,
      [q]
    );

    if (rows && rows.length > 0) {
      const prod = rows[0];
      return NextResponse.json({
        encontrado: true,
        producto: {
          id: prod.id,
          nombre: prod.nombre,
          ean: prod.ean || "",
          ref: prod.ref || "",
          categoria: prod.categoria || "sin-asignacion",
          categoriaLabel: prod.categoria_label || "Sin asignación",
          familiaId: prod.familia_id || "sin-asignacion",
          familiaNombre: prod.familia_nombre || "Sin asignación",
          bienestarId: prod.bienestar_id || "sin-bienestar-asignado",
          precioVenta: Number(prod.precio_venta) || 0,
          precioCoste: Number(prod.precio_coste) || 0,
          stockActual: Number(prod.stock_actual) || 0,
          stockMinimo: Number(prod.stock_minimo) || 1,
          imagenUrl: prod.imagen_url || "",
          imagenes: Array.isArray(prod.imagenes) ? prod.imagenes : [],
          publicadoWeb: Boolean(prod.publicado_web),
        },
      });
    }

    return NextResponse.json({ encontrado: false });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error al buscar producto" },
      { status: 500 }
    );
  }
}
