import crypto from "crypto";
import { getDb } from "@/lib/db";

const DEFAULT_SECRET = process.env.REVALIDATE_SECRET || "aura-pepi-escaner-secret-key";

/**
 * Consulta en Neon si el escáner móvil está activo
 */
export async function isEscanerActivo(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return true; // Si no hay BD conectada, permitir por defecto
  try {
    const rows = await sql.query(
      "SELECT valor FROM configuracion_web WHERE clave = $1",
      ["escaner_activo"]
    );
    if (!rows || rows.length === 0) {
      return true; // Por defecto activo hasta que el TPV lo configure
    }
    const val = String(rows[0].valor || "").toLowerCase().trim();
    return val === "true" || val === "1" || val === "si";
  } catch (err) {
    console.error("Error consultando estado del escáner en Neon:", err);
    return true;
  }
}

/**
 * Obtiene el PIN configurado en Neon (o '1234' por defecto)
 */
export async function getEscanerPin(): Promise<string> {
  const sql = getDb();
  if (!sql) return "1234";
  try {
    const rows = await sql.query(
      "SELECT valor FROM configuracion_web WHERE clave = $1",
      ["escaner_pin"]
    );
    if (!rows || rows.length === 0) {
      return "1234";
    }
    const val = String(rows[0].valor || "").trim();
    return val || "1234";
  } catch (err) {
    console.error("Error consultando PIN del escáner en Neon:", err);
    return "1234";
  }
}

/**
 * Genera un token de sesión seguro firmado con duración de 24 horas
 */
export function generarTokenSesion(pin: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `${expiresAt}:${pin}`;
  const hmac = crypto.createHmac("sha256", DEFAULT_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

/**
 * Verifica la validez del token de sesión
 */
export async function verificarTokenSesion(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, providedHmac] = parts;
    const payload = Buffer.from(payloadB64, "base64").toString("utf-8");
    const [expiresAtStr, tokenPin] = payload.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Token expirado
    }

    const expectedHmac = crypto.createHmac("sha256", DEFAULT_SECRET).update(payload).digest("hex");
    if (expectedHmac !== providedHmac) {
      return false; // Firma inválida
    }

    // Verificar que el escáner sigue activo en Neon
    const activo = await isEscanerActivo();
    if (!activo) return false;

    // Verificar que el PIN del token sigue coincidiendo con el actual
    const currentPin = await getEscanerPin();
    return tokenPin === currentPin;
  } catch (err) {
    console.error("Error verificando token de sesión del escáner:", err);
    return false;
  }
}
