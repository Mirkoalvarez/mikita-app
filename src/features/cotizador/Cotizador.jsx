'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/shared/components/Header';
import ServiceSelector from './ServiceSelector';
import NailDesigner from './NailDesigner';
import ExtrasSelector from './ExtrasSelector';
import QuoteSummary from './QuoteSummary';
import WhatsAppSection from './WhatsAppSection';
import { fetchCatalog } from '@/shared/lib/catalog';
import fallbackData from '@/data/services.json';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-mikita-chocolate text-mikita-cream shadow-xl shadow-mikita-chocolate/30 flex items-center justify-center transition-all duration-300 active:scale-90 hover:bg-mikita-chocolate-light
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}

function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;
  return (
    <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl bg-mikita-accent/20 text-mikita-chocolate text-xs text-center font-medium animate-fade-in">
      📡 Sin conexión — Trabajando con datos guardados
    </div>
  );
}

export default function Cotizador() {
  const [catalogData, setCatalogData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog().then(data => {
      setCatalogData(data);
      setLoading(false);
    });
  }, []);

  const MANOS_CATEGORY_ID = catalogData.categoriaManos;

  const [selectedServices, setSelectedServices] = useState([]);
  const [nailSelections, setNailSelections] = useState({});
  const [selectedRemociones, setSelectedRemociones] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);

  const hasManos = selectedServices.some(s => s._categoryId === MANOS_CATEGORY_ID);

  const handleToggleService = (srv, categoryId) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === srv.id);
      if (exists) {
        const updated = prev.filter(s => s.id !== srv.id);
        if (!updated.some(s => s._categoryId === MANOS_CATEGORY_ID)) setNailSelections({});
        return updated;
      }
      return [...prev, { ...srv, _categoryId: categoryId }];
    });
  };

  const handleToggleRemocion = (item) => {
    setSelectedRemociones(prev =>
      prev.some(r => r.id === item.id) ? prev.filter(r => r.id !== item.id) : [...prev, item]
    );
  };

  const handleToggleExtra = (item) => {
    setSelectedExtras(prev =>
      prev.some(e => e.id === item.id) ? prev.filter(e => e.id !== item.id) : [...prev, item]
    );
  };

  const decoSummary = useMemo(() => {
    const counts = {};
    Object.values(nailSelections).forEach(deco => {
      if (!counts[deco.nombre]) counts[deco.nombre] = { ...deco, cantidad: 0, precioTotal: 0 };
      counts[deco.nombre].cantidad += 1;
    });
    Object.values(counts).forEach(d => {
      if (d.tipo === 'por_par') d.precioTotal = Math.ceil(d.cantidad / 2) * d.precio;
      else if (d.tipo === 'full') d.precioTotal = d.precio;
      else d.precioTotal = d.cantidad * d.precio;
    });
    return Object.values(counts);
  }, [nailSelections]);

  const total = useMemo(() => {
    return (
      selectedServices.reduce((sum, s) => sum + s.precio, 0) +
      decoSummary.reduce((sum, d) => sum + d.precioTotal, 0) +
      selectedRemociones.reduce((sum, r) => sum + r.precio, 0) +
      selectedExtras.reduce((sum, e) => sum + e.precio, 0)
    );
  }, [selectedServices, decoSummary, selectedRemociones, selectedExtras]);

  const handleReset = () => {
    setSelectedServices([]);
    setNailSelections({});
    setSelectedRemociones([]);
    setSelectedExtras([]);
  };

  const hasSelection = selectedServices.length > 0;

  return (
    <main className="max-w-md mx-auto pb-24">
      <Header />
      <OnlineIndicator />

      {/* Quick nav */}
      <div className="flex justify-end gap-2 px-4 mb-1">
        <a href="/admin" className="text-[11px] text-mikita-cocoa/40 hover:text-mikita-cocoa transition-colors">
          ⚙️ Gestión
        </a>
        <span className="text-mikita-cocoa/20">·</span>
        <a href="/ventas" className="text-[11px] text-mikita-cocoa/40 hover:text-mikita-cocoa transition-colors">
          🛒 POS
        </a>
      </div>

      <ServiceSelector
        servicios={catalogData}
        onToggleService={handleToggleService}
        selectedServices={selectedServices}
      />

      {hasSelection && hasManos && (
        <NailDesigner
          decoraciones={catalogData.adicionales.decoraciones}
          nailSelections={nailSelections}
          onNailUpdate={setNailSelections}
        />
      )}

      {hasSelection && (
        <ExtrasSelector
          remociones={catalogData.adicionales.remociones}
          extras={catalogData.adicionales.extras}
          selectedRemociones={selectedRemociones}
          selectedExtras={selectedExtras}
          onToggleRemocion={handleToggleRemocion}
          onToggleExtra={handleToggleExtra}
        />
      )}

      {hasSelection && (
        <QuoteSummary
          servicios={selectedServices}
          decoSummary={decoSummary}
          remociones={selectedRemociones}
          extras={selectedExtras}
          total={total}
        />
      )}

      {hasSelection && (
        <WhatsAppSection
          servicios={selectedServices}
          decoSummary={decoSummary}
          remociones={selectedRemociones}
          extras={selectedExtras}
          total={total}
        />
      )}

      {hasSelection && (
        <div className="px-4 pb-8">
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-2xl border-2 border-mikita-cocoa/20 text-mikita-cocoa text-sm font-medium hover:bg-mikita-cream-dark active:scale-[0.98] transition-all"
          >
            Nuevo presupuesto
          </button>
        </div>
      )}

      <ScrollToTopButton />
    </main>
  );
}
