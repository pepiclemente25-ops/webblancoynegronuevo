import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-sync-secret") || req.headers.get("authorization");
    const expectedSecret = process.env.REVALIDATE_SECRET || "aura-pepi-secret-key";

    if (authHeader && authHeader.replace("Bearer ", "") !== expectedSecret) {
      return NextResponse.json(
        { error: "No autorizado. Token de sincronización inválido." },
        { status: 401 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: true,
        message: "Vercel Blob no configurado en este entorno.",
        deletedCount: 0,
        freedBytes: 0,
        remainingCount: 0,
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawActiveUrls: string[] = Array.isArray(body.activeUrls) ? body.activeUrls : [];
    const activeUrlsSet = new Set(
      rawActiveUrls
        .filter((u) => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim())
    );

    let hasMore = true;
    let cursor: string | undefined = undefined;
    const urlsToDelete: string[] = [];
    let freedBytes = 0;
    let remainingCount = 0;

    // Listar todos los blobs bajo 'productos/'
    while (hasMore) {
      const response: { blobs: any[]; hasMore: boolean; cursor?: string } = await list({
        prefix: "productos/",
        cursor,
        limit: 1000,
      });

      for (const blob of response.blobs) {
        if (!activeUrlsSet.has(blob.url)) {
          urlsToDelete.push(blob.url);
          freedBytes += blob.size || 0;
        } else {
          remainingCount++;
        }
      }

      hasMore = response.hasMore;
      cursor = response.cursor;
    }

    // Eliminar los blobs huérfanos
    if (urlsToDelete.length > 0) {
      await del(urlsToDelete);
    }

    return NextResponse.json({
      success: true,
      deletedCount: urlsToDelete.length,
      freedBytes,
      remainingCount,
      message: `Limpieza completada: ${urlsToDelete.length} fotos huérfanas eliminadas de Vercel Blob.`,
    });
  } catch (err: any) {
    console.error("Error en blob-cleanup:", err);
    return NextResponse.json(
      { error: err.message || "Error al realizar la limpieza de Vercel Blob" },
      { status: 500 }
    );
  }
}
