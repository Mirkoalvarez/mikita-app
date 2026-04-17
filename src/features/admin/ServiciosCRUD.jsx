'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/shared/lib/formatters';
import {
  fetchCategorias, insertCategoria, upsertCategoria, deleteCategoria,
  fetchServicios, insertServicio, upsertServicio, deleteServicio,
} from '@/shared/lib/supabase';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

function ServiceRow({ srv, editing, onEdit, onCancel, onSave, onDelete, index, total, onMove }) {
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
    <div className="flex items-center gap-2 group p-1 -mx-1 hover:bg-white/50 rounded-lg transition-colors">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {index > 0 && <button onClick={() => onMove(-1)} className="text-mikita-cocoa/40 hover:text-mikita-cocoa leading-none px-1 text-xs">▲</button>}
          {index < total - 1 && <button onClick={() => onMove(1)} className="text-mikita-cocoa/40 hover:text-mikita-cocoa leading-none px-1 text-xs">▼</button>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-mikita-chocolate/80 leading-tight truncate">{srv.nombre}</p>
          <p className="text-[10px] text-mikita-cocoa/50">⏱ {srv.duracion}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-mikita-chocolate whitespace-nowrap shrink-0">{formatPrice(srv.precio)}</span>
      <button onClick={onEdit} className="shrink-0 opacity-0 group-hover:opacity-100 text-mikita-cocoa/40 hover:text-mikita-cocoa text-xs px-1 transition-all">✎</button>
      <button onClick={() => onDelete(srv.id, srv.nombre)} className="shrink-0 opacity-0 group-hover:opacity-100 text-mikita-danger/40 hover:text-mikita-danger text-xs px-1 transition-all">✕</button>
    </div>
  );
}

export default function ServiciosCRUD({ showToast }) {
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showNewService, setShowNewService] = useState(null);
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
    const { categorias, ...payload } = srv;
    const result = await upsertServicio(payload);
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

  const handleMoveCat = async (index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === categorias.length - 1) return;
    const sorted = [...categorias].map((c, i) => ({ ...c, orden: i }));
    const temp = sorted[index].orden;
    sorted[index].orden = sorted[index + dir].orden;
    sorted[index + dir].orden = temp;
    setLoading(true);
    await upsertCategoria(sorted[index]);
    await upsertCategoria(sorted[index + dir]);
    reload();
  };

  const handleMoveService = async (catServices, index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === catServices.length - 1) return;
    const sorted = [...catServices].map((s, i) => ({ ...s, orden: i }));
    const temp = sorted[index].orden;
    sorted[index].orden = sorted[index + dir].orden;
    sorted[index + dir].orden = temp;
    setLoading(true);
    const srv1 = { ...sorted[index] }; delete srv1.categorias;
    const srv2 = { ...sorted[index + dir] }; delete srv2.categorias;
    await upsertServicio(srv1);
    await upsertServicio(srv2);
    reload();
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

      {categorias.map((cat, index) => {
        const catServices = servicios.filter(s => s.categoria_id === cat.id);
        return (
          <div key={cat.id} className="bg-white/70 rounded-2xl border border-mikita-warm/30 overflow-hidden">
            <div className="flex items-center justify-between p-4 min-h-[44px]">
              <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} className="flex-1 flex items-center gap-2 text-left">
                <span className="text-base">{cat.icon}</span>
                <span className="font-semibold text-sm text-mikita-chocolate">{cat.nombre}</span>
                <span className="text-[10px] text-mikita-cocoa/50 bg-mikita-cream-dark px-1.5 py-0.5 rounded-full">{catServices.length}</span>
              </button>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button onClick={() => handleMoveCat(index, -1)} className="text-mikita-cocoa/40 hover:text-mikita-cocoa text-lg px-2 transition-colors">↑</button>
                )}
                {index < categorias.length - 1 && (
                  <button onClick={() => handleMoveCat(index, 1)} className="text-mikita-cocoa/40 hover:text-mikita-cocoa text-lg px-2 transition-colors">↓</button>
                )}
                <button onClick={() => handleDeleteCat(cat.id, cat.nombre)}
                  className="text-mikita-danger/40 hover:text-mikita-danger text-xs px-2 py-1 transition-colors">✕</button>
                <span className={`text-mikita-cocoa transition-transform text-sm ${expandedCat === cat.id ? 'rotate-180' : ''}`}>▾</span>
              </div>
            </div>

            {expandedCat === cat.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-mikita-warm/20 pt-3">
                {catServices.map((srv, idx) => (
                  <ServiceRow key={srv.id} srv={srv} editing={editingId === srv.id}
                    onEdit={() => setEditingId(srv.id)} onCancel={() => setEditingId(null)}
                    onSave={handleSaveService} onDelete={handleDeleteService}
                    index={idx} total={catServices.length} onMove={(dir) => handleMoveService(catServices, idx, dir)} />
                ))}

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
