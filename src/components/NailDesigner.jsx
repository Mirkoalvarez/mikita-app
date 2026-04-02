'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/formatters';

const NAIL_POSITIONS = {
  left: [
    { id: 0, label: 'Meñique', cx: 18, cy: 70, r: 10 },
    { id: 1, label: 'Anular', cx: 36, cy: 45, r: 12 },
    { id: 2, label: 'Mayor', cx: 58, cy: 32, r: 13 },
    { id: 3, label: 'Índice', cx: 80, cy: 42, r: 12 },
    { id: 4, label: 'Pulgar', cx: 96, cy: 78, r: 14 },
  ],
  right: [
    { id: 5, label: 'Pulgar', cx: 14, cy: 78, r: 14 },
    { id: 6, label: 'Índice', cx: 30, cy: 42, r: 12 },
    { id: 7, label: 'Mayor', cx: 52, cy: 32, r: 13 },
    { id: 8, label: 'Anular', cx: 74, cy: 45, r: 12 },
    { id: 9, label: 'Meñique', cx: 92, cy: 70, r: 10 },
  ],
};

const DECO_COLORS = {
  'Nail Art por uña': '#C9A96E',
  'Nail Art Full (10 uñas)': '#C9A96E',
  'Deco x 2': '#A8917E',
  'Francesitas': '#F0E6D4',
  'Esculpida por uña': '#D4C4A8',
  'Parche': '#8C6F5A',
};

