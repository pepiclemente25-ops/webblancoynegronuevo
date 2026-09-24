import { NextRequest, NextResponse } from "next/server";
import { isEscanerActivo, getEscanerPin, generarTokenSesion, verificarTokenSesion } from "@/lib/escanerAuth";

export async function GET(req: NextRequest) {
  try {
    const activo = await isEscanerActivo();
    const token = req.headers.get("authorization")?.replace("Bearer ", "") || null;
    const sessionValida = token ? await verificarTokenSesion(token) : false;

    return NextResponse.json({
      activo,
      autenticado: sessionValida,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error consultando estado" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const activo = await isEscanerActivo();
    if (!activo) {
      return NextResponse.json(
        {
          success: false,
          error: "El escáner móvil está desactivado por motivos de seguridad en los ajustes del TPV.",
          desactivado: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const pinIntroducido = String(body.pin || "").trim();

    if (!pinIntroducido) {
      return NextResponse.json(
        { success: false, error: "Debe introducir el PIN de 4 dígitos." },
        { status: 400 }
      );
    }

    const pinConfigurado = await getEscanerPin();

    if (pinIntroducido !== pinConfigurado) {
      return NextResponse.json(
        { success: false, error: "PIN incorrecto. Compruébelo en los ajustes del TPV." },
        { status: 401 }
      );
    }

    const token = generarTokenSesion(pinConfigurado);

    return NextResponse.json({
      success: true,
      token,
      message: "Acceso concedido al escáner móvil.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Error al autenticar" },
      { status: 500 }
    );
  }
}
