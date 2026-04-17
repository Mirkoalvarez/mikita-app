'use client';

import { useState } from 'react';
import ServiciosCRUD from './ServiciosCRUD';
import AdicionalesCRUD from './AdicionalesCRUD';
import QuoteHistory from './QuoteHistory';
import InventarioManager from './InventarioManager';
import ConfigManager from './ConfigManager';

export default function AdminDashboard() {
  const [tab, setTab] = useState('servicios');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const tabs = [
    { id: 'servicios', label: '💅 Servicios' },
    { id: 'adicionales', label: '🎨 Adicionales' },
    { id: 'historial', label: '📋 Historial' },
    { id: 'inventario', label: '📦 Inventario' },
    { id: 'config', label: '⚙️ Config' },
  ];

  return (
    <main className="max-w-lg mx-auto pb-12">
      <div className="sticky top-0 z-40 bg-mikita-cream pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-mikita-chocolate">Panel de gestión</h1>
            <p className="text-xs text-mikita-cocoa/60">Mikita Nail Bar</p>
          </div>
          <div className="flex gap-2">
            <a href="/ventas" className="px-3 py-2 rounded-xl bg-mikita-cream-dark text-mikita-chocolate border border-mikita-warm/40 text-[13px] font-medium hover:bg-mikita-warm transition-colors min-h-[44px] flex items-center shadow-sm">
              🛒 Vender
            </a>
            <a href="/" className="px-4 py-2 rounded-xl bg-mikita-chocolate text-mikita-cream text-[13px] font-medium hover:bg-mikita-chocolate-light transition-colors min-h-[44px] flex items-center shadow-sm">
              ← Cotizador
            </a>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] shrink-0
                ${tab === t.id
                  ? 'bg-mikita-chocolate text-mikita-cream shadow-lg'
                  : 'bg-mikita-cream-dark text-mikita-chocolate hover:bg-mikita-warm'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === 'servicios' && <ServiciosCRUD showToast={showToast} />}
        {tab === 'adicionales' && <AdicionalesCRUD showToast={showToast} />}
        {tab === 'historial' && <QuoteHistory />}
        {tab === 'inventario' && <InventarioManager showToast={showToast} />}
        {tab === 'config' && <ConfigManager showToast={showToast} />}
      </div>

      {toast && (
        <div className={`toast px-5 py-3 rounded-2xl text-sm font-medium shadow-xl
          ${toast.type === 'error' ? 'bg-mikita-danger text-white' : 'bg-mikita-chocolate text-mikita-cream'}`}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
