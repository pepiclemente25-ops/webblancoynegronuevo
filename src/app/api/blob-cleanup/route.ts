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

    const body = await req.json().catch(() => ({}));
    const rawActiveUrls: string[] = Array.isArray(body.activeUrls) ? body.activeUrls : [];
    const activeUrlsSet = new Set(
      rawActiveUrls
        .filter((u) => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim())
    );

    let deletedCount = 0;
    let freedBytes = 0;
    let remainingCount = 0;

    // 1. Limpieza en Cloudflare R2 Bucket
    try {
      const { getR2Bucket } = await import("@/lib/storage");
      const bucket = await getR2Bucket();
      if (bucket && typeof bucket.list === "function" && typeof bucket.delete === "function") {
        let truncated = true;
        let cursor: string | undefined = undefined;

        while (truncated) {
          const listRes: any = await bucket.list({ prefix: "productos/", cursor, limit: 1000 });
          const objects = listRes?.objects || [];
          for (const obj of objects) {
            const key: string = obj.key;
            // Comprobar si alguna URL activa contiene o termina con esta clave
            const isMatch = Array.from(activeUrlsSet).some(
              (u) => u.includes(key) || u.endsWith(key.replace(/^productos\//, ""))
            );
            if (!isMatch) {
              await bucket.delete(key);
              deletedCount++;
              freedBytes += obj.size || 0;
            } else {
              remainingCount++;
            }
          }
          truncated = Boolean(listRes?.truncated);
          cursor = listRes?.cursor;
        }

        return NextResponse.json({
          success: true,
          provider: "cloudflare-r2",
          deletedCount,
          freedBytes,
          remainingCount,
          message: `Limpieza completada: ${deletedCount} fotos huérfanas eliminadas de Cloudflare R2.`,
        });
      }
    } catch (r2Err) {
      console.warn("[blob-cleanup] Error en limpieza R2:", r2Err);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: true,
        message: "Almacenamiento no configurado o no disponible en este entorno.",
        deletedCount: 0,
        freedBytes: 0,
        remainingCount: 0,
      });
    }

    let hasMore = true;
    let cursor: string | undefined = undefined;
    const urlsToDelete: string[] = [];

    // Listar todos los blobs bajo 'productos/' en Vercel
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
      deletedCount += urlsToDelete.length;
    }

    return NextResponse.json({
      success: true,
      provider: "vercel-blob",
      deletedCount,
      freedBytes,
      remainingCount,
      message: `Limpieza completada: ${deletedCount} fotos huérfanas eliminadas de Vercel Blob.`,
    });
  } catch (err: any) {
    console.error("Error en blob-cleanup:", err);
    return NextResponse.json(
      { error: err.message || "Error al realizar la limpieza de Vercel Blob" },
      { status: 500 }
    );
  }
}
