'use client';

import { formatPrice } from '@/lib/formatters';

export default function QuoteSummary({ servicios, decoSummary, remociones, extras, total }) {
  if (!servicios || servicios.length === 0) return null;

  return (
    <section className="px-4 mt-6 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-mikita-warm/40 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mikita-cocoa mb-3">
          Resumen
        </h2>

        <div className="space-y-2">
          {/* Services */}
          {servicios.map((srv, i) => (
            <div key={srv.id || i} className="flex justify-between items-start text-sm">
              <span className="text-mikita-chocolate/80 flex-1 mr-2">💅 {srv.nombre}</span>
              <span className="font-semibold text-mikita-chocolate whitespace-nowrap">{formatPrice(srv.precio)}</span>
            </div>
          ))}

          {/* Decorations */}
          {decoSummary.length > 0 && decoSummary.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-mikita-chocolate/80">
                🎨 {d.tipo === 'full' ? d.nombre : `${d.cantidad}× ${d.nombre}`}
              </span>
              <span className="font-semibold text-mikita-chocolate">{formatPrice(d.precioTotal)}</span>
            </div>
          ))}

          {/* Remociones */}
          {remociones.map((r, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-mikita-chocolate/80">🧼 {r.nombre}</span>
              <span className="font-semibold text-mikita-chocolate">{formatPrice(r.precio)}</span>
            </div>
          ))}

          {/* Extras */}
          {extras.map((e, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-mikita-chocolate/80">✨ {e.nombre}</span>
              <span className="font-semibold text-mikita-chocolate">{formatPrice(e.precio)}</span>
            </div>
          ))}

          {/* Divider + Total */}
          <div className="pt-3 mt-2 border-t border-mikita-warm/40">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-mikita-chocolate">💰 TOTAL</span>
              <span className="text-2xl font-bold text-mikita-chocolate animate-count" key={total}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
