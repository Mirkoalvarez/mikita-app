'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/shared/lib/formatters';
import { fetchInventario, insertInventario, upsertInventario, deleteInventario } from '@/shared/lib/supabase';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function InventarioManager({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ item: '', stock_actual: '', costo_insumo: '' });

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchInventario();
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const addItem = async () => {
    if (!newItem.item.trim()) return;
    const result = await insertInventario({
      item: newItem.item,
      stock_actual: Math.max(0, parseInt(newItem.stock_actual) || 0),
      costo_insumo: Math.max(0, parseInt(newItem.costo_insumo) || 0),
    });
    if (result) {
      showToast('Insumo agregado ✓');
      setNewItem({ item: '', stock_actual: '', costo_insumo: '' });
      reload();
    } else showToast('Error al agregar', 'error');
  };

  const removeItem = async (id) => {
    const ok = await deleteInventario(id);
    if (ok) { showToast('Insumo eliminado ✓'); reload(); }
    else showToast('Error al eliminar', 'error');
  };

  const updateField = async (item, field, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    const updated = { ...item, [field]: num };
    await upsertInventario(updated);
    reload();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-mikita-cocoa/70">Cargá tus insumos y controlá el stock.</p>

      <div className="bg-white/70 rounded-2xl p-4 border border-mikita-warm/30 space-y-3">
        <p className="text-xs font-medium text-mikita-cocoa">Agregar insumo</p>
        <input type="text" value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })}
          placeholder="Nombre del insumo"
          className="w-full px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]" />
        <div className="flex gap-2">
          <input type="number" min="0" value={newItem.stock_actual}
            onChange={e => setNewItem({ ...newItem, stock_actual: e.target.value })}
            placeholder="Stock"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]" />
          <input type="number" min="0" value={newItem.costo_insumo}
            onChange={e => setNewItem({ ...newItem, costo_insumo: e.target.value })}
            placeholder="Costo ($)"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]" />
        </div>
        <button onClick={addItem}
          className="w-full py-3 rounded-xl bg-mikita-chocolate text-mikita-cream font-medium text-sm hover:bg-mikita-chocolate-light transition-colors min-h-[44px]">
          + Agregar
        </button>
      </div>

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
                <button onClick={() => removeItem(item.id)}
                  className="text-mikita-danger/50 hover:text-mikita-danger text-xs px-2 py-1">✕</button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-mikita-cocoa/50 uppercase tracking-wider">Stock</label>
                  <input type="number" min="0" value={item.stock_actual}
                    onChange={e => updateField(item, 'stock_actual', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-mikita-cream border border-mikita-warm/30 text-sm text-center font-semibold focus:outline-none focus:border-mikita-cocoa" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-mikita-cocoa/50 uppercase tracking-wider">Costo</label>
                  <input type="number" min="0" value={item.costo_insumo}
                    onChange={e => updateField(item, 'costo_insumo', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-mikita-cream border border-mikita-warm/30 text-sm text-center font-semibold focus:outline-none focus:border-mikita-cocoa" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
