import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const zonasCriticas = [
  {
    nombre: "Cuarto de Legua - Plaza de Toros",
    lat: 3.4105,
    lng: -76.5405,
    descripcion: "Edificio residencial de 5-7 pisos colapsado. Uno de los puntos más críticos. Búsqueda activa de personas.",
    tipo: "colapso",
  },
  {
    nombre: "Barrio Capri / Ciudad Capri",
    lat: 3.3950,
    lng: -76.5350,
    descripcion: "Varios edificios colapsados. Personas atrapadas reportadas. Alta concentración de daños.",
    tipo: "colapso",
  },
  {
    nombre: "Torres de Limonar / El Limonar",
    lat: 3.3900,
    lng: -76.5280,
    descripcion: "Edificio de al menos 4 pisos colapsó. Una de las zonas más afectadas del sur de Cali.",
    tipo: "colapso",
  },
  {
    nombre: "Hospital Universitario del Valle (HUV)",
    lat: 3.4300,
    lng: -76.5450,
    descripcion: "Daños estructurales graves. Pisos de pediatría, neonatología y medicina interna afectados. Evacuación de pacientes.",
    tipo: "hospital",
  },
  {
    nombre: "Comuna 17 - Corredor Calle Quinta",
    lat: 3.4000,
    lng: -76.5500,
    descripcion: "Una de las comunas más afectadas. Corredor desde el estadio hasta Unicentro. Falla geológica mencionada por Alcaldía.",
    tipo: "comuna",
  },
  {
    nombre: "Comuna 19 - Sector crítico",
    lat: 3.4200,
    lng: -76.5300,
    descripcion: "Una de las comunas más golpeadas según reporte oficial de la Alcaldía.",
    tipo: "comuna",
  },
  {
    nombre: "Moulin Rouge - Calle 10 # 38-21",
    lat: 3.4120,
    lng: -76.5380,
    descripcion: "Edificación colapsada cerca del Apartahotel Moulin Rouge. Colapso parcial del motel.",
    tipo: "colapso",
  },
  {
    nombre: "Motel Molino Rojo - Autopista Suroriental",
    lat: 3.3850,
    lng: -76.5200,
    descripcion: "Colapso casi total de la estructura.",
    tipo: "colapso",
  },
  {
    nombre: "La Alameda - Frente a la Galería",
    lat: 3.4400,
    lng: -76.5300,
    descripcion: "Edificación desplomada frente a la galería tradicional. Había farmacia en primer piso.",
    tipo: "colapso",
  },
  {
    nombre: "Calle 5 con 44 / El Lido",
    lat: 3.4250,
    lng: -76.5400,
    descripcion: "Edificio colapsado cerca del Hospital Universitario del Valle.",
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
    nombre: "Avenida Roosevelt",
    lat: 3.4050,
    lng: -76.5450,
    descripcion: "Edificación reducida a escombros.",
    tipo: "colapso",
  },
  {
    nombre: "Pampalinda / La Guadalupe",
    lat: 3.4055,
    lng: -76.5520,
    descripcion: "Daños graves reportados en estos sectores residenciales.",
    tipo: "colapso",
  },
];

async function main() {
  console.log("Actualizando zonas críticas de Cali...");

  // Eliminar las zonas anteriores para actualizar con la información más reciente
  await prisma.zonaCritica.deleteMany({});
  console.log("Zonas anteriores eliminadas.");

  await prisma.zonaCritica.createMany({ data: zonasCriticas });
  console.log(`✅ ${zonasCriticas.length} zonas críticas actualizadas y sembradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
