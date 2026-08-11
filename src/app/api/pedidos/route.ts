import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");

    const pedidos = await prisma.pedido.findMany({
      where: estado ? { estado } : undefined,
      orderBy: [
        { urgencia: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      lat,
      lng,
      tipo,
      descripcion,
      urgencia,
      receptorNombre,
      receptorTelefono,
      receptorNotas,
      reportadorNombre,
      reportadorTelefono,
    } = body;

    if (!lat || !lng || !tipo || !descripcion || !receptorNombre || !receptorTelefono) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (incluye datos de quien recibe la ayuda)" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.create({
      data: {
        lat: Number(lat),
        lng: Number(lng),
        tipo,
        descripcion,
        urgencia: urgencia || "media",
        receptorNombre,
        receptorTelefono,
        receptorNotas: receptorNotas || null,
        reportadorNombre: reportadorNombre || null,
        reportadorTelefono: reportadorTelefono || null,
        estado: "abierto",
      },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
  }
}
