import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const zonasCriticas = [
  {
    nombre: "Cuarto de Legua - Plaza de Toros",
    lat: 3.4105,
    lng: -76.5405,
    descripcion: "Edificio residencial de 5-7 pisos colapsado. Uno de los puntos más críticos.",
    tipo: "colapso",
  },
  {
    nombre: "Barrio Capri / Ciudad Capri",
    lat: 3.3950,
    lng: -76.5350,
    descripcion: "Varios edificios colapsados. Personas atrapadas reportadas.",
    tipo: "colapso",
  },
  {
    nombre: "Hospital Universitario del Valle (HUV)",
    lat: 3.4300,
    lng: -76.5450,
    descripcion: "Daños estructurales graves. Evacuación de pacientes.",
    tipo: "hospital",
  },
  {
    nombre: "Comuna 17 - Sector crítico",
    lat: 3.4000,
    lng: -76.5500,
    descripcion: "Una de las comunas más afectadas según Alcaldía.",
    tipo: "comuna",
  },
  {
    nombre: "Comuna 19 - Sector crítico",
    lat: 3.4200,
    lng: -76.5300,
    descripcion: "Una de las comunas más afectadas según Alcaldía.",
    tipo: "comuna",
  },
  {
    nombre: "Motel Molino Rojo - Autopista Suroriental",
    lat: 3.3850,
    lng: -76.5200,
    descripcion: "Colapso casi total de la estructura.",
    tipo: "colapso",
  },
  {
    nombre: "Sector La Luna",
    lat: 3.4150,
    lng: -76.5250,
    descripcion: "Estructura colapsada reportada por Alcaldía.",
    tipo: "colapso",
  },
  {
    nombre: "Calle 5 con 44 / El Lido",
    lat: 3.4250,
    lng: -76.5400,
    descripcion: "Edificio colapsado cerca del HUV.",
    tipo: "colapso",
  },
  {
    nombre: "Avenida Roosevelt",
    lat: 3.4050,
    lng: -76.5450,
    descripcion: "Edificación reducida a escombros.",
    tipo: "colapso",
  },
  {
    nombre: "La Alameda - Calle 9 con 24",
    lat: 3.4400,
    lng: -76.5300,
    descripcion: "Colapso parcial de edificación residencial.",
    tipo: "colapso",
  },
];

async function main() {
  console.log("Sembrando zonas críticas de Cali...");

  const existing = await prisma.zonaCritica.count();
  if (existing === 0) {
    await prisma.zonaCritica.createMany({ data: zonasCriticas });
    console.log(`✅ ${zonasCriticas.length} zonas críticas sembradas.`);
  } else {
    console.log(`Ya existen ${existing} zonas. Saltando seed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
