"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Pedido, ZonaCritica } from "@prisma/client";
import PedidoForm from "@/components/PedidoForm";
import PedidoDetail from "@/components/PedidoDetail";
import SeguirPedido from "@/components/SeguirPedido";
import { List, Map as MapIcon, RefreshCw, Search, LocateFixed, Info, X } from "lucide-react";
import { getTipoLabel, getEstadoColor, ESTADOS, primerNombre } from "@/lib/utils";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>
  ),
});

export default function HomePage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [zonas, setZonas] = useState<ZonaCritica[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");
  const [newPedidoCoords, setNewPedidoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showSeguir, setShowSeguir] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [flyToUser, setFlyToUser] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pedidosRes, zonasRes] = await Promise.all([
        fetch("/api/pedidos"),
        fetch("/api/zonas"),
      ]);
      const pedidosData = await pedidosRes.json();
      const zonasData = await zonasRes.json();
      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setZonas(Array.isArray(zonasData) ? zonasData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPedido(null);
    setShowSeguir(false);
    setShowInfo(false);
    setNewPedidoCoords({ lat, lng });
  };

  const handlePedidoClick = (pedido: Pedido) => {
    setNewPedidoCoords(null);
    setShowSeguir(false);
    setShowInfo(false);
    setSelectedPedido(pedido);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyToUser(true);
        setTimeout(() => setFlyToUser(false), 1500);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const createAtMyLocation = () => {
    if (userLocation) {
      setNewPedidoCoords(userLocation);
      setSelectedPedido(null);
      setShowSeguir(false);
    } else {
      locateMe();
    }
  };

  const filteredPedidos = filterEstado
    ? pedidos.filter((p) => p.estado === filterEstado)
    : pedidos;

  const abiertos = pedidos.filter((p) => p.estado === "abierto").length;

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-red-700 text-white px-4 py-3 shadow-md z-20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">Aidbio · Ayuda Cali</h1>
            <p className="text-xs text-red-100">Terremoto 10 Ago 2026 · Mapa de ayudas</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowInfo(true); setSelectedPedido(null); setNewPedidoCoords(null); setShowSeguir(false); }}
              className="p-2 hover:bg-red-600 rounded-full"
              title="Cómo funciona"
            >
              <Info size={18} />
            </button>
            <button
              onClick={locateMe}
              className="p-2 hover:bg-red-600 rounded-full"
              title="Mi ubicación"
            >
              <LocateFixed size={18} className={locating ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={() => { setShowSeguir(true); setSelectedPedido(null); setNewPedidoCoords(null); setShowInfo(false); }}
              className="p-2 hover:bg-red-600 rounded-full"
              title="Seguir mi pedido"
            >
              <Search size={18} />
            </button>
            <button onClick={fetchData} className="p-2 hover:bg-red-600 rounded-full" title="Actualizar">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="bg-red-800 text-xs font-bold px-2.5 py-1 rounded-full ml-1">
              {abiertos}
            </div>
          </div>
        </div>
      </header>

      {/* Toggle Map / List */}
      <div className="flex bg-white border-b z-10 flex-shrink-0">
        <button
          onClick={() => setView("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium ${
            view === "map" ? "text-red-700 border-b-2 border-red-700" : "text-gray-500"
          }`}
        >
          <MapIcon size={16} /> Mapa
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium ${
            view === "list" ? "text-red-700 border-b-2 border-red-700" : "text-gray-500"
          }`}
        >
          <List size={16} /> Lista ({filteredPedidos.length})
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 relative overflow-hidden">
        {view === "map" ? (
          <div className="absolute inset-0">
            <Map
              pedidos={pedidos}
              zonas={zonas}
              onMapClick={handleMapClick}
              onPedidoClick={handlePedidoClick}
              userLocation={userLocation}
              flyToUser={flyToUser}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterEstado("")}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                  !filterEstado ? "bg-red-600 text-white" : "bg-gray-200"
                }`}
              >
                Todos
              </button>
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setFilterEstado(e.value)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                    filterEstado === e.value ? "bg-red-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {filteredPedidos.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>No hay pedidos {filterEstado ? `en estado "${filterEstado}"` : ""}</p>
                <p className="text-sm mt-1">Toca el mapa para crear uno</p>
              </div>
            ) : (
              filteredPedidos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPedido(p); setView("map"); }}
                  className="w-full text-left bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-red-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{getTipoLabel(p.tipo)}</div>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{p.descripcion}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {primerNombre(p.receptorNombre)} ***
                        {p.voluntarioNombre && ` · Vol: ${primerNombre(p.voluntarioNombre)}`}
                      </div>
                    </div>
                    <span className={`text-white text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${getEstadoColor(p.estado)}`}>
                      {ESTADOS.find((e) => e.value === p.estado)?.label}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {view === "map" && !newPedidoCoords && !selectedPedido && !showSeguir && !showInfo && (
          <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2 items-end">
            {userLocation && (
              <button
                onClick={createAtMyLocation}
                className="bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-full shadow-lg"
              >
                Pedir ayuda aquí
              </button>
            )}
            <div className="bg-white rounded-full shadow-lg px-4 py-2 text-xs text-gray-600 text-center">
              Toca el mapa para pedir ayuda
            </div>
          </div>
        )}
      </main>

      {/* Bottom sheets */}
      {newPedidoCoords && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setNewPedidoCoords(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PedidoForm
              lat={newPedidoCoords.lat}
              lng={newPedidoCoords.lng}
              onClose={() => setNewPedidoCoords(null)}
              onSuccess={fetchData}
            />
          </div>
        </div>
      )}

      {selectedPedido && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSelectedPedido(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PedidoDetail
              pedido={selectedPedido}
              onClose={() => setSelectedPedido(null)}
              onUpdate={() => { fetchData(); setSelectedPedido(null); }}
            />
          </div>
        </div>
      )}

      {showSeguir && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowSeguir(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SeguirPedido onClose={() => setShowSeguir(false)} />
          </div>
        </div>
      )}

      {/* Info / Cómo funciona */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowInfo(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bottom-sheet safe-bottom p-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Cómo funciona</h2>
              <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-red-700 mb-1.5">¿Necesitas ayuda?</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Toca el mapa en el lugar exacto (o usa el icono de ubicación).</li>
                  <li>Llena el formulario con los datos de quien recibe la ayuda.</li>
                  <li>Los <strong>últimos 4 números de tu celular</strong> serán tu código de seguimiento.</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700 mb-1.5">¿Eres voluntario?</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Busca en el mapa o en la lista las solicitudes abiertas.</li>
                  <li>Selecciona un pedido y toca <strong>“Tomar este pedido”</strong>.</li>
                  <li>Ingresa tus datos para ver el contacto de la persona.</li>
                  <li>Actualiza el estado: marca <strong>“En camino”</strong> y luego <strong>“Completado”</strong>.</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-600">
                  <strong>Cada punto es una oportunidad para apoyarnos.</strong>
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Responsabilidad:</strong> usa la herramienta con honestidad y respeto.
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Privacidad:</strong> los datos de contacto son confidenciales y solo se revelan a las personas involucradas.
                </p>
              </div>

              <div className="text-center pt-2 border-t">
                <p className="text-sm font-medium text-gray-800">¡Juntos somos más fuertes!</p>
                <p className="text-sm text-red-700 font-semibold">Cali se levanta</p>
                <a
                  href="https://www.aidbio.com.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mt-1 inline-block"
                >
                  www.aidbio.com.co
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
