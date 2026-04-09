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
  const [ticketOpen, setTicketOpen] = useState(false); // Mobile ticket panel

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

  const showToast = (msg, isError = false, payment = null) => {
    setToast({ msg, isError, payment });
    setTimeout(() => setToast(null), payment ? 4000 : 3000);
  };

  const addToTicket = (item, tipo) => {
    setTicket(prev => [...prev, { ...item, _uid: Math.random().toString(36).substring(7), tipo }]);
  };

  const removeFromTicket = (uid) => {
    setTicket(prev => prev.filter(item => item._uid !== uid));
  };

  // Count how many times each item (by id) is in the ticket
  const countMap = ticket.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + 1;
    return acc;
  }, {});

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
      showToast(null, false, { metodo, total, count: ticket.length });
      setTicket([]);
      setDiscountPercent(0);
      setTicketOpen(false);
    } else {
      showToast('Error al procesar la venta', true);
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
      </div>
    );
  }

  if (!caja) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4 animate-fade-in px-4 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-bold text-mikita-chocolate">Caja Cerrada</h2>
        <p className="text-mikita-cocoa text-sm">Para empezar a vender, necesitas abrir la caja del día.</p>
        <a href="/ventas/caja" className="px-6 py-3 bg-mikita-chocolate text-mikita-cream rounded-xl font-bold hover:bg-mikita-chocolate-light transition-colors">
          Ir a Cierre de Caja
        </a>
      </div>
    );
  }

  const activeCategory = catalog?.categorias?.find(c => c.id === activeTabCat);
  const deco = catalog?.adicionales?.decoraciones || [];
  const remo = catalog?.adicionales?.remociones || [];
  const extras = catalog?.adicionales?.extras || [];

  return (
    <>
      <div className="h-full flex flex-col md:flex-row gap-4 md:gap-6 animate-fade-in">
        {/* Left Column: Menu */}
        <div className="flex-1 flex flex-col min-h-0 bg-white/40 rounded-2xl md:rounded-3xl border border-mikita-warm/30 overflow-hidden shadow-sm">
          {/* Categories Navbar */}
          <div className="flex overflow-x-auto p-3 md:p-4 gap-2 bg-white/60 border-b border-mikita-warm/40 shrink-0 scrollbar-hide">
            {catalog?.categorias?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTabCat(cat.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  activeTabCat === cat.id
                    ? 'bg-mikita-chocolate text-mikita-cream'
                    : 'bg-mikita-cream hover:bg-mikita-warm text-mikita-chocolate'
                }`}
              >
                {cat.icon} {cat.nombre}
              </button>
            ))}
            <div className="w-[1px] bg-mikita-warm mx-1 shrink-0"></div>
            <button
              onClick={() => setActiveTabCat('adicionales')}
              className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTabCat === 'adicionales'
                  ? 'bg-mikita-chocolate text-mikita-cream'
                  : 'bg-mikita-cream hover:bg-mikita-warm text-mikita-chocolate'
              }`}
            >
              ➕ Adicionales
            </button>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 content-start">
            {activeTabCat !== 'adicionales' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {activeCategory?.servicios?.map(srv => {
                  const qty = countMap[srv.id] || 0;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => addToTicket(srv, 'servicio')}
                      className={`relative p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border shadow-sm hover:shadow-md active:scale-[0.97] transition-all text-left flex flex-col h-full group ${
                        qty > 0 ? 'border-mikita-chocolate/40 bg-mikita-cream/20' : 'border-mikita-warm/40 hover:border-mikita-chocolate/30'
                      }`}
                    >
                      {qty > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-mikita-chocolate text-mikita-cream text-[10px] font-bold rounded-full flex items-center justify-center shadow-md z-10 animate-fade-in">
                          {qty}
                        </span>
                      )}
                      <p className="text-xs md:text-sm font-semibold text-mikita-chocolate leading-tight mb-2 flex-grow group-hover:text-mikita-chocolate-light line-clamp-2">
                        {srv.nombre}
                      </p>
                      <div className="flex justify-between items-end w-full mt-auto">
                        <span className="text-[9px] md:text-[10px] text-mikita-cocoa/50">⏱ {srv.duracion}</span>
                        <span className="font-bold text-xs md:text-sm text-mikita-chocolate">{formatPrice(srv.precio)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-5">
                {[{ title: 'Decoraciones', items: deco }, { title: 'Remociones', items: remo }, { title: 'Extras', items: extras }].map(sect => (
                  sect.items.length > 0 && (
                    <div key={sect.title}>
                      <h3 className="font-bold text-mikita-cocoa text-sm mb-2">{sect.title}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {sect.items.map(item => {
                          const qty = countMap[item.id] || 0;
                          return (
                            <button
                              key={item.id}
                              onClick={() => addToTicket(item, 'adicional')}
                              className={`relative p-2.5 md:p-3 rounded-xl md:rounded-2xl border active:scale-[0.97] transition-all text-left flex justify-between items-center gap-1 group ${
                                qty > 0 ? 'bg-mikita-cream border-mikita-chocolate/30' : 'bg-mikita-cream-dark/50 border-mikita-warm/40 hover:border-mikita-chocolate/30'
                              }`}
                            >
                              {qty > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-mikita-chocolate text-mikita-cream text-[9px] font-bold rounded-full flex items-center justify-center shadow-md z-10">
                                  {qty}
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-mikita-chocolate truncate">{item.nombre}</p>
                              </div>
                              <span className="font-bold text-xs md:text-sm text-mikita-chocolate shrink-0">{formatPrice(item.precio)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket — Desktop */}
        <div className="hidden md:flex w-80 lg:w-96 flex-col bg-white rounded-3xl border border-mikita-warm/40 shadow-sm overflow-hidden shrink-0">
          <TicketContent
            ticket={ticket}
            removeFromTicket={removeFromTicket}
            subtotal={subtotal}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountAmount={discountAmount}
            total={total}
            processing={processing}
            handleCobrar={handleCobrar}
          />
        </div>
      </div>

      {/* Mobile Floating Ticket Button */}
      <button
        onClick={() => setTicketOpen(true)}
        className={`md:hidden fixed bottom-20 right-4 z-40 bg-mikita-chocolate text-mikita-cream shadow-xl shadow-mikita-chocolate/30 rounded-full flex items-center gap-2 px-4 py-3 font-bold text-sm active:scale-95 transition-all ${ticket.length === 0 ? 'opacity-50' : ''}`}
      >
        🏷️ Ticket
        {ticket.length > 0 && (
          <span className="bg-mikita-cream text-mikita-chocolate text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {ticket.length}
          </span>
        )}
        {total > 0 && <span className="text-xs opacity-80">{formatPrice(total)}</span>}
      </button>

      {/* Mobile Ticket Bottom Sheet */}
      {ticketOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setTicketOpen(false)} />
          {/* Sheet */}
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up safe-area-pb">
            {/* Handle + close */}
            <div className="flex items-center justify-between p-4 border-b border-mikita-warm/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-mikita-warm rounded-full" />
                <span className="font-bold text-mikita-chocolate">Ticket Actual</span>
              </div>
              <button onClick={() => setTicketOpen(false)} className="text-mikita-cocoa p-1">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TicketContent
                ticket={ticket}
                removeFromTicket={removeFromTicket}
                subtotal={subtotal}
                discountPercent={discountPercent}
                setDiscountPercent={setDiscountPercent}
                discountAmount={discountAmount}
                total={total}
                processing={processing}
                handleCobrar={handleCobrar}
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        toast.payment ? (
          /* Big success toast for payments */
          <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:min-w-[280px] bg-white border border-green-200 rounded-2xl shadow-2xl z-[60] animate-slide-up overflow-hidden">
            <div className="bg-green-500 px-5 py-2 flex items-center gap-2">
              <span className="text-white text-sm font-bold">
                {toast.payment.metodo === 'efectivo' ? '💵 Cobrado en Efectivo' : '📱 Cobrado Digital'}
              </span>
            </div>
            <div className="px-5 py-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-mikita-cocoa/60 uppercase tracking-wider">Total cobrado</p>
                <p className="text-2xl font-bold text-mikita-chocolate">{formatPrice(toast.payment.total)}</p>
                <p className="text-[11px] text-mikita-cocoa/50">{toast.payment.count} servicio{toast.payment.count !== 1 ? 's' : ''}</p>
              </div>
              <span className="text-4xl">{toast.payment.metodo === 'efectivo' ? '✅' : '📲'}</span>
            </div>
          </div>
        ) : (
          <div className={`fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto px-5 py-3 rounded-2xl text-sm font-medium shadow-xl z-[60] animate-fade-in text-center
            ${toast.isError ? 'bg-mikita-danger text-white' : 'bg-mikita-success-dark text-white'}`}>
            {toast.msg}
          </div>
        )
      )}
    </>
  );
}

/* ── Extracted Ticket Content (shared between desktop sidebar and mobile bottom sheet) ── */
function TicketContent({ ticket, removeFromTicket, subtotal, discountPercent, setDiscountPercent, discountAmount, total, processing, handleCobrar }) {
  return (
    <>
      <div className="hidden md:block p-4 bg-mikita-chocolate text-mikita-cream text-center font-bold">
        Ticket Actual
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-mikita-cream/20 min-h-[80px]">
        {ticket.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <span className="text-3xl mb-2">🏷️</span>
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
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-mikita-chocolate text-xs md:text-sm">{formatPrice(item.precio)}</span>
                <button 
                  onClick={() => removeFromTicket(item._uid)}
                  className="text-mikita-danger/50 hover:text-mikita-danger p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Controls */}
      <div className="p-4 bg-white border-t border-mikita-warm/40 space-y-3">
        <div className="space-y-2 border-b border-mikita-warm/20 pb-3">
          <div className="flex justify-between text-sm text-mikita-cocoa">
            <p>Subtotal</p>
            <p>{formatPrice(subtotal)}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="text-sm text-mikita-cocoa">Descuento (%)</label>
            <div className="flex items-center gap-2">
              {discountAmount > 0 && <span className="text-xs text-mikita-success-dark font-medium">- {formatPrice(discountAmount)}</span>}
              <input 
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-14 text-right bg-mikita-cream px-2 py-1.5 rounded border border-transparent focus:border-mikita-warm/50 focus:outline-none text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <p className="text-sm font-bold text-mikita-cocoa uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-mikita-chocolate">{formatPrice(total)}</p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            disabled={ticket.length === 0 || processing}
            onClick={() => handleCobrar('efectivo')}
            className="flex-1 py-3 bg-mikita-success/10 text-mikita-success-dark font-bold rounded-xl hover:bg-mikita-success hover:text-white active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            Efectivo 💵
          </button>
          <button
            disabled={ticket.length === 0 || processing}
            onClick={() => handleCobrar('digital')}
            className="flex-1 py-3 bg-blue-500/10 text-blue-700 font-bold rounded-xl hover:bg-blue-500 hover:text-white active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            Digital 📱
          </button>
        </div>
      </div>
    </>
  );
}
