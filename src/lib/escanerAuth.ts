import crypto from "crypto";
import { getDb } from "@/lib/db";

const DEFAULT_SECRET = process.env.REVALIDATE_SECRET || "aura-pepi-escaner-secret-key";

export interface EstadoEscanerResponse {
  activo: boolean;
  motivo?: "ok" | "desactivado" | "tpv_offline";
  mensaje?: string;
}

/**
 * Consulta en Neon si el escáner móvil está activo y si el TPV del mostrador está encendido (Heartbeat)
 */
export async function getEscanerEstado(): Promise<EstadoEscanerResponse> {
  const sql = getDb();
  if (!sql) return { activo: true, motivo: "ok" };
  try {
    const rows = await sql.query(
      "SELECT clave, valor FROM configuracion_web WHERE clave IN ('escaner_activo', 'escaner_tpv_heartbeat')"
    );

    const map = new Map<string, string>();
    (rows || []).forEach((r: any) => map.set(r.clave, String(r.valor || "").trim()));

    // 1. Verificación de interruptor maestro (Ajustes TPV)
    const valActivo = map.get("escaner_activo");
    if (valActivo) {
      const lower = valActivo.toLowerCase();
      if (lower === "false" || lower === "0" || lower === "no") {
        return {
          activo: false,
          motivo: "desactivado",
          mensaje: "El escáner móvil está desactivado en los Ajustes del TPV.",
        };
      }
    }

    // 2. Verificación de presencia por Heartbeat del TPV
    const valHeartbeat = map.get("escaner_tpv_heartbeat");
    if (valHeartbeat !== undefined && valHeartbeat !== null) {
      if (valHeartbeat === "0" || valHeartbeat.toLowerCase() === "inactivo" || !valHeartbeat) {
        return {
          activo: false,
          motivo: "tpv_offline",
          mensaje: "El programa TPV del mostrador está cerrado o apagado.",
        };
      }

      const tiempoHeartbeat = new Date(valHeartbeat).getTime();
      const ahora = Date.now();
      // Si el último latido tiene más de 75 segundos, el TPV se cerró o se apagó
      if (isNaN(tiempoHeartbeat) || ahora - tiempoHeartbeat > 75 * 1000) {
        return {
          activo: false,
          motivo: "tpv_offline",
          mensaje: "El programa TPV del mostrador no responde o está apagado.",
        };
      }
    }

    return { activo: true, motivo: "ok" };
  } catch (err) {
    console.error("Error consultando estado del escáner en Neon:", err);
    return { activo: true, motivo: "ok" };
  }
}

/**
 * Helper booleano de compatibilidad
 */
export async function isEscanerActivo(): Promise<boolean> {
  const estado = await getEscanerEstado();
  return estado.activo;
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
