import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cali2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, action, id } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    if (action === "list") {
      const pedidos = await prisma.pedido.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(pedidos);
    }

    if (action === "delete" && id) {
      await prisma.pedido.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === "updateStatus" && id && body.estado) {
      const pedido = await prisma.pedido.update({
        where: { id },
        data: { estado: body.estado },
      });
      return NextResponse.json(pedido);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
