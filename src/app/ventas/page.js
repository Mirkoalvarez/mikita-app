'use client';

import { useState, useEffect } from 'react';
import { fetchCatalog } from '@/lib/catalog';
import { formatPrice } from '@/lib/formatters';
import { getActiveCaja, registrarVenta } from '@/lib/pos';

export default function PosTerminal() {
  const [catalog, setCatalog] = useState(null);
  const [caja, setCaja] = useState(null);
  
  // Cart state
  const [ticket, setTicket] = useState([]); // [{id, nombre, precio, tipo (srv/adic)}]
  const [discountPercent, setDiscountPercent] = useState(0); // Percentage 0-100
  
  // UI states
  const [activeTabCat, setActiveTabCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [catData, cajaData] = await Promise.all([
        fetchCatalog(),
        getActiveCaja()
      ]);
      setCatalog(catData);
      setCaja(cajaData);
      if (catData?.categorias?.length > 0) {
        setActiveTabCat(catData.categorias[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const addToTicket = (item, tipo) => {
    // Generate a unique ID so we can remove specific items even if they are the same service twice
    setTicket(prev => [...prev, { ...item, _uid: Math.random().toString(36).substring(7), tipo }]);
  };

  const removeFromTicket = (uid) => {
    setTicket(prev => prev.filter(item => item._uid !== uid));
  };

  const subtotal = ticket.reduce((sum, item) => sum + item.precio, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  const handleCobrar = async (metodo) => {
    if (!caja) {
      showToast('No hay caja abierta. Ve a Cierre de Caja primero.', true);
      return;
    }
    if (ticket.length === 0) return;

    setProcessing(true);
    const result = await registrarVenta({
      caja_id: caja.id,
      monto_total: total,
      metodo_pago: metodo,
      detalle: ticket,
      descuento: discountAmount
    });

    if (result) {
      showToast(`Cobrado con ${metodo} ✓`);
      setTicket([]);
      setDiscountPercent(0);
    } else {
      showToast('Error al procesar la venta', true);
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
      </div>
    );
  }

  if (!caja) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-bold text-mikita-chocolate">Caja Cerrada</h2>
        <p className="text-mikita-cocoa">Para empezar a vender, necesitas abrir la caja del día.</p>
        <a href="/ventas/caja" className="px-6 py-3 bg-mikita-chocolate text-mikita-cream rounded-xl font-bold hover:bg-mikita-chocolate-light transition-colors">
          Ir a Cierre de Caja
        </a>
      </div>
    );
  }

  // Find active category elements
  const activeCategory = catalog?.categorias?.find(c => c.id === activeTabCat);
  const deco = catalog?.adicionales?.decoraciones || [];
  const remo = catalog?.adicionales?.remociones || [];
  const extras = catalog?.adicionales?.extras || [];

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      {/* Left Column: Menu */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/40 rounded-3xl border border-mikita-warm/30 overflow-hidden shadow-sm">
        {/* Categories Navbar */}
        <div className="flex overflow-x-auto p-4 gap-2 bg-white/60 border-b border-mikita-warm/40 shrink-0 scrollbar-hide">
          {catalog?.categorias?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTabCat(cat.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTabCat === cat.id
                  ? 'bg-mikita-chocolate text-mikita-cream'
                  : 'bg-mikita-cream hover:bg-mikita-warm text-mikita-chocolate'
              }`}
            >
              {cat.icon} {cat.nombre}
            </button>
          ))}
          <div className="w-[1px] bg-mikita-warm mx-2 shrink-0"></div>
          <button
            onClick={() => setActiveTabCat('adicionales')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTabCat === 'adicionales'
                ? 'bg-mikita-chocolate text-mikita-cream'
                : 'bg-mikita-cream hover:bg-mikita-warm text-mikita-chocolate'
            }`}
          >
            ➕ Adicionales
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 content-start">
          {activeTabCat !== 'adicionales' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategory?.servicios?.map(srv => (
                <button
                  key={srv.id}
                  onClick={() => addToTicket(srv, 'servicio')}
                  className="p-4 bg-white rounded-2xl border border-mikita-warm/40 shadow-sm hover:border-mikita-chocolate/30 hover:shadow-md transition-all text-left flex flex-col h-full group"
                >
                  <p className="text-sm font-semibold text-mikita-chocolate leading-tight mb-2 flex-grow group-hover:text-mikita-chocolate-light">
                    {srv.nombre}
                  </p>
                  <div className="flex justify-between items-end w-full mt-auto">
                    <span className="text-[10px] text-mikita-cocoa/50">⏱ {srv.duracion}</span>
                    <span className="font-bold text-mikita-chocolate">{formatPrice(srv.precio)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Adicionales Sections */}
              {[{ title: 'Decoraciones', items: deco }, { title: 'Remociones', items: remo }, { title: 'Extras', items: extras }].map(sect => (
                sect.items.length > 0 && (
                  <div key={sect.title}>
                    <h3 className="font-bold text-mikita-cocoa mb-3">{sect.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sect.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToTicket(item, 'adicional')}
                          className="p-3 bg-mikita-cream-dark/50 rounded-2xl border border-mikita-warm/40 hover:border-mikita-chocolate/30 transition-all text-left flex justify-between items-center group"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-medium text-mikita-chocolate truncate">{item.nombre}</p>
                            {item.tipo && <p className="text-[10px] text-mikita-cocoa/50">{item.tipo}</p>}
                          </div>
                          <span className="font-bold text-mikita-chocolate shrink-0">{formatPrice(item.precio)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Ticket */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-3xl border border-mikita-warm/40 shadow-sm overflow-hidden shrink-0">
        <div className="p-4 bg-mikita-chocolate text-mikita-cream text-center font-bold">
          Ticket Actual
        </div>

        {/* Ticket Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-mikita-cream/20">
          {ticket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <span className="text-4xl mb-2">🏷️</span>
              <p className="text-sm font-medium text-mikita-cocoa">El ticket está vacío</p>
            </div>
          ) : (
            ticket.map((item, idx) => (
              <div key={item._uid} className="flex justify-between items-center p-2 hover:bg-mikita-warm/30 rounded-lg group animate-fade-in text-sm">
                <div className="min-w-0 pr-2 flex-1">
                  <p className="font-medium text-mikita-chocolate truncate leading-tight">
                    {idx + 1}. {item.nombre}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-mikita-chocolate">{formatPrice(item.precio)}</span>
                  <button 
                    onClick={() => removeFromTicket(item._uid)}
                    className="text-mikita-danger/40 hover:text-mikita-danger px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Controls */}
        <div className="p-4 bg-white border-t border-mikita-warm/40 space-y-4">
          <div className="space-y-2 border-b border-mikita-warm/20 pb-3">
            <div className="flex justify-between text-sm text-mikita-cocoa">
              <p>Subtotal</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            
            {/* Discount Control */}
            <div className="flex justify-between items-center group">
              <label className="text-sm text-mikita-cocoa">Descuento (%)</label>
              <div className="flex items-center gap-2">
                {discountAmount > 0 && <span className="text-xs text-mikita-success-dark font-medium">- {formatPrice(discountAmount)}</span>}
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 text-right bg-mikita-cream px-2 py-1 rounded border border-transparent focus:border-mikita-warm/50 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <p className="text-sm font-bold text-mikita-cocoa uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-mikita-chocolate">{formatPrice(total)}</p>
          </div>

          {/* Payment Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              disabled={ticket.length === 0 || processing}
              onClick={() => handleCobrar('efectivo')}
              className="flex-1 py-3 bg-mikita-success/10 text-mikita-success-dark font-bold rounded-xl hover:bg-mikita-success hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Efectivo 💵
            </button>
            <button
              disabled={ticket.length === 0 || processing}
              onClick={() => handleCobrar('digital')}
              className="flex-1 py-3 bg-blue-500/10 text-blue-700 font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Digital 📱
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 md:right-12 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl z-50 animate-fade-in
          ${toast.isError ? 'bg-mikita-danger text-white' : 'bg-mikita-success-dark text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
