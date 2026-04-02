'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/formatters';
import { getQuoteHistory, getCustomPrices, saveCustomPrices, getInventory, saveInventory } from '@/lib/storage';
import defaultData from '@/data/services.json';

export default function AdminPage() {
  const [tab, setTab] = useState('precios');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const tabs = [
    { id: 'precios', label: '💰 Precios', icon: '💰' },
    { id: 'historial', label: '📋 Historial', icon: '📋' },
    { id: 'inventario', label: '📦 Inventario', icon: '📦' },
  ];

  return (
    <main className="max-w-lg mx-auto pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-mikita-cream pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-mikita-chocolate">Panel de gestión</h1>
            <p className="text-xs text-mikita-cocoa/60">Mikita Nail Bar</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-mikita-chocolate text-mikita-cream text-sm font-medium hover:bg-mikita-chocolate-light transition-colors min-h-[44px] flex items-center"
          >
            ← Cotizador
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]
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
        {tab === 'precios' && <PriceEditor showToast={showToast} />}
        {tab === 'historial' && <QuoteHistory />}
        {tab === 'inventario' && <InventoryManager showToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast px-5 py-3 rounded-2xl bg-mikita-chocolate text-mikita-cream text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

/* ─── PRICE EDITOR ─── */
function PriceEditor({ showToast }) {
  const [prices, setPrices] = useState({});
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    const custom = getCustomPrices();
    setPrices(custom);
  }, []);

  const getPrice = (serviceId, defaultPrice) => {
    return prices[serviceId] !== undefined ? prices[serviceId] : defaultPrice;
  };

  const updatePrice = (serviceId, value) => {
    const num = parseInt(value) || 0;
    const updated = { ...prices, [serviceId]: num };
    setPrices(updated);
    saveCustomPrices(updated);
  };

  const allCategories = [
    ...defaultData.categorias,
    {
      id: 'adicionales-deco',
      nombre: 'Decoraciones',
      icon: '🎨',
      servicios: defaultData.adicionales.decoraciones.map(d => ({ ...d, precio: d.precio })),
    },
    {
      id: 'adicionales-remo',
      nombre: 'Remociones',
      icon: '🧼',
      servicios: defaultData.adicionales.remociones,
    },
    {
      id: 'adicionales-extras',
      nombre: 'Extras',
      icon: '✨',
      servicios: defaultData.adicionales.extras,
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs text-mikita-cocoa/70">
        Editá los precios. Los cambios se guardan automáticamente en el dispositivo.
      </p>
      {allCategories.map(cat => (
        <div key={cat.id} className="bg-white/70 rounded-2xl border border-mikita-warm/30 overflow-hidden">
          <button
            onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
            className="w-full flex items-center justify-between p-4 min-h-[44px]"
          >
            <span className="font-semibold text-sm text-mikita-chocolate">
              {cat.icon} {cat.nombre}
            </span>
            <span className={`text-mikita-cocoa transition-transform ${expandedCat === cat.id ? 'rotate-180' : ''}`}>
              ▾
            </span>
          </button>
          {expandedCat === cat.id && (
            <div className="px-4 pb-4 space-y-2 border-t border-mikita-warm/20 pt-3 stagger-children">
              {cat.servicios.map(srv => (
                <div key={srv.id} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-mikita-chocolate/80 leading-tight">{srv.nombre}</span>
                  <div className="relative flex items-center">
                    <span className="text-xs text-mikita-cocoa mr-1">$</span>
                    <input
                      type="number"
                      value={getPrice(srv.id, srv.precio)}
                      onChange={e => updatePrice(srv.id, e.target.value)}
                      className="w-24 text-right px-2 py-1.5 rounded-lg bg-mikita-cream border border-mikita-warm/40 text-sm text-mikita-chocolate font-semibold focus:outline-none focus:border-mikita-cocoa"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => {
          setPrices({});
          saveCustomPrices({});
          showToast('Precios restaurados a los originales ✓');
        }}
        className="w-full py-3 rounded-xl border border-mikita-danger/30 text-mikita-danger text-sm font-medium hover:bg-mikita-danger/5 transition-colors min-h-[44px]"
      >
        Restaurar precios originales
      </button>
    </div>
  );
}

/* ─── QUOTE HISTORY ─── */
function QuoteHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getQuoteHistory());
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm text-mikita-cocoa/60">No hay presupuestos enviados todavía</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs text-mikita-cocoa/70">{history.length} presupuesto(s) guardados</p>
      {history.map((q, i) => (
        <div key={q.id || i} className="bg-white/70 rounded-2xl p-4 border border-mikita-warm/30">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-sm text-mikita-chocolate">{q.clientName}</p>
              <p className="text-xs text-mikita-cocoa/60">{q.servicio}</p>
            </div>
            <span className="font-bold text-mikita-chocolate">{formatPrice(q.total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-mikita-cocoa/40">
              {q.fecha ? new Date(q.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
            </span>
            {q.phone && q.phone !== 'N/A' && (
              <span className="text-[10px] text-mikita-cocoa/40">📱 {q.phone}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── INVENTORY MANAGER ─── */
function InventoryManager({ showToast }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ item: '', stock: '', costo: '' });

  useEffect(() => {
    setItems(getInventory());
  }, []);

  const addItem = () => {
    if (!newItem.item.trim()) return;
    const updated = [
      ...items,
      {
        id: Date.now(),
        item: newItem.item,
        stock_actual: parseInt(newItem.stock) || 0,
        costo_insumo: parseInt(newItem.costo) || 0,
      },
    ];
    setItems(updated);
    saveInventory(updated);
    setNewItem({ item: '', stock: '', costo: '' });
    showToast('Insumo agregado ✓');
  };

  const removeItem = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveInventory(updated);
    showToast('Insumo eliminado ✓');
  };

  const updateStock = (id, field, value) => {
    const updated = items.map(i =>
      i.id === id ? { ...i, [field]: parseInt(value) || 0 } : i
    );
    setItems(updated);
    saveInventory(updated);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-mikita-cocoa/70">Cargá tus insumos y controlá el stock.</p>

      {/* Add new */}
      <div className="bg-white/70 rounded-2xl p-4 border border-mikita-warm/30 space-y-3">
        <p className="text-xs font-medium text-mikita-cocoa">Agregar insumo</p>
        <input
          type="text"
          value={newItem.item}
          onChange={e => setNewItem({ ...newItem, item: e.target.value })}
          placeholder="Nombre del insumo"
          className="w-full px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={newItem.stock}
            onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
            placeholder="Stock"
            className="flex-1 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]"
          />
          <input
            type="number"
            value={newItem.costo}
            onChange={e => setNewItem({ ...newItem, costo: e.target.value })}
            placeholder="Costo ($)"
            className="flex-1 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]"
          />
        </div>
        <button
          onClick={addItem}
          className="w-full py-3 rounded-xl bg-mikita-chocolate text-mikita-cream font-medium text-sm hover:bg-mikita-chocolate-light transition-colors min-h-[44px]"
        >
          + Agregar
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-sm text-mikita-cocoa/60">No hay insumos cargados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white/70 rounded-2xl p-3 border border-mikita-warm/30">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-mikita-chocolate">{item.item}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-mikita-danger/50 hover:text-mikita-danger text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-mikita-cocoa/50 uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    value={item.stock_actual}
                    onChange={e => updateStock(item.id, 'stock_actual', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-mikita-cream border border-mikita-warm/30 text-sm text-center font-semibold focus:outline-none focus:border-mikita-cocoa"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-mikita-cocoa/50 uppercase tracking-wider">Costo</label>
                  <input
                    type="number"
                    value={item.costo_insumo}
                    onChange={e => updateStock(item.id, 'costo_insumo', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-mikita-cream border border-mikita-warm/30 text-sm text-center font-semibold focus:outline-none focus:border-mikita-cocoa"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
