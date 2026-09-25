import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({
      success: false,
      message: "No hay DATABASE_URL configurada en el entorno.",
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    });
  }

  try {
    const rows = await sql.query("SELECT id, nombre, publicado_web, stock_actual, categoria, es_servicio FROM productos");
    return NextResponse.json({
      success: true,
      total: rows.length,
      productos: rows,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
