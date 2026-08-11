import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: any = {};

    if (body.estado) {
      data.estado = body.estado;
      if (body.estado === "tomado") {
        data.tomadoAt = new Date();
        data.voluntarioNombre = body.voluntarioNombre;
        data.voluntarioTelefono = body.voluntarioTelefono;
      }
      if (body.estado === "completado") {
        data.completadoAt = new Date();
      }
    }

    if (body.voluntarioNombre) data.voluntarioNombre = body.voluntarioNombre;
    if (body.voluntarioTelefono) data.voluntarioTelefono = body.voluntarioTelefono;

    const pedido = await prisma.pedido.update({
      where: { id },
      data,
    });

    return NextResponse.json(pedido);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 });
  }
}
