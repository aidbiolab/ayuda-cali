"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Pedido, ZonaCritica } from "@prisma/client";
import PedidoForm from "@/components/PedidoForm";
import PedidoDetail from "@/components/PedidoDetail";
import SeguirPedido from "@/components/SeguirPedido";
import { List, Map as MapIcon, RefreshCw, Search } from "lucide-react";
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
  const [filterEstado, setFilterEstado] = useState<string>("");

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
    setNewPedidoCoords({ lat, lng });
  };

  const handlePedidoClick = (pedido: Pedido) => {
    setNewPedidoCoords(null);
    setShowSeguir(false);
    setSelectedPedido(pedido);
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
            <h1 className="text-lg font-bold leading-tight">Ayuda Cali</h1>
            <p className="text-xs text-red-100">Terremoto 10 Ago 2026 · Mapa de ayuda</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSeguir(true); setSelectedPedido(null); setNewPedidoCoords(null); }}
              className="p-2 hover:bg-red-600 rounded-full"
              title="Seguir mi pedido"
            >
              <Search size={18} />
            </button>
            <button onClick={fetchData} className="p-2 hover:bg-red-600 rounded-full" title="Actualizar">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="bg-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {abiertos} abiertos
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

        {view === "map" && !newPedidoCoords && !selectedPedido && !showSeguir && (
          <div className="absolute bottom-6 right-4 z-10">
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
    </div>
  );
}
