"use client";

import { useState } from "react";
import { Pedido } from "@prisma/client";
import { getTipoLabel, ESTADOS, getEstadoColor, codigoSeguimiento, primerNombre } from "@/lib/utils";
import { X, Phone, User, Lock } from "lucide-react";

interface PedidoDetailProps {
  pedido: Pedido;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PedidoDetail({ pedido, onClose, onUpdate }: PedidoDetailProps) {
  const [loading, setLoading] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [voluntarioNombre, setVoluntarioNombre] = useState("");
  const [voluntarioTelefono, setVoluntarioTelefono] = useState("");
  const [error, setError] = useState("");
  
  // Protección de datos: necesita código para ver contactos si ya está tomado
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const isClaimed = pedido.estado !== "abierto";

  const tryUnlock = () => {
    setCodeError("");
    const code = codeInput.replace(/\D/g, "").slice(-4);
    if (code.length !== 4) {
      setCodeError("Ingresa 4 dígitos");
      return;
    }

    const codeReceptor = codigoSeguimiento(pedido.receptorTelefono);
    const codeVoluntario = pedido.voluntarioTelefono
      ? codigoSeguimiento(pedido.voluntarioTelefono)
      : null;

    if (code === codeReceptor || (codeVoluntario && code === codeVoluntario)) {
      setUnlocked(true);
    } else {
      setCodeError("Código incorrecto. Usa los últimos 4 dígitos del celular del solicitante o del voluntario.");
    }
  };

  const handleClaim = async () => {
    if (!voluntarioNombre.trim() || !voluntarioTelefono.trim()) {
      setError("Nombre y teléfono del voluntario son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "tomado",
          voluntarioNombre,
          voluntarioTelefono,
        }),
      });
      if (!res.ok) throw new Error("Error al tomar el pedido");
      onUpdate();
      setShowClaimForm(false);
      setUnlocked(true); // Al tomar el pedido, el voluntario ve los datos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (nuevoEstado: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bottom-sheet safe-bottom p-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">{getTipoLabel(pedido.tipo)}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className={`inline-block text-white text-xs px-2.5 py-1 rounded-full mb-3 ${getEstadoColor(pedido.estado)}`}>
        {ESTADOS.find((e) => e.value === pedido.estado)?.label}
      </div>

      <p className="text-sm text-gray-700 mb-4">{pedido.descripcion}</p>

      {/* ========== DATOS DE CONTACTO PROTEGIDOS ========== */}
      {isClaimed && !unlocked ? (
        // Pedido ya tomado → pedir código para ver contactos
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Lock size={18} />
            <h3 className="text-sm font-semibold">Datos protegidos</h3>
          </div>
          <p className="text-xs text-amber-700">
            Este pedido ya fue tomado. Para ver los datos de contacto ingresa los 
            <strong> últimos 4 dígitos</strong> del celular del solicitante o del voluntario.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-center text-lg font-bold tracking-widest"
            />
            <button
              onClick={tryUnlock}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Ver datos
            </button>
          </div>
          {codeError && <p className="text-red-600 text-xs">{codeError}</p>}
          
          {/* Info pública limitada */}
          <div className="text-xs text-gray-500 pt-2 border-t border-amber-200">
            Solicitante: {primerNombre(pedido.receptorNombre)} ***
            {pedido.voluntarioNombre && (
              <span> · Voluntario: {primerNombre(pedido.voluntarioNombre)}</span>
            )}
          </div>
        </div>
      ) : (
        // Datos visibles (pedido abierto o ya desbloqueado)
        <>
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Persona que recibe la ayuda
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span className="font-medium">{pedido.receptorNombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-gray-400" />
              <a href={`tel:${pedido.receptorTelefono}`} className="text-blue-600 font-medium">
                {pedido.receptorTelefono}
              </a>
            </div>
            {pedido.receptorNotas && (
              <p className="text-xs text-gray-600 pl-6">{pedido.receptorNotas}</p>
            )}
          </div>

          {pedido.voluntarioNombre && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-1">
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Voluntario asignado
              </h3>
              <div className="text-sm font-medium">{pedido.voluntarioNombre}</div>
              {pedido.voluntarioTelefono && (
                <a href={`tel:${pedido.voluntarioTelefono}`} className="text-sm text-blue-600">
                  {pedido.voluntarioTelefono}
                </a>
              )}
            </div>
          )}
        </>
      )}

      {/* Acciones según estado */}
      {pedido.estado === "abierto" && !showClaimForm && (
        <button
          onClick={() => setShowClaimForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm"
        >
          Tomar este pedido
        </button>
      )}

      {showClaimForm && (
        <div className="space-y-3 border-t pt-3">
          <h3 className="text-sm font-semibold">Tus datos como voluntario</h3>
          <p className="text-xs text-gray-500">
            Al tomar el pedido podrás ver los datos de contacto de la persona afectada.
          </p>
          <input
            type="text"
            placeholder="Tu nombre completo *"
            value={voluntarioNombre}
            onChange={(e) => setVoluntarioNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Tu teléfono / WhatsApp *"
            value={voluntarioTelefono}
            onChange={(e) => setVoluntarioTelefono(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setShowClaimForm(false)}
              className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleClaim}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {loading ? "..." : "Confirmar y ver contacto"}
            </button>
          </div>
        </div>
      )}

      {/* Botones de estado solo si está desbloqueado o es el voluntario */}
      {unlocked && (pedido.estado === "tomado" || pedido.estado === "en_camino") && (
        <div className="flex gap-2 mt-3">
          {pedido.estado === "tomado" && (
            <button
              onClick={() => handleStatusChange("en_camino")}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium"
            >
              Marcar En camino
            </button>
          )}
          <button
            onClick={() => handleStatusChange("completado")}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium"
          >
            Completado
          </button>
        </div>
      )}

      {pedido.estado === "completado" && unlocked && (
        <div className="text-center text-green-700 text-sm font-medium py-2">
          ✓ Ayuda entregada
        </div>
      )}
    </div>
  );
}
