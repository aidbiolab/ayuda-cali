"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Pedido, ZonaCritica } from "@prisma/client";
import { getTipoLabel, getEstadoColor, ESTADOS, etiquetaVoluntario, primerNombre } from "@/lib/utils";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Icono de ubicación actual (azul)
const myLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function getIconForEstado(estado: string) {
  switch (estado) {
    case "abierto": return redIcon;
    case "tomado":
    case "en_camino": return blueIcon;
    case "completado": return greenIcon;
    default: return orangeIcon;
  }
}

interface MapProps {
  pedidos: Pedido[];
  zonas: ZonaCritica[];
  onMapClick: (lat: number, lng: number) => void;
  onPedidoClick: (pedido: Pedido) => void;
  userLocation?: { lat: number; lng: number } | null;
  flyToUser?: boolean;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ location, active }: { location: { lat: number; lng: number } | null; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (active && location) {
      map.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
    }
  }, [active, location, map]);
  return null;
}

export default function Map({ pedidos, zonas, onMapClick, onPedidoClick, userLocation, flyToUser }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[3.42, -76.52]}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />
      <FlyToLocation location={userLocation ?? null} active={!!flyToUser} />

      {/* Zonas críticas */}
      {zonas.map((zona) => (
        <CircleMarker
          key={zona.id}
          center={[zona.lat, zona.lng]}
          radius={18}
          pathOptions={{ color: "#991b1b", fillColor: "#ef4444", fillOpacity: 0.35, weight: 2 }}
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <strong className="text-red-700">{zona.nombre}</strong>
              <p className="text-xs text-gray-600 mt-1">{zona.descripcion}</p>
              <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Zona crítica
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Pedidos */}
      {pedidos.map((pedido) => {
        const etiqueta = etiquetaVoluntario(pedido);
        return (
          <Marker
            key={pedido.id}
            position={[pedido.lat, pedido.lng]}
            icon={getIconForEstado(pedido.estado)}
            eventHandlers={{ click: () => onPedidoClick(pedido) }}
          >
            {etiqueta && (
              <Tooltip permanent direction="top" offset={[0, -35]} className="volunteer-label">
                <span className="text-xs font-semibold whitespace-nowrap">{etiqueta}</span>
              </Tooltip>
            )}
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold text-base mb-1">{getTipoLabel(pedido.tipo)}</div>
                <div className={`inline-block text-xs text-white px-2 py-0.5 rounded mb-2 ${getEstadoColor(pedido.estado)}`}>
                  {ESTADOS.find(e => e.value === pedido.estado)?.label}
                </div>
                <p className="text-gray-700 text-xs mb-2 line-clamp-3">{pedido.descripcion}</p>
                <div className="text-xs text-gray-500 border-t pt-2">
                  <div>Persona afectada: {primerNombre(pedido.receptorNombre)} ***</div>
                  {pedido.voluntarioNombre && (
                    <div className="text-blue-700 mt-1">Voluntario: {primerNombre(pedido.voluntarioNombre)}</div>
                  )}
                </div>
                <button
                  onClick={() => onPedidoClick(pedido)}
                  className="mt-2 w-full bg-red-600 text-white text-xs py-1.5 rounded font-medium"
                >
                  Ver / Gestionar
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Mi ubicación actual */}
      {userLocation && (
        <>
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={12}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.4,
              weight: 3,
            }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={myLocationIcon}>
            <Popup>
              <div className="text-sm font-medium text-blue-700">📍 Estás aquí</div>
            </Popup>
            <Tooltip permanent direction="bottom" offset={[0, 15]}>
              <span className="text-xs font-semibold text-blue-700">Mi ubicación</span>
            </Tooltip>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
