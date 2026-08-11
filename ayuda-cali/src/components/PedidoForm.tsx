"use client";

import { useState } from "react";
import { TIPOS_AYUDA, URGENCIAS, codigoSeguimiento } from "@/lib/utils";
import { X } from "lucide-react";

interface PedidoFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PedidoForm({ lat, lng, onClose, onSuccess }: PedidoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipo: "agua",
    descripcion: "",
    urgencia: "media",
    receptorNombre: "",
    receptorTelefono: "",
    receptorNotas: "",
    reportadorNombre: "",
    reportadorTelefono: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.receptorNombre.trim() || !form.receptorTelefono.trim()) {
      setError("El nombre y teléfono de la persona que recibe la ayuda son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lat, lng }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el pedido");
      }

      // Mostrar código de seguimiento
      const code = codigoSeguimiento(form.receptorTelefono);
      setCodigo(code);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito con código
  if (codigo) {
    return (
      <div className="bottom-sheet safe-bottom p-5 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Pedido registrado</h2>
        <p className="text-sm text-gray-600 mb-4">
          Guarda este código para seguir el estado de tu solicitud:
        </p>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl py-4 px-6 mb-4">
          <div className="text-xs text-red-600 font-medium mb-1">CÓDIGO DE SEGUIMIENTO</div>
          <div className="text-3xl font-bold tracking-widest text-red-700">{codigo}</div>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Son los últimos 4 dígitos del teléfono. Úsalo junto con el número para consultar el estado.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl"
        >
          Entendido
        </button>
      </div>
    );
  }

  return (
    <div className="bottom-sheet safe-bottom p-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Solicitar Ayuda</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Ubicación: {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de ayuda *</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS_AYUDA.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, tipo: t.value })}
                className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                  form.tipo === t.value
                    ? "border-red-500 bg-red-50 text-red-800 font-medium"
                    : "border-gray-200 bg-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
          <select
            value={form.urgencia}
            onChange={(e) => setForm({ ...form, urgencia: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {URGENCIAS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Detalles *</label>
          <textarea
            required
            rows={3}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Ej: Familia de 4 personas, necesita agua potable..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
          <h3 className="text-sm font-semibold text-red-800">
            Datos de la persona que recibe la ayuda *
          </h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              required
              type="text"
              value={form.receptorNombre}
              onChange={(e) => setForm({ ...form, receptorNombre: e.target.value })}
              placeholder="Nombre de quien necesita la ayuda"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono / WhatsApp *</label>
            <input
              required
              type="tel"
              value={form.receptorTelefono}
              onChange={(e) => setForm({ ...form, receptorTelefono: e.target.value })}
              placeholder="Ej: 3001234567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Los últimos 4 dígitos serán tu código de seguimiento.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={form.receptorNotas}
              onChange={(e) => setForm({ ...form, receptorNotas: e.target.value })}
              placeholder="Edificio, piso, punto de referencia..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Datos de quien reporta (opcional)</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={form.reportadorNombre}
              onChange={(e) => setForm({ ...form, reportadorNombre: e.target.value })}
              placeholder="Tu nombre"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="tel"
              value={form.reportadorTelefono}
              onChange={(e) => setForm({ ...form, reportadorTelefono: e.target.value })}
              placeholder="Tu teléfono"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 text-sm px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-xl text-sm transition"
        >
          {loading ? "Enviando..." : "Registrar Pedido de Ayuda"}
        </button>
      </form>
    </div>
  );
}
