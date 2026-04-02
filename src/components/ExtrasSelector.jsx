'use client';

import { formatPrice } from '@/lib/formatters';

export default function ExtrasSelector({ remociones, extras, selectedRemociones, selectedExtras, onToggleRemocion, onToggleExtra }) {
  return (
    <section className="px-4 mt-6 animate-fade-in">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-mikita-cocoa mb-3">
        ③ Extras
      </h2>

      {/* Remociones */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-mikita-cocoa/70 font-medium">Remociones</p>
        {remociones.map((item) => {
          const checked = selectedRemociones.some(r => r.id === item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 min-h-[44px] cursor-pointer border
                ${checked 
                  ? 'bg-mikita-chocolate/10 border-mikita-chocolate/30' 
                  : 'bg-white/60 border-mikita-warm/30 hover:border-mikita-cocoa/30'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                  ${checked 
                    ? 'bg-mikita-chocolate border-mikita-chocolate' 
                    : 'border-mikita-cocoa/40 bg-white'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-mikita-cream" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-mikita-chocolate">{item.nombre}</span>
              </div>
              <span className="font-semibold text-sm text-mikita-chocolate">{formatPrice(item.precio)}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleRemocion(item)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>

      {/* Extras */}
      <div className="space-y-2">
        <p className="text-xs text-mikita-cocoa/70 font-medium">Adicionales</p>
        {extras.map((item) => {
          const checked = selectedExtras.some(e => e.id === item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 min-h-[44px] cursor-pointer border
                ${checked 
                  ? 'bg-mikita-chocolate/10 border-mikita-chocolate/30' 
                  : 'bg-white/60 border-mikita-warm/30 hover:border-mikita-cocoa/30'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                  ${checked 
                    ? 'bg-mikita-chocolate border-mikita-chocolate' 
                    : 'border-mikita-cocoa/40 bg-white'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-mikita-cream" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-mikita-chocolate">{item.nombre}</span>
              </div>
              <span className="font-semibold text-sm text-mikita-chocolate">{formatPrice(item.precio)}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleExtra(item)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
