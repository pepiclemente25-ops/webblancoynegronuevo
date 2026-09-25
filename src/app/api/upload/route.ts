import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

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

    let buffer: Buffer;
    let filename: string;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No se encontró ningún archivo en el formulario." }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name || `foto_${Date.now()}.webp`;
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.base64) {
        return NextResponse.json({ error: "Campo base64 requerido." }, { status: 400 });
      }
      const match = body.base64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      const dataStr = match ? match[2] : body.base64;
      buffer = Buffer.from(dataStr, "base64");
      filename = body.filename || `foto_${Date.now()}.webp`;
    } else {
      // Flujo binario directo (fetch(..., { body: blob }))
      const arrayBuffer = await req.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return NextResponse.json({ error: "Cuerpo de archivo vacío." }, { status: 400 });
      }
      buffer = Buffer.from(arrayBuffer);
      const urlFilename = req.nextUrl.searchParams.get("filename");
      const headerFilename = req.headers.get("x-filename");
      filename = urlFilename || headerFilename || `foto_${Date.now()}.webp`;
    }

    // Asegurar extensión .webp
    if (!filename.toLowerCase().endsWith(".webp")) {
      filename = `${filename.replace(/\.[^/.]+$/, "")}.webp`;
    }

    // 1. Si estamos en Cloudflare con bucket R2 configurado
    try {
      const { uploadToR2 } = await import("@/lib/storage");
      const r2Url = await uploadToR2(`productos/${filename}`, buffer, "image/webp");
      if (r2Url) {
        return NextResponse.json({
          success: true,
          url: r2Url,
          filename,
          provider: "cloudflare-r2",
        });
      }
    } catch (r2Err) {
      console.warn("[Upload] Aviso intentando subir a Cloudflare R2:", r2Err);
    }

    // 2. Si Vercel Blob está configurado (Respaldo en Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`productos/${filename}`, buffer, {
        access: "public",
        contentType: "image/webp",
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename,
        provider: "vercel-blob",
      });
    }

    // 3. Respaldo para local o sin token de Blob configurado
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      provider: "local-static",
    });
  } catch (err: any) {
    console.error("Error al subir imagen:", err);
    return NextResponse.json({ error: err.message || "Error al procesar la subida" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const urls: string[] = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);

    if (urls.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No se enviaron URLs para eliminar." });
    }

    // 1. Eliminar URLs de Cloudflare R2
    let deletedR2Count = 0;
    try {
      const { deleteFromR2 } = await import("@/lib/storage");
      const r2Urls = urls.filter((u) => typeof u === "string" && u.includes("r2.dev"));
      for (const u of r2Urls) {
        const ok = await deleteFromR2(u);
        if (ok) deletedR2Count++;
      }
    } catch (r2Err) {
      console.warn("[Upload DELETE] Error eliminando de R2:", r2Err);
    }

    // 2. Filtrar URLs de Vercel Blob
    const vercelBlobUrls = urls.filter(
      (u) => typeof u === "string" && u.includes("public.blob.vercel-storage.com")
    );

    if (vercelBlobUrls.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(vercelBlobUrls);
    }

    // 3. Eliminar también archivos locales en public/uploads si corresponde
    for (const u of urls) {
      if (typeof u === "string" && u.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", u);
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch {}
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedR2Count + (process.env.BLOB_READ_WRITE_TOKEN ? vercelBlobUrls.length : 0),
      urls,
    });
  } catch (err: any) {
    console.error("Error al eliminar imágenes:", err);
    return NextResponse.json({ error: err.message || "Error al eliminar imágenes" }, { status: 500 });
  }
}

