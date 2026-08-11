import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { codigoSeguimiento } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");
    const telefono = searchParams.get("telefono");
    const codigo = searchParams.get("codigo");

    // Búsqueda por seguimiento (teléfono + código)
    if (telefono && codigo) {
      const digits = telefono.replace(/\D/g, "");
      const expectedCode = digits.slice(-4);
      if (codigo !== expectedCode) {
        return NextResponse.json([]);
      }
      const pedidos = await prisma.pedido.findMany({
        where: {
          receptorTelefono: {
            contains: digits.slice(-7), // match flexible
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      // Filtrar exactamente por últimos 4 dígitos
      const filtered = pedidos.filter((p) => codigoSeguimiento(p.receptorTelefono) === codigo);
      return NextResponse.json(filtered);
    }

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
      lat, lng, tipo, descripcion, urgencia,
      receptorNombre, receptorTelefono, receptorNotas,
      reportadorNombre, reportadorTelefono,
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
