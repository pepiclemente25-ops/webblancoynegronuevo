import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/lib/escanerAuth";
import { getDb } from "@/lib/db";
import { defaultFamilias, defaultBienestares } from "@/lib/content";

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

    const sql = getDb();
    let familiasList = [
      { id: "sin-asignacion", nombre: "Sin asignación", orden: 0, activa: true },
      ...defaultFamilias,
    ];

    let bienestaresList = [
      {
        id: "sin-bienestar-asignado",
        nombre: "Sin bienestar asignado",
        subtitulo: "Pendiente de clasificar",
        descripcion: "",
        colorBadge: "slate",
        orden: 0,
        activo: true,
      },
      ...defaultBienestares,
    ];

    let siguienteCodigoInterno = "BN-10001";

    if (sql) {
      try {
        // Consultar configuraciones personalizadas si existen
        const cfgRows = await sql.query(
          "SELECT clave, valor FROM configuracion_web WHERE clave IN ('familias_personalizadas', 'bienestares_personalizados')"
        );

        cfgRows.forEach((r: any) => {
          if (r.clave === "familias_personalizadas" && r.valor) {
            try {
              const parsed = JSON.parse(r.valor);
              if (Array.isArray(parsed) && parsed.length > 0) {
                familiasList = [
                  { id: "sin-asignacion", nombre: "Sin asignación", orden: 0, activa: true },
                  ...parsed.filter((f: any) => f.id !== "sin-asignacion"),
                ];
              }
            } catch {}
          }
          if (r.clave === "bienestares_personalizados" && r.valor) {
            try {
              const parsed = JSON.parse(r.valor);
              if (Array.isArray(parsed) && parsed.length > 0) {
                bienestaresList = [
                  {
                    id: "sin-bienestar-asignado",
                    nombre: "Sin bienestar asignado",
                    subtitulo: "Pendiente de clasificar",
                    descripcion: "",
                    colorBadge: "slate",
                    orden: 0,
                    activo: true,
                  },
                  ...parsed.filter((b: any) => b.id !== "sin-bienestar-asignado"),
                ];
              }
            } catch {}
          }
        });

        // Generar un código interno único que no colisione con los de Neon
        let intento = 0;
        let codigoGenerado = "";
        let existe = true;
        while (existe && intento < 10) {
          intento++;
          const numRandom = Math.floor(10000 + Math.random() * 90000);
          codigoGenerado = `BN-${numRandom}`;
          const checkRows = await sql.query(
            "SELECT id FROM productos WHERE ean = $1 OR ref = $1 LIMIT 1",
            [codigoGenerado]
          );
          if (!checkRows || checkRows.length === 0) {
            existe = false;
          }
        }
        if (codigoGenerado) {
          siguienteCodigoInterno = codigoGenerado;
        }
      } catch (dbErr) {
        console.warn("Aviso al consultar configuración en Neon:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      familias: familiasList,
      bienestares: bienestaresList,
      siguienteCodigoInterno,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Error al obtener configuración" },
      { status: 500 }
    );
  }
}
