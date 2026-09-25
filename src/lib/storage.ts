import { getCloudflareContext } from "@opennextjs/cloudflare";

export const R2_PUBLIC_BASE_URL = "https://pub-21d94dde4cd542cdab5786278c9acee3.r2.dev";

/**
 * Obtiene el binding del bucket R2 desde el contexto de Cloudflare
 */
export async function getR2Bucket(): Promise<any | null> {
  try {
    const cf = await getCloudflareContext();
    if (cf && cf.env && (cf.env as any).FOTOS_BUCKET) {
      return (cf.env as any).FOTOS_BUCKET;
    }
  } catch {}
  return null;
}

/**
 * Guarda un archivo binario en Cloudflare R2 y devuelve su URL pública permanente
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer | Uint8Array,
  contentType = "image/webp"
): Promise<string | null> {
  try {
    const bucket = await getR2Bucket();
    if (bucket && typeof bucket.put === "function") {
      await bucket.put(key, buffer, {
        httpMetadata: {
          contentType,
        },
      });
      return `${R2_PUBLIC_BASE_URL}/${key}`;
    }
  } catch (err) {
    console.error("[R2 Storage] Error al subir objeto:", err);
  }
  return null;
}

/**
 * Elimina un archivo de Cloudflare R2
 */
export async function deleteFromR2(keyOrUrl: string): Promise<boolean> {
  try {
    const bucket = await getR2Bucket();
    if (!bucket || typeof bucket.delete !== "function") return false;

    let key = keyOrUrl;
    if (key.startsWith("http")) {
      const url = new URL(keyOrUrl);
      key = url.pathname.replace(/^\/+/, "");
    }

    await bucket.delete(key);
    return true;
  } catch (err) {
    console.error("[R2 Storage] Error al eliminar objeto:", err);
    return false;
  }
}
