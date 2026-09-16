import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      total,
      deliveryType,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      clientCity,
      clientPostalCode,
      paymentMethod,
      notes,
    } = body;

    // Validación básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "La cesta está vacía" },
        { status: 400 }
      );
    }

    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { success: false, message: "Faltan datos de contacto obligatorios" },
        { status: 400 }
      );
    }

    // Generar identificador de pedido único profesional
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `BYN-${randomSuffix}`;
    const orderDate = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Guardar pedido en Neon Postgres si está configurado
    const sql = getDb();
    if (sql) {
      try {
        await sql.query(
          `INSERT INTO pedidos_web (
            id, numero_pedido, cliente_nombre, cliente_email, cliente_telefono,
            entrega_tipo, direccion, ciudad, codigo_postal, metodo_pago,
            total, items, estado, notas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            `ped-${Date.now()}-${randomSuffix}`,
            orderId,
            clientName,
            clientEmail,
            clientPhone,
            deliveryType || 'recogida_tienda',
            clientAddress || '',
            clientCity || '',
            clientPostalCode || '',
            paymentMethod || 'bizum',
            Number(total) || 0,
            JSON.stringify(items),
            'pendiente',
            notes || ''
          ]
        );
        console.log(`[Neon] Pedido ${orderId} registrado exitosamente en la base de datos.`);
      } catch (dbErr) {
        console.warn("[Neon] Aviso al registrar pedido en base de datos:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderDate,
      message: "Pedido registrado con éxito",
    });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      { success: false, message: "Error interno al procesar el pedido" },
      { status: 500 }
    );
  }
}
