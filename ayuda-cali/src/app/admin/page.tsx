"use client";

import { useState } from "react";
import { getTipoLabel, ESTADOS, getEstadoColor } from "@/lib/utils";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error de autenticación");
        return;
      }
      setPedidos(data);
      setAuthenticated(true);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "list" }),
      });
      const data = await res.json();
      if (res.ok) setPedidos(data);
    } finally {
      setLoading(false);
    }
  };

  const deletePedido = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este pedido?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "delete", id }),
      });
      if (res.ok) {
        setMessage("Pedido eliminado");
        refresh();
      } else {
        setError("No se pudo eliminar");
      }
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id: string, estado: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "updateStatus", id, estado }),
      });
      if (res.ok) {
        setMessage("Estado actualizado");
        refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold text-center mb-4">Admin - Ayuda Cali</h1>
          <input
            type="password"
            placeholder="Contraseña de administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Admin - Pedidos</h1>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="text-sm bg-gray-200 px-3 py-1.5 rounded-lg"
            >
              Actualizar
            </button>
            <a href="/" className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg">
              Ir al mapa
            </a>
          </div>
        </div>

        {message && (
          <div className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg mb-3">
            {message}
          </div>
        )}

        <div className="text-sm text-gray-600 mb-3">
          Total: {pedidos.length} pedidos
        </div>

        <div className="space-y-3">
          {pedidos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-medium">{getTipoLabel(p.tipo)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString("es-CO")}
                  </div>
                </div>
                <span className={`text-white text-xs px-2 py-0.5 rounded-full ${getEstadoColor(p.estado)}`}>
                  {ESTADOS.find((e) => e.value === p.estado)?.label}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{p.descripcion}</p>

              <div className="text-xs space-y-1 bg-gray-50 rounded p-2 mb-3">
                <div><strong>Receptor:</strong> {p.receptorNombre} — {p.receptorTelefono}</div>
                {p.voluntarioNombre && (
                  <div><strong>Voluntario:</strong> {p.voluntarioNombre} — {p.voluntarioTelefono}</div>
                )}
                <div className="text-gray-500">
                  {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={p.estado}
                  onChange={(e) => changeStatus(p.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => deletePedido(p.id)}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
