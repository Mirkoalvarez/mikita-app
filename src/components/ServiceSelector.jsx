'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/formatters';

export default function ServiceSelector({ servicios, onToggleService, selectedServices }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const categorias = servicios.categorias;
  const isSelected = (srvId) => selectedServices.some(s => s.id === srvId);
  const selectedCount = selectedServices.length;

  return (
    <section className="px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mikita-cocoa">
          ① Elegí los servicios
        </h2>
        {selectedCount > 0 && (
          <span className="text-xs bg-mikita-chocolate text-mikita-cream px-2.5 py-1 rounded-full font-semibold animate-fade-in">
            {selectedCount} {selectedCount === 1 ? 'servicio' : 'servicios'}
          </span>
        )}
      </div>
      
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categorias.map((cat) => {
          const catSelectedCount = selectedServices.filter(s => s._categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] shrink-0
                ${activeCategory === cat.id 
                  ? 'bg-mikita-chocolate text-mikita-cream shadow-lg shadow-mikita-chocolate/20 scale-105' 
                  : catSelectedCount > 0
                    ? 'bg-mikita-chocolate/15 text-mikita-chocolate border border-mikita-chocolate/30'
                    : 'bg-mikita-cream-dark text-mikita-chocolate hover:bg-mikita-warm'
                }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.nombre}</span>
              {catSelectedCount > 0 && activeCategory !== cat.id && (
                <span className="w-5 h-5 bg-mikita-chocolate text-mikita-cream rounded-full text-[10px] font-bold flex items-center justify-center">
                  {catSelectedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Service List */}
      {activeCategory && (
        <div className="mt-3 space-y-2 stagger-children">
          {categorias
            .find(c => c.id === activeCategory)
            ?.servicios.map((srv) => {
              const sel = isSelected(srv.id);
              return (
                <button
                  key={srv.id}
                  onClick={() => onToggleService(srv, activeCategory)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 min-h-[44px] border
                    ${sel 
                      ? 'bg-mikita-chocolate text-mikita-cream border-mikita-chocolate shadow-lg shadow-mikita-chocolate/20' 
                      : 'bg-white/70 border-mikita-warm/50 hover:border-mikita-cocoa/40 hover:shadow-md active:scale-[0.98]'
                    }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Checkbox indicator */}
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                        ${sel 
                          ? 'bg-mikita-cream/20 border-mikita-cream/50' 
                          : 'border-mikita-cocoa/30 bg-white/50'
                        }`}>
                        {sel && (
                          <svg className="w-3 h-3 text-mikita-cream" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm leading-snug ${sel ? 'text-mikita-cream' : 'text-mikita-chocolate'}`}>
                          {srv.nombre}
                        </p>
                        <p className={`text-xs mt-1 ${sel ? 'text-mikita-cream/70' : 'text-mikita-cocoa'}`}>
                          ⏱ {srv.duracion}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-base whitespace-nowrap ${sel ? 'text-mikita-accent' : 'text-mikita-chocolate'}`}>
                      {formatPrice(srv.precio)}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* Selected services summary chips */}
      {selectedCount > 1 && (
        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
          {selectedServices.map(srv => (
            <button
              key={srv.id}
              onClick={() => onToggleService(srv, srv._categoryId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mikita-chocolate/10 text-mikita-chocolate text-xs font-medium border border-mikita-chocolate/20 hover:bg-mikita-danger/10 hover:border-mikita-danger/30 hover:text-mikita-danger transition-all group"
            >
              <span className="truncate max-w-[140px]">{srv.nombre}</span>
              <span className="font-bold">{formatPrice(srv.precio)}</span>
              <span className="text-mikita-cocoa/40 group-hover:text-mikita-danger transition-colors">✕</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
