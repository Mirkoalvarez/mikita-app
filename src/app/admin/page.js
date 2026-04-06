'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/formatters';
import { getQuoteHistory } from '@/lib/storage';
import {
  fetchCategorias, insertCategoria, upsertCategoria, deleteCategoria,
  fetchServicios, insertServicio, upsertServicio, deleteServicio,
  fetchDecoraciones, insertDecoracion, upsertDecoracion, deleteDecoracion,
  fetchRemociones, insertRemocion, upsertRemocion, deleteRemocion,
  fetchExtras, insertExtra, upsertExtra, deleteExtra,
  fetchInventario, insertInventario, upsertInventario, deleteInventario,
} from '@/lib/supabase';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Check if already authenticated this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mikita_admin_auth');
      if (saved === 'true') setAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      sessionStorage.setItem('mikita_admin_auth', 'true');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  if (!authenticated) {
    return (
      <main className="max-w-sm mx-auto px-4 min-h-dvh flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-mikita-chocolate">Mikita</h1>
          <p className="text-mikita-cocoa font-[var(--font-dancing)]">Nail Bar</p>
        </div>
        <form onSubmit={handlePinSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-xs text-mikita-cocoa/70 mb-1 font-medium">PIN de acceso</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className={`w-full px-4 py-4 rounded-2xl bg-white/80 border-2 text-mikita-chocolate text-center text-2xl tracking-[0.5em] placeholder:tracking-[0.3em] placeholder:text-mikita-cocoa/20 focus:outline-none transition-all min-h-[56px]
                ${pinError ? 'border-mikita-danger animate-[shake_0.3s]' : 'border-mikita-warm/40 focus:border-mikita-cocoa'}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-mikita-chocolate text-mikita-cream font-bold text-base hover:bg-mikita-chocolate-light active:scale-[0.98] transition-all min-h-[52px]"
          >
            Ingresar
          </button>
          {pinError && (
            <p className="text-center text-sm text-mikita-danger animate-fade-in">PIN incorrecto</p>
          )}
        </form>
        <a href="/" className="mt-8 text-xs text-mikita-cocoa/40 hover:text-mikita-cocoa transition-colors">
          ← Volver al cotizador
        </a>
      </main>
    );
  }

  return <AdminDashboard />;
}

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD (after PIN gate)
   ═══════════════════════════════════════════════ */

