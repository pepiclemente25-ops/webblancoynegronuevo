import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-sync-secret") || req.headers.get("authorization");
    const secretQuery = req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.REVALIDATE_SECRET || "aura-pepi-secret-key";

    const providedSecret = (authHeader ? authHeader.replace("Bearer ", "") : secretQuery)?.trim();

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "No autorizado. Token de sincronización inválido." },
        { status: 401 }
      );
    }

    const payload = await req.json();
    if (!payload || (!payload.productos && !payload.products)) {
      return NextResponse.json(
        { error: "Payload inválido. Se requiere el array de productos." },
        { status: 400 }
      );
    }

    let blobUrl = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put("data/catalog.json", JSON.stringify(payload), {
          access: "public",
          contentType: "application/json",
          addRandomSuffix: false,
        });
        blobUrl = blob.url;
      } catch (blobErr: any) {
        console.warn("Aviso al guardar catálogo en Vercel Blob:", blobErr);
      }
    }

    // Revalidación inmediata de rutas en Next.js
    try {
      revalidatePath("/");
      revalidatePath("/tienda");
      revalidateTag("web-catalog-data", "default");
    } catch (revErr) {
      console.warn("Aviso en revalidación Next.js:", revErr);
    }

    const prodsCount = (payload.productos || payload.products || []).length;

    return NextResponse.json({
      success: true,
      message: `Catálogo de ${prodsCount} productos sincronizado con éxito.`,
      productsCount: prodsCount,
      blobUrl,
    });
  } catch (err: any) {
    console.error("Error en /api/sync-catalog:", err);
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
