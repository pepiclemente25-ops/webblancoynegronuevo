/**
 * Utilidades para procesar y optimizar enlaces de imágenes procedentes de Google Drive.
 * 
 * Los usuarios suelen pegar enlaces compartidos de Google Drive como:
 * - https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing
 * - https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
 * - https://drive.google.com/uc?export=view&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
 * 
 * Esta función extrae el ID único del archivo y devuelve una URL directa compatible
 * con el CDN de Google (lh3.googleusercontent.com/d/ID) que Next.js puede optimizar a WebP/AVIF.
 */

export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Si ya es un ID de 25-45 caracteres alfanuméricos directos
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(url.trim())) {
    return url.trim();
  }

  // Patrón 1: /file/d/ID/...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Patrón 2: id=ID o id=ID&...
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Patrón 3: /d/ID
  const shortDMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (shortDMatch && shortDMatch[1]) {
    return shortDMatch[1];
  }

  return null;
}

export function formatImageUrl(url: string, fallbackUrl: string): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return fallbackUrl;
  }

  const trimmed = url.trim();

  // Si contiene google drive
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      // lh3.googleusercontent.com/d/FILE_ID es el endpoint público de alta velocidad de Google
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Si es un data URL de imagen en base64 válido
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  // Si es una ruta local del TPV (/imagenes/art_...) o localhost que no existe en el servidor web público
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1") || trimmed.startsWith("/imagenes/")) {
    // Si estamos en el navegador en un dominio público de producción, no intentamos resolver localhost
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return fallbackUrl;
    }
    // En SSR en Vercel tampoco existe localhost:3742
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return fallbackUrl;
    }
    return trimmed;
  }

  // Si ya es una URL HTTP(S) directa (Unsplash, Vercel Blob, CDN externo, etc.)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }

  return fallbackUrl;
}
