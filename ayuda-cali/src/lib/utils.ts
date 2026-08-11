import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TIPOS_AYUDA = [
  { value: "agua", label: "💧 Agua", color: "bg-blue-500" },
  { value: "comida", label: "🍲 Comida", color: "bg-orange-500" },
  { value: "medicinas", label: "💊 Medicinas", color: "bg-red-500" },
  { value: "ropa", label: "👕 Ropa / Cobijas", color: "bg-purple-500" },
  { value: "rescate", label: "🆘 Rescate / Personas atrapadas", color: "bg-red-700" },
  { value: "albergue", label: "🏠 Albergue / Refugio", color: "bg-yellow-600" },
  { value: "otro", label: "📦 Otro", color: "bg-gray-500" },
] as const;

export const URGENCIAS = [
  { value: "baja", label: "Baja", color: "bg-green-100 text-green-800" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "critica", label: "Crítica", color: "bg-red-100 text-red-800" },
] as const;

export const ESTADOS = [
  { value: "abierto", label: "Abierto", color: "bg-red-500" },
  { value: "tomado", label: "Tomado", color: "bg-blue-500" },
  { value: "en_camino", label: "En camino", color: "bg-indigo-500" },
  { value: "completado", label: "Completado", color: "bg-green-500" },
  { value: "cancelado", label: "Cancelado", color: "bg-gray-400" },
] as const;

export function getTipoLabel(tipo: string) {
  return TIPOS_AYUDA.find((t) => t.value === tipo)?.label ?? tipo;
}

export function getEstadoColor(estado: string) {
  return ESTADOS.find((e) => e.value === estado)?.color ?? "bg-gray-400";
}

export function getEstadoLabel(estado: string) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado;
}

/** Extrae el primer nombre */
export function primerNombre(nombre: string | null | undefined): string {
  if (!nombre) return "";
  return nombre.trim().split(/\s+/)[0];
}

/** Genera código de seguimiento = últimos 4 dígitos del teléfono */
export function codigoSeguimiento(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  return digits.slice(-4).padStart(4, "0");
}

/** Texto corto para mostrar sobre el marcador */
export function etiquetaVoluntario(pedido: { estado: string; voluntarioNombre?: string | null }): string | null {
  if (!pedido.voluntarioNombre) return null;
  const nombre = primerNombre(pedido.voluntarioNombre);
  if (pedido.estado === "tomado") return `${nombre} tomó el pedido`;
  if (pedido.estado === "en_camino") return `${nombre} va en camino`;
  if (pedido.estado === "completado") return `${nombre} completó`;
  return null;
}
