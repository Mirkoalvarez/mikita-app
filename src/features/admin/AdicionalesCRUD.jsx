'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/shared/lib/formatters';
import {
  fetchDecoraciones, insertDecoracion, upsertDecoracion, deleteDecoracion,
  fetchRemociones, insertRemocion, upsertRemocion, deleteRemocion,
  fetchExtras, insertExtra, upsertExtra, deleteExtra,
} from '@/shared/lib/supabase';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

/* ─── Generic Row ─── */
function GenericRow({ item, fields, editing, onEdit, onCancel, onSave, onDelete }) {
  const [values, setValues] = useState({ ...item });

  if (editing) {
    return (
      <div className="bg-mikita-cream/80 rounded-xl p-3 space-y-2 border border-mikita-cocoa/20 animate-fade-in">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-[10px] text-mikita-cocoa/50 uppercase">{f.label}</label>
            {f.type === 'select' ? (
              <select value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa">
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type} value={values[f.key]} min={f.type === 'number' ? '0' : undefined}
                onChange={e => setValues({ ...values, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => onSave(values)} className="flex-1 py-1.5 rounded-lg bg-mikita-success text-white text-xs font-medium">Guardar</button>
          <button onClick={onCancel} className="px-3 py-1.5 text-mikita-cocoa text-xs">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-mikita-warm/30 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-mikita-chocolate truncate">{item.nombre}</p>
        {item.tipo && <p className="text-[10px] text-mikita-cocoa/50">{item.tipo}</p>}
      </div>
      <span className="text-sm font-bold text-mikita-chocolate">{formatPrice(item.precio)}</span>
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 text-mikita-cocoa/40 hover:text-mikita-cocoa text-xs px-1 transition-all">✎</button>
      <button onClick={() => onDelete(item.id, item.nombre)} className="opacity-0 group-hover:opacity-100 text-mikita-danger/40 hover:text-mikita-danger text-xs px-1 transition-all">✕</button>
    </div>
  );
}

/* ─── Generic CRUD ─── */
function GenericCRUD({ items, showToast, reload, insertFn, upsertFn, deleteFn, fields }) {
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const emptyItem = {};
  fields.forEach(f => { emptyItem[f.key] = f.type === 'number' ? 0 : ''; });
  const [newItem, setNewItem] = useState(emptyItem);

  const handleAdd = async () => {
    if (!newItem.nombre?.trim()) return;
    const result = await insertFn(newItem);
    if (result) { showToast('Creado ✓'); setNewItem(emptyItem); setShowNew(false); reload(); }
    else showToast('Error al crear', 'error');
  };

  const handleSave = async (item) => {
    const result = await upsertFn(item);
    if (result) { showToast('Guardado ✓'); setEditingId(null); reload(); }
    else showToast('Error al guardar', 'error');
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const ok = await deleteFn(id);
    if (ok) { showToast('Eliminado ✓'); reload(); }
    else showToast('Error al eliminar', 'error');
  };

  return (
    <div className="space-y-2">
      {items.map(item => (
        <GenericRow key={item.id} item={item} fields={fields} editing={editingId === item.id}
          onEdit={() => setEditingId(item.id)} onCancel={() => setEditingId(null)}
          onSave={handleSave} onDelete={handleDelete} />
      ))}

      {showNew ? (
        <div className="bg-mikita-cream/80 rounded-xl p-3 space-y-2 border border-dashed border-mikita-cocoa/20 animate-fade-in">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-[10px] text-mikita-cocoa/50 uppercase">{f.label}</label>
              {f.type === 'select' ? (
                <select value={newItem[f.key] || ''} onChange={e => setNewItem({ ...newItem, [f.key]: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa">
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={newItem[f.key]} min={f.type === 'number' ? '0' : undefined}
                  onChange={e => setNewItem({ ...newItem, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                  className="w-full px-2 py-2 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-mikita-chocolate text-mikita-cream text-xs font-medium">Crear</button>
            <button onClick={() => setShowNew(false)} className="px-3 py-2 text-mikita-cocoa text-xs">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-mikita-cocoa/20 text-mikita-cocoa/50 text-xs hover:bg-mikita-cream-dark hover:text-mikita-cocoa transition-all">
          + Agregar
        </button>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdicionalesCRUD({ showToast }) {
  const [decoraciones, setDecoraciones] = useState([]);
  const [remociones, setRemociones] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('deco');

  const reload = useCallback(async () => {
    setLoading(true);
    const [d, r, e] = await Promise.all([fetchDecoraciones(), fetchRemociones(), fetchExtras()]);
    if (d) setDecoraciones(d);
    if (r) setRemociones(r);
    if (e) setExtras(e);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-2">
        {[
          { id: 'deco', label: '🎨 Decoraciones' },
          { id: 'remo', label: '🧼 Remociones' },
          { id: 'extras', label: '✨ Extras' },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
              ${section === s.id ? 'bg-mikita-chocolate text-mikita-cream' : 'bg-mikita-cream-dark text-mikita-chocolate'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'deco' && (
        <GenericCRUD items={decoraciones} showToast={showToast} reload={reload}
          insertFn={insertDecoracion} upsertFn={upsertDecoracion} deleteFn={deleteDecoracion}
          fields={[
            { key: 'nombre', label: 'Nombre', type: 'text' },
            { key: 'precio', label: 'Precio', type: 'number' },
            { key: 'tipo', label: 'Tipo', type: 'select', options: ['por_uña', 'por_par', 'full'] },
          ]} />
      )}
      {section === 'remo' && (
        <GenericCRUD items={remociones} showToast={showToast} reload={reload}
          insertFn={insertRemocion} upsertFn={upsertRemocion} deleteFn={deleteRemocion}
          fields={[
            { key: 'nombre', label: 'Nombre', type: 'text' },
            { key: 'precio', label: 'Precio', type: 'number' },
          ]} />
      )}
      {section === 'extras' && (
        <GenericCRUD items={extras} showToast={showToast} reload={reload}
          insertFn={insertExtra} upsertFn={upsertExtra} deleteFn={deleteExtra}
          fields={[
            { key: 'nombre', label: 'Nombre', type: 'text' },
            { key: 'precio', label: 'Precio', type: 'number' },
          ]} />
      )}
    </div>
  );
}
