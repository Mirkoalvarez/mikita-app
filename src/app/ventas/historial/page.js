'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHistorialCajas, anularVenta, agregarVentaACaja, eliminarCaja } from '@/lib/pos';
import { formatPrice } from '@/lib/formatters';
import { exportCajaToExcel, exportMesCompleto } from '@/lib/excel';

export default function HistorialPage() {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [mesFilter, setMesFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Mini-form state for adding a venta to a closed caja
  const [addingToCaja, setAddingToCaja] = useState(null);
  const [newVenta, setNewVenta] = useState({ descripcion: '', monto_total: '', metodo_pago: 'efectivo' });

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getHistorialCajas(60);
    setCajas(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build month options from data
  const monthOptions = (() => {
    const set = new Set();
    cajas.forEach(c => {
      if (c.fecha_apertura) {
        const d = new Date(c.fecha_apertura);
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(set).sort().reverse();
  })();

  const filteredCajas = mesFilter === 'all'
    ? cajas
    : cajas.filter(c => {
        if (!c.fecha_apertura) return false;
        const d = new Date(c.fecha_apertura);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === mesFilter;
      });

  const formatFecha = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const mesLabel = (key) => {
    if (key === 'all') return 'Todos';
    const [y, m] = key.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

  // Actions
  const handleAnular = async (ventaId) => {
    if (!confirm('¿Anular esta venta?')) return;
    setProcessing(true);
    const ok = await anularVenta(ventaId);
    if (ok) { showToast('Venta anulada ✓'); await load(); }
    else showToast('Error al anular', true);
    setProcessing(false);
  };

  const handleAgregarVenta = async (cajaId) => {
    if (!newVenta.descripcion.trim() || !newVenta.monto_total) return;
    setProcessing(true);
    const result = await agregarVentaACaja(cajaId, {
      monto_total: parseInt(newVenta.monto_total) || 0,
      metodo_pago: newVenta.metodo_pago,
      descripcion: newVenta.descripcion,
    });
    if (result) {
      showToast('Venta agregada ✓');
      setAddingToCaja(null);
      setNewVenta({ descripcion: '', monto_total: '', metodo_pago: 'efectivo' });
      await load();
    } else {
      showToast('Error al agregar venta', true);
    }
    setProcessing(false);
  };

  const handleEliminarCaja = async (cajaId) => {
    if (!confirm('¿Eliminar esta caja completa y todas sus ventas? Esta acción no se puede deshacer.')) return;
    if (!confirm('¿Estás realmente segura? Se perderán todos los registros de este turno.')) return;
    setProcessing(true);
    const ok = await eliminarCaja(cajaId);
    if (ok) { showToast('Caja eliminada ✓'); setExpandedId(null); await load(); }
    else showToast('Error al eliminar', true);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
      </div>
    );
  }

  const totalEfectivo = filteredCajas.reduce((s, c) => s + (c.total_efectivo || 0), 0);
  const totalDigital = filteredCajas.reduce((s, c) => s + (c.total_digital || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl z-50 animate-fade-in
          ${toast.isError ? 'bg-mikita-danger text-white' : 'bg-mikita-success-dark text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl border border-mikita-warm/40 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-mikita-chocolate">Historial de Turnos</h2>
          <p className="text-sm text-mikita-cocoa/70">{filteredCajas.length} cierres registrados</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Month Filter */}
          <div>
            <label className="block text-[10px] text-mikita-cocoa uppercase tracking-wider mb-1">Filtrar por mes</label>
            <select
              value={mesFilter}
              onChange={e => setMesFilter(e.target.value)}
              className="px-3 py-2 bg-mikita-cream border border-mikita-warm/50 rounded-xl text-sm focus:outline-none focus:border-mikita-chocolate"
            >
              <option value="all">Todos</option>
              {monthOptions.map(m => (
                <option key={m} value={m}>{mesLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* Export Month Button */}
          <button
            onClick={() => exportMesCompleto(filteredCajas, mesFilter === 'all' ? 'Completo' : mesLabel(mesFilter))}
            disabled={filteredCajas.length === 0}
            className="px-4 py-2 bg-mikita-chocolate text-mikita-cream rounded-xl text-sm font-medium hover:bg-mikita-chocolate-light transition-colors disabled:opacity-40"
          >
            📥 Exportar Excel
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs text-mikita-cocoa uppercase tracking-wide">Recaudación</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(totalEfectivo + totalDigital)}</p>
          <p className="text-[10px] text-mikita-cocoa/60">💵 {formatPrice(totalEfectivo)} · 📱 {formatPrice(totalDigital)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-mikita-warm/40 rounded-3xl shadow-sm overflow-hidden">
        {filteredCajas.length === 0 ? (
          <p className="p-8 text-center text-mikita-cocoa/50">No hay historiales para este período.</p>
        ) : (
          <div className="divide-y divide-mikita-warm/20">
            {filteredCajas.map(c => {
              const vend = (c.total_efectivo || 0) + (c.total_digital || 0);
              const isExpanded = expandedId === c.id;
              const ventas = c.ventas || [];

              return (
                <div key={c.id}>
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full text-left p-4 hover:bg-mikita-cream/30 transition-colors flex items-center gap-4"
                  >
                    <span className={`text-mikita-cocoa transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-mikita-chocolate/80">
                      <div>
                        <p className="text-[10px] text-mikita-cocoa/50 uppercase md:hidden">Apertura</p>
                        <p className="font-medium">{formatFecha(c.fecha_apertura)}</p>
                      </div>
                      <div className="hidden md:block">
                        <p>{formatFecha(c.fecha_cierre)}</p>
                      </div>
                      <div>
                        {c.estado === 'abierta' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">EN CURSO</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">CERRADO</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-mikita-cocoa/50">💵 {formatPrice(c.total_efectivo || 0)} · 📱 {formatPrice(c.total_digital || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-mikita-chocolate">{formatPrice(vend)}</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-mikita-warm/30 bg-mikita-cream/10 p-4 space-y-3 animate-fade-in">
                      {/* Action bar */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => exportCajaToExcel(c)}
                          className="px-3 py-1.5 bg-mikita-chocolate text-mikita-cream rounded-lg text-xs font-medium hover:bg-mikita-chocolate-light transition-colors"
                        >
                          📥 Excel de esta caja
                        </button>
                        <button
                          onClick={() => setAddingToCaja(addingToCaja === c.id ? null : c.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          + Agregar venta
                        </button>
                        <button
                          onClick={() => handleEliminarCaja(c.id)}
                          disabled={processing}
                          className="px-3 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors ml-auto disabled:opacity-40"
                        >
                          🗑️ Eliminar caja
                        </button>
                      </div>

                      {/* Add venta form */}
                      {addingToCaja === c.id && (
                        <div className="bg-white p-3 rounded-xl border border-mikita-warm/40 space-y-2 animate-fade-in">
                          <p className="text-xs font-semibold text-mikita-chocolate">Agregar venta retroactiva</p>
                          <input
                            value={newVenta.descripcion}
                            onChange={e => setNewVenta({ ...newVenta, descripcion: e.target.value })}
                            placeholder="Descripción (ej: Manicuría + Esmaltado)"
                            className="w-full px-3 py-2 bg-mikita-cream border border-mikita-warm/40 rounded-lg text-sm focus:outline-none focus:border-mikita-chocolate"
                          />
                          <div className="flex gap-2">
                            <div className="flex items-center flex-1">
                              <span className="text-xs text-mikita-cocoa mr-1">$</span>
                              <input
                                type="number" min="0"
                                value={newVenta.monto_total}
                                onChange={e => setNewVenta({ ...newVenta, monto_total: e.target.value })}
                                placeholder="Monto"
                                className="w-full px-2 py-2 bg-mikita-cream border border-mikita-warm/40 rounded-lg text-sm focus:outline-none focus:border-mikita-chocolate"
                              />
                            </div>
                            <select
                              value={newVenta.metodo_pago}
                              onChange={e => setNewVenta({ ...newVenta, metodo_pago: e.target.value })}
                              className="px-3 py-2 bg-mikita-cream border border-mikita-warm/40 rounded-lg text-sm focus:outline-none"
                            >
                              <option value="efectivo">💵 Efectivo</option>
                              <option value="digital">📱 Digital</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAgregarVenta(c.id)}
                              disabled={processing}
                              className="flex-1 py-2 bg-mikita-chocolate text-mikita-cream rounded-lg text-xs font-medium disabled:opacity-40"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setAddingToCaja(null)}
                              className="px-4 py-2 text-mikita-cocoa text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Ventas list */}
                      {ventas.length === 0 ? (
                        <p className="text-sm text-mikita-cocoa/50 text-center py-4">Sin ventas registradas.</p>
                      ) : (
                        <div className="space-y-2">
                          {ventas.map(v => (
                            <div key={v.id} className={`p-3 rounded-xl border text-sm flex flex-col gap-1 ${v.estado === 'anulada' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-mikita-warm/30'}`}>
                              <div className="flex justify-between items-start">
                                <div className="text-xs font-semibold text-mikita-chocolate/80 uppercase">
                                  {v.creado_en ? new Date(v.creado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''} •
                                  {v.metodo_pago === 'efectivo' ? ' 💵 Efectivo' : ' 📱 Digital'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${v.estado === 'anulada' ? 'line-through text-gray-400' : 'text-mikita-chocolate'}`}>
                                    {formatPrice(v.monto_total)}
                                  </span>
                                  {v.estado === 'completada' && (
                                    <button onClick={() => handleAnular(v.id)} disabled={processing} title="Anular venta" className="text-red-400 hover:text-red-600 px-1 font-bold disabled:opacity-40">
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                              {v.estado === 'anulada' && <span className="text-[10px] text-red-500 font-bold uppercase">Anulada</span>}
                              <div className="text-xs text-mikita-cocoa/70 pl-2 border-l-2 border-mikita-warm/50">
                                {Array.isArray(v.detalle) && v.detalle.map((d, i) => (
                                  <div key={i}>1x {d.nombre}{d.precio ? ` — ${formatPrice(d.precio)}` : ''}</div>
                                ))}
                                {v.descuento > 0 && <div className="text-green-600 font-medium">- Descuento: {formatPrice(v.descuento)}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
