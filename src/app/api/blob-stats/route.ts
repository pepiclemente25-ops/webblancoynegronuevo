import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + (sizes[i] || "B");
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        connected: false,
        message: "No se encontró BLOB_READ_WRITE_TOKEN en las variables de entorno de Vercel.",
        totalBlobs: 0,
        totalSizeBytes: 0,
        totalFormatted: "0 MB",
        limitBytes: 1073741824, // 1 GB cuota gratuita
        limitFormatted: "1 GB",
        porcentajeUsado: "0%",
      });
    }

    let hasMore = true;
    let cursor: string | undefined = undefined;
    let totalBlobs = 0;
    let totalSizeBytes = 0;

    // Iterar para contabilizar todos los blobs almacenados
    while (hasMore) {
      const response: { blobs: any[]; hasMore: boolean; cursor?: string } = await list({ cursor, limit: 1000 });
      for (const blob of response.blobs) {
        totalBlobs++;
        totalSizeBytes += blob.size;
      }
      hasMore = response.hasMore;
      cursor = response.cursor;
    }

    const limitBytes = 1073741824; // 1 GB (1024 MB) estándar gratuito en Vercel
    const porcentajeNum = Math.min(100, (totalSizeBytes / limitBytes) * 100);
    const porcentajeUsado = porcentajeNum.toFixed(2) + "%";

    return NextResponse.json({
      connected: true,
      totalBlobs,
      totalSizeBytes,
      totalFormatted: formatBytes(totalSizeBytes),
      limitBytes,
      limitFormatted: "1 GB",
      porcentajeUsado,
      disponibleBytes: Math.max(0, limitBytes - totalSizeBytes),
      disponibleFormatted: formatBytes(Math.max(0, limitBytes - totalSizeBytes)),
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message || "Error al consultar Vercel Blob",
      totalBlobs: 0,
      totalSizeBytes: 0,
      totalFormatted: "0 MB",
      limitBytes: 1073741824,
      limitFormatted: "1 GB",
      porcentajeUsado: "0%",
    }, { status: 500 });
  }
}
