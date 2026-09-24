import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/lib/escanerAuth";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "") || null;
    const authValida = await verificarTokenSesion(authHeader);

    if (!authValida) {
      return NextResponse.json(
        { error: "No autorizado. Token de sesión inválido o escáner inactivo." },
        { status: 401 }
      );
    }

    let buffer: Buffer;
    let filename = `foto_${Date.now()}.webp`;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No se encontró ningún archivo en el formulario." }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name || filename;
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.base64) {
        return NextResponse.json({ error: "Campo base64 requerido." }, { status: 400 });
      }
      const match = body.base64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      const dataStr = match ? match[2] : body.base64;
      buffer = Buffer.from(dataStr, "base64");
      filename = body.filename || filename;
    } else {
      const arrayBuffer = await req.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return NextResponse.json({ error: "Cuerpo de archivo vacío." }, { status: 400 });
      }
      buffer = Buffer.from(arrayBuffer);
      const urlFilename = req.nextUrl.searchParams.get("filename");
      filename = urlFilename || filename;
    }

    if (!filename.toLowerCase().endsWith(".webp")) {
      filename = `${filename.replace(/\.[^/.]+$/, "")}.webp`;
    }

    // 1. Si Vercel Blob está configurado en producción
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`productos/${filename}`, buffer, {
        access: "public",
        contentType: "image/webp",
      });
      return NextResponse.json({
        success: true,
        url: blob.url,
        provider: "vercel_blob",
      });
    }

    // 2. Si no hay token de Blob, guardar en public/uploads si estamos en entorno local
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        provider: "local",
      });
    } catch {
      // 3. Fallback en memoria como Base64 Data URL
      const dataUrl = `data:image/webp;base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        provider: "data_url",
      });
    }
  } catch (err: any) {
    console.error("Error al subir foto desde escáner móvil:", err);
    return NextResponse.json(
      { error: err.message || "Error al procesar la imagen." },
      { status: 500 }
    );
  }
}
