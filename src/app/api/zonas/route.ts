import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const zonas = await prisma.zonaCritica.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(zonas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener zonas" }, { status: 500 });
  }
}