function AdminDashboard() {
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
  ];

  return (
    <main className="max-w-lg mx-auto pb-12">
      <div className="sticky top-0 z-40 bg-mikita-cream pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-mikita-chocolate">Panel de gestión</h1>
            <p className="text-xs text-mikita-cocoa/60">Mikita Nail Bar</p>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl bg-mikita-chocolate text-mikita-cream text-sm font-medium hover:bg-mikita-chocolate-light transition-colors min-h-[44px] flex items-center">
            ← Cotizador
          </a>
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

/* ─── SERVICIOS CRUD ─── */
function ServiciosCRUD({ showToast }) {
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showNewService, setShowNewService] = useState(null); // categoryId
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCat, setNewCat] = useState({ nombre: '', icon: '💅' });
  const [newSrv, setNewSrv] = useState({ nombre: '', precio: '', duracion: '30 min' });

  const reload = useCallback(async () => {
    setLoading(true);
    const [cats, srvs] = await Promise.all([fetchCategorias(), fetchServicios()]);
    if (cats) setCategorias(cats);
    if (srvs) setServicios(srvs);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleSaveService = async (srv) => {
    const result = await upsertServicio(srv);
    if (result) { showToast('Servicio guardado ✓'); reload(); setEditingId(null); }
    else showToast('Error al guardar', 'error');
  };

  const handleDeleteService = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const ok = await deleteServicio(id);
    if (ok) { showToast('Servicio eliminado ✓'); reload(); }
    else showToast('Error al eliminar', 'error');
  };

  const handleAddService = async (catId) => {
    if (!newSrv.nombre.trim()) return;
    const result = await insertServicio({
      categoria_id: catId,
      nombre: newSrv.nombre,
      precio: parseInt(newSrv.precio) || 0,
      duracion: newSrv.duracion || '30 min',
    });
    if (result) {
      showToast('Servicio creado ✓');
      setNewSrv({ nombre: '', precio: '', duracion: '30 min' });
      setShowNewService(null);
      reload();
    } else showToast('Error al crear', 'error');
  };

  const handleAddCat = async () => {
    if (!newCat.nombre.trim()) return;
    const result = await insertCategoria({ nombre: newCat.nombre, icon: newCat.icon, orden: categorias.length });
    if (result) {
      showToast('Categoría creada ✓');
      setNewCat({ nombre: '', icon: '💅' });
      setShowNewCat(false);
      reload();
    } else showToast('Error al crear categoría', 'error');
  };

  const handleDeleteCat = async (id, nombre) => {
    if (!confirm(`¿Eliminar categoría "${nombre}" y todos sus servicios?`)) return;
    const ok = await deleteCategoria(id);
    if (ok) { showToast('Categoría eliminada ✓'); reload(); }
    else showToast('Error al eliminar', 'error');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-xs text-mikita-cocoa/70">
          {categorias.length} categorías · {servicios.length} servicios
        </p>
        <button onClick={() => setShowNewCat(true)}
          className="text-xs px-3 py-1.5 rounded-lg bg-mikita-chocolate text-mikita-cream font-medium hover:bg-mikita-chocolate-light transition-colors">
          + Categoría
        </button>
      </div>

      {/* New Category Form */}
      {showNewCat && (
        <div className="bg-mikita-chocolate/5 rounded-2xl p-4 border border-mikita-chocolate/20 space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-mikita-chocolate">Nueva categoría</p>
          <div className="flex gap-2">
            <input value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })}
              className="w-14 px-2 py-2 rounded-xl bg-white border border-mikita-warm/40 text-center text-lg focus:outline-none focus:border-mikita-cocoa" maxLength={4} />
            <input value={newCat.nombre} onChange={e => setNewCat({ ...newCat, nombre: e.target.value })}
              placeholder="Nombre de categoría" className="flex-1 px-3 py-2 rounded-xl bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddCat} className="flex-1 py-2.5 rounded-xl bg-mikita-chocolate text-mikita-cream text-sm font-medium">Crear</button>
            <button onClick={() => setShowNewCat(false)} className="px-4 py-2.5 rounded-xl text-mikita-cocoa text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Categories with services */}
      {categorias.map(cat => {
        const catServices = servicios.filter(s => s.categoria_id === cat.id);
        return (
          <div key={cat.id} className="bg-white/70 rounded-2xl border border-mikita-warm/30 overflow-hidden">
            <div className="flex items-center justify-between p-4 min-h-[44px]">
              <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} className="flex-1 flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="font-semibold text-sm text-mikita-chocolate">{cat.nombre}</span>
                <span className="text-[10px] text-mikita-cocoa/50 bg-mikita-cream-dark px-1.5 py-0.5 rounded-full">{catServices.length}</span>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => handleDeleteCat(cat.id, cat.nombre)}
                  className="text-mikita-danger/40 hover:text-mikita-danger text-xs px-2 py-1 transition-colors">✕</button>
                <span className={`text-mikita-cocoa transition-transform text-sm ${expandedCat === cat.id ? 'rotate-180' : ''}`}>▾</span>
              </div>
            </div>

            {expandedCat === cat.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-mikita-warm/20 pt-3">
                {catServices.map(srv => (
                  <ServiceRow key={srv.id} srv={srv} editing={editingId === srv.id}
                    onEdit={() => setEditingId(srv.id)} onCancel={() => setEditingId(null)}
                    onSave={handleSaveService} onDelete={handleDeleteService} />
                ))}

                {/* Add new service */}
                {showNewService === cat.id ? (
                  <div className="bg-mikita-cream/80 rounded-xl p-3 space-y-2 border border-dashed border-mikita-cocoa/20 animate-fade-in">
                    <input value={newSrv.nombre} onChange={e => setNewSrv({ ...newSrv, nombre: e.target.value })}
                      placeholder="Nombre del servicio" className="w-full px-3 py-2 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
                    <div className="flex gap-2">
                      <div className="flex items-center flex-1">
                        <span className="text-xs text-mikita-cocoa mr-1">$</span>
                        <input type="number" value={newSrv.precio} onChange={e => setNewSrv({ ...newSrv, precio: e.target.value })}
                          placeholder="Precio" min="0" className="w-full px-2 py-2 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
                      </div>
                      <input value={newSrv.duracion} onChange={e => setNewSrv({ ...newSrv, duracion: e.target.value })}
                        placeholder="Duración" className="w-28 px-2 py-2 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddService(cat.id)} className="flex-1 py-2 rounded-lg bg-mikita-chocolate text-mikita-cream text-xs font-medium">Crear servicio</button>
                      <button onClick={() => setShowNewService(null)} className="px-3 py-2 text-mikita-cocoa text-xs">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewService(cat.id)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-mikita-cocoa/20 text-mikita-cocoa/50 text-xs hover:bg-mikita-cream-dark hover:text-mikita-cocoa transition-all">
                    + Agregar servicio
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── SERVICE ROW (inline edit) ─── */
function ServiceRow({ srv, editing, onEdit, onCancel, onSave, onDelete }) {
  const [nombre, setNombre] = useState(srv.nombre);
  const [precio, setPrecio] = useState(srv.precio);
  const [duracion, setDuracion] = useState(srv.duracion);

  if (editing) {
    return (
      <div className="bg-mikita-cream/80 rounded-xl p-3 space-y-2 border border-mikita-cocoa/20 animate-fade-in">
        <input value={nombre} onChange={e => setNombre(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
        <div className="flex gap-2">
          <div className="flex items-center flex-1">
            <span className="text-xs text-mikita-cocoa mr-1">$</span>
            <input type="number" value={precio} onChange={e => setPrecio(parseInt(e.target.value) || 0)} min="0"
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-mikita-warm/40 text-sm font-semibold focus:outline-none focus:border-mikita-cocoa" />
          </div>
          <input value={duracion} onChange={e => setDuracion(e.target.value)}
            className="w-24 px-2 py-1.5 rounded-lg bg-white border border-mikita-warm/40 text-sm focus:outline-none focus:border-mikita-cocoa" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave({ ...srv, nombre, precio, duracion })}
            className="flex-1 py-1.5 rounded-lg bg-mikita-success text-white text-xs font-medium">Guardar</button>
          <button onClick={onCancel} className="px-3 py-1.5 text-mikita-cocoa text-xs">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-mikita-chocolate/80 leading-tight truncate">{srv.nombre}</p>
        <p className="text-[10px] text-mikita-cocoa/50">⏱ {srv.duracion}</p>
      </div>
      <span className="text-sm font-semibold text-mikita-chocolate whitespace-nowrap">{formatPrice(srv.precio)}</span>
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 text-mikita-cocoa/40 hover:text-mikita-cocoa text-xs px-1 transition-all">✎</button>
      <button onClick={() => onDelete(srv.id, srv.nombre)} className="opacity-0 group-hover:opacity-100 text-mikita-danger/40 hover:text-mikita-danger text-xs px-1 transition-all">✕</button>
    </div>
  );
}

/* ─── ADICIONALES CRUD (deco, remo, extras) ─── */
function AdicionalesCRUD({ showToast }) {
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
      {/* Sub-tabs */}
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

/* ─── GENERIC CRUD for adicionales ─── */
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

/* ─── QUOTE HISTORY ─── */
function QuoteHistory() {
  const [history, setHistory] = useState([]);
  useEffect(() => { setHistory(getQuoteHistory()); }, []);

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
            {q.phone && q.phone !== 'N/A' && <span className="text-[10px] text-mikita-cocoa/40">📱 {q.phone}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── INVENTARIO MANAGER (Supabase + min=0 fix) ─── */
function InventarioManager({ showToast }) {
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
            className="flex-1 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]" />
          <input type="number" min="0" value={newItem.costo_insumo}
            onChange={e => setNewItem({ ...newItem, costo_insumo: e.target.value })}
            placeholder="Costo ($)"
            className="flex-1 px-3 py-2.5 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa min-h-[44px]" />
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

/* ─── LOADING SPINNER ─── */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
    </div>
  );
}
