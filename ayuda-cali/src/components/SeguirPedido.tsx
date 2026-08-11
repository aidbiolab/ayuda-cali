"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getTipoLabel, getEstadoLabel, getEstadoColor, codigoSeguimiento } from "@/lib/utils";

interface SeguirPedidoProps {
  onClose: () => void;
}

export default function SeguirPedido({ onClose }: SeguirPedidoProps) {
  const [telefono, setTelefono] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState<any>(null);

  const buscar = async () => {
    setError("");
    setPedido(null);
    if (!telefono || !codigo) {
      setError("Ingresa el teléfono y el código");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos?telefono=${encodeURIComponent(telefono)}&codigo=${encodeURIComponent(codigo)}`);
      const data = await res.json();
      if (!res.ok || !data || data.length === 0) {
        setError("No se encontró ningún pedido con esos datos");
        return;
      }
      setPedido(data[0]);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bottom-sheet safe-bottom p-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Seguir mi pedido</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      {!pedido ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa el teléfono con el que registraste la solicitud y el código de 4 dígitos que te dieron.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="3001234567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Código de 4 dígitos</label>
            <input
              type="text"
              maxLength={4}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              placeholder="1234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm tracking-widest text-center text-lg font-bold"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={buscar}
            disabled={loading}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Consultar estado"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`inline-block text-white text-sm px-3 py-1 rounded-full ${getEstadoColor(pedido.estado)}`}>
            {getEstadoLabel(pedido.estado)}
          </div>
          <div>
            <div className="font-medium">{getTipoLabel(pedido.tipo)}</div>
            <p className="text-sm text-gray-600 mt-1">{pedido.descripcion}</p>
          </div>
          {pedido.voluntarioNombre && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="font-medium text-blue-800">Voluntario asignado</div>
              <div>{pedido.voluntarioNombre}</div>
              {pedido.estado === "en_camino" && (
                <div className="text-blue-600 mt-1 font-medium">Va en camino hacia ti</div>
              )}
            </div>
          )}
          <button
            onClick={() => { setPedido(null); setCodigo(""); }}
            className="w-full border border-gray-300 py-2.5 rounded-xl text-sm"
          >
            Consultar otro
          </button>
        </div>
      )}
    </div>
  );
}