export default function NailDesigner({ decoraciones, nailSelections, onNailUpdate }) {
  const [activeNail, setActiveNail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleNailClick = (nailId) => {
    setActiveNail(nailId);
    setShowModal(true);
  };

  const handleSelectDecoration = (deco) => {
    if (deco === null) {
      // Remove decoration from this nail
      const updated = { ...nailSelections };
      delete updated[activeNail];
      onNailUpdate(updated);
    } else if (deco.tipo === 'full') {
      // Apply to all 10 nails
      const updated = {};
      for (let i = 0; i < 10; i++) {
        updated[i] = deco;
      }
      onNailUpdate(updated);
    } else {
      const updated = { ...nailSelections, [activeNail]: deco };
      onNailUpdate(updated);
    }
    setShowModal(false);
    setActiveNail(null);
  };

  const getDecoSummary = () => {
    const counts = {};
    Object.values(nailSelections).forEach(deco => {
      if (!counts[deco.nombre]) {
        counts[deco.nombre] = { ...deco, cantidad: 0, precioTotal: 0 };
      }
      counts[deco.nombre].cantidad += 1;
      if (deco.tipo === 'por_par') {
        // price is per pair, so we divide by 2 and ceil
        counts[deco.nombre].precioTotal = Math.ceil(counts[deco.nombre].cantidad / 2) * deco.precio;
      } else if (deco.tipo === 'full') {
        counts[deco.nombre].precioTotal = deco.precio;
      } else {
        counts[deco.nombre].precioTotal = counts[deco.nombre].cantidad * deco.precio;
      }
    });
    return Object.values(counts);
  };

  const decoSummary = getDecoSummary();
  const totalDeco = decoSummary.reduce((sum, d) => sum + d.precioTotal, 0);

  const renderHand = (positions, label) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-mikita-cocoa/60 font-medium">{label}</span>
      <svg viewBox="0 0 110 110" className="w-36 h-36">
        {positions.map((nail) => {
          const selected = nailSelections[nail.id];
          const color = selected ? (DECO_COLORS[selected.nombre] || '#C9A96E') : 'transparent';
          const isActive = activeNail === nail.id;
          return (
            <g key={nail.id} onClick={() => handleNailClick(nail.id)} className="cursor-pointer">
              {/* Nail shape - rounded rectangle */}
              <rect
                x={nail.cx - nail.r}
                y={nail.cy - nail.r * 1.3}
                width={nail.r * 2}
                height={nail.r * 2.6}
                rx={nail.r * 0.8}
                fill={color}
                stroke={isActive ? '#4D290A' : selected ? '#6B3D1A' : '#C9B99A'}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              {selected && (
                <text
                  x={nail.cx}
                  y={nail.cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[6px] fill-mikita-chocolate font-bold pointer-events-none select-none"
                >
                  ✓
                </text>
              )}
              {!selected && (
                <text
                  x={nail.cx}
                  y={nail.cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[5px] fill-mikita-cocoa/40 pointer-events-none select-none"
                >
                  +
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <section className="px-4 mt-6 animate-fade-in">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-mikita-cocoa mb-3">
        ② Diseño de uñas
      </h2>
      <p className="text-xs text-mikita-cocoa/70 mb-4">Tocá cada uña para agregar decoración</p>

      {/* Hands */}
      <div className="flex justify-center items-start gap-4 mb-4">
        {renderHand(NAIL_POSITIONS.left, 'Izquierda')}
        {renderHand(NAIL_POSITIONS.right, 'Derecha')}
      </div>

      {/* Summary of decorations */}
      {decoSummary.length > 0 && (
        <div className="bg-white/60 rounded-2xl p-3 space-y-1.5 mb-2 border border-mikita-warm/30">
          {decoSummary.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-mikita-chocolate/80">
                {d.tipo === 'full' ? d.nombre : `${d.cantidad}× ${d.nombre}`}
              </span>
              <span className="font-semibold text-mikita-chocolate">{formatPrice(d.precioTotal)}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-mikita-warm/30 flex justify-between text-sm font-bold">
            <span>Subtotal diseño</span>
            <span className="text-mikita-chocolate">{formatPrice(totalDeco)}</span>
          </div>
        </div>
      )}

      {/* Clear button */}
      {Object.keys(nailSelections).length > 0 && (
        <button
          onClick={() => onNailUpdate({})}
          className="w-full py-2 text-xs text-mikita-cocoa hover:text-mikita-danger transition-colors rounded-xl"
        >
          Limpiar diseño
        </button>
      )}

      {/* Decoration Picker Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => { setShowModal(false); setActiveNail(null); }}
        >
          <div
            className="w-full max-w-md bg-mikita-cream rounded-t-3xl p-5 pb-8 safe-bottom animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-mikita-warm rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-mikita-chocolate mb-3">
              Elegí decoración — Uña {activeNail !== null ? activeNail + 1 : ''}
            </h3>
            <div className="space-y-2">
              {decoraciones.map((deco) => (
                <button
                  key={deco.id}
                  onClick={() => handleSelectDecoration(deco)}
                  className="w-full flex justify-between items-center p-3.5 rounded-xl bg-white/80 border border-mikita-warm/30 hover:border-mikita-cocoa/40 active:scale-[0.98] transition-all min-h-[44px]"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-mikita-chocolate">{deco.nombre}</p>
                    <p className="text-[11px] text-mikita-cocoa/60">
                      {deco.tipo === 'full' ? 'Precio fijo (10 uñas)' : deco.tipo === 'por_par' ? 'Precio cada 2 uñas' : 'Precio por uña'}
                    </p>
                  </div>
                  <span className="font-bold text-mikita-chocolate ml-3">{formatPrice(deco.precio)}</span>
                </button>
              ))}
              {/* Remove decoration option */}
              {nailSelections[activeNail] && (
                <button
                  onClick={() => handleSelectDecoration(null)}
                  className="w-full p-3.5 rounded-xl bg-mikita-danger/10 text-mikita-danger text-sm font-medium text-center min-h-[44px] hover:bg-mikita-danger/20 transition-colors"
                >
                  Quitar decoración
                </button>
              )}
            </div>
            <button
              onClick={() => { setShowModal(false); setActiveNail(null); }}
              className="w-full mt-3 py-3 text-sm text-mikita-cocoa hover:text-mikita-chocolate transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
