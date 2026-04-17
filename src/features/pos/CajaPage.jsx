'use client';

import { useState, useEffect } from 'react';
import { getActiveCaja, abrirCaja, cerrarCaja, getVentasPorCaja, anularVenta } from '@/shared/lib/pos';
import { formatPrice } from '@/shared/lib/formatters';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function CajaPage() {
  const [caja, setCaja] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [fondoInicial, setFondoInicial] = useState(0);

  const loadCaja = async () => {
    setLoading(true);
    const active = await getActiveCaja();
    setCaja(active);
    if (active) {
      const v = await getVentasPorCaja(active.id);
      setVentas(v);
    } else {
      setVentas([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadCaja(); }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAbrir = async () => {
    setProcessing(true);
    const newCaja = await abrirCaja(fondoInicial, '');
    if (newCaja) {
      showToast('Caja abierta exitosamente ✓');
      await loadCaja();
    } else {
      showToast('Error al abrir la caja', true);
    }
    setProcessing(false);
  };

  const handleCerrar = async () => {
    if (!confirm('¿Estás segura de cerrar la caja del día? Esta acción no se puede deshacer.')) return;
    setProcessing(true);
    const ok = await cerrarCaja(caja.id);
    if (ok) {
      showToast('Caja cerrada correctamente ✓');
      await loadCaja();
    } else {
      showToast('Error al cerrar caja', true);
    }
    setProcessing(false);
  };

  const handleAnular = async (venta) => {
    if (venta.estado === 'anulada') return;
    if (!confirm(`¿Anular esta venta por ${formatPrice(venta.monto_total)}?`)) return;
    
    setProcessing(true);
    const ok = await anularVenta(venta.id);
    if (ok) {
      showToast('Venta anulada ✓');
      await loadCaja();
    } else {
      showToast('Error al anular', true);
    }
    setProcessing(false);
  };

  if (loading) return <LoadingSpinner />;

  // --- No caja abierta ---
  if (!caja) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl md:rounded-3xl border border-mikita-warm/40 p-6 md:p-8 shadow-sm text-center animate-fade-in mt-6 md:mt-12">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-xl md:text-2xl font-bold text-mikita-chocolate mb-2">Abrir Nueva Caja</h2>
        <p className="text-mikita-cocoa text-sm mb-6">Empezá tu turno registrando con cuánto efectivo inicias para que los números cuadren al final del día.</p>
        
        <div className="space-y-4 mb-6">
          <div className="text-left">
            <label className="block text-xs font-semibold text-mikita-cocoa mb-1 uppercase tracking-wider">Caja Fija (Efectivo inicial)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mikita-cocoa">$</span>
              <input 
                type="number" min="0" value={fondoInicial} 
                onChange={e => setFondoInicial(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3 bg-mikita-cream border border-mikita-warm/50 rounded-xl focus:border-mikita-chocolate outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleAbrir} disabled={processing}
          className="w-full py-4 bg-mikita-chocolate text-mikita-cream font-bold rounded-xl hover:bg-mikita-chocolate-light transition-all shadow-md disabled:opacity-50"
        >
          Iniciar Turno
        </button>
      </div>
    );
  }

  // --- Caja Abierta ---
  const validas = ventas.filter(v => v.estado === 'completada');
  const totalEfectivo = validas.filter(v => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + v.monto_total, 0);
  const totalDigital = validas.filter(v => v.metodo_pago === 'digital').reduce((sum, v) => sum + v.monto_total, 0);
  const totalVendido = totalEfectivo + totalDigital;
  const dineroEnCaja = totalEfectivo + (caja.fondo_inicial || 0);

  const apertura = new Date(caja.fecha_apertura);
  const isOld = new Date().getDate() !== apertura.getDate();

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-8">
      {toast && (
        <div className={`fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto px-5 py-3 rounded-2xl text-sm font-medium shadow-xl z-50 animate-fade-in text-center
          ${toast.isError ? 'bg-mikita-danger text-white' : 'bg-mikita-success-dark text-white'}`}>
          {toast.msg}
        </div>
      )}

      {isOld && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 md:p-4 rounded shadow-sm flex items-start gap-3">
          <p className="text-xl">⚠️</p>
          <div>
            <p className="font-bold text-sm">Caja abierta del día anterior</p>
            <p className="text-xs md:text-sm">Verificá los totales y efectúa el cierre antes de abrir la caja de hoy.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Resumen Financiero */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-mikita-warm/40 shadow-sm">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-mikita-chocolate">Estado de Caja</h2>
                <p className="text-[10px] md:text-xs text-mikita-cocoa/60">Abierta el {apertura.toLocaleDateString('es-AR', { hour: '2-digit', minute:'2-digit' })}</p>
              </div>
              <div className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-bold rounded-full border border-green-200">
                ABIERTA
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-mikita-cream/50 rounded-xl md:rounded-2xl border border-mikita-warm/20">
                <p className="text-[10px] md:text-xs text-mikita-cocoa uppercase tracking-wider mb-1">Caja Fija</p>
                <p className="text-lg md:text-xl font-medium text-mikita-chocolate/80">{formatPrice(caja.fondo_inicial || 0)}</p>
              </div>
              <div className="p-3 md:p-4 bg-mikita-cream/50 rounded-xl md:rounded-2xl border border-mikita-warm/20">
                <p className="text-[10px] md:text-xs text-mikita-cocoa uppercase tracking-wider mb-1">Total Facturado</p>
                <p className="text-lg md:text-xl font-medium text-mikita-chocolate/80">{formatPrice(totalVendido)}</p>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-green-50 text-green-900 border border-green-100">
                <p className="font-semibold text-xs md:text-sm">Efectivo Esperado</p>
                <p className="font-bold text-base md:text-lg">{formatPrice(dineroEnCaja)}</p>
              </div>
              <div className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                <p className="font-semibold text-xs md:text-sm">QR / Transferencia</p>
                <p className="font-bold text-base md:text-lg">{formatPrice(totalDigital)}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCerrar} disabled={processing}
            className="w-full py-3.5 md:py-4 bg-mikita-danger/90 text-white font-bold rounded-xl md:rounded-2xl hover:bg-mikita-danger transition-all shadow-md disabled:opacity-50 text-sm md:text-base"
          >
            Cerrar Caja del Turno
          </button>
        </div>

        {/* Transacciones */}
        <div className="w-full md:w-[450px] bg-white rounded-2xl md:rounded-3xl border border-mikita-warm/40 shadow-sm flex flex-col max-h-[50vh] md:max-h-[600px]">
          <div className="p-4 md:p-5 border-b border-mikita-warm/30 bg-mikita-cream/20 shrink-0">
            <h3 className="font-bold text-mikita-chocolate text-base md:text-lg">Últimas Transacciones</h3>
            <p className="text-[10px] md:text-xs text-mikita-cocoa/60">{ventas.length} registros en esta caja</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {ventas.length === 0 ? (
              <p className="text-center text-sm text-mikita-cocoa/50 py-8">Todavía no hay ventas registradas.</p>
            ) : (
              ventas.map(v => (
                <div key={v.id} className={`p-2.5 md:p-3 rounded-xl border flex flex-col gap-1.5 md:gap-2 ${v.estado === 'anulada' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-mikita-warm/40'}`}>
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] md:text-xs font-semibold text-mikita-chocolate/80 uppercase">
                      {new Date(v.creado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' })} • 
                      {v.metodo_pago === 'efectivo' ? ' 💵' : ' 📱'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${v.estado === 'anulada' ? 'line-through text-gray-400' : 'text-mikita-chocolate'}`}>
                        {formatPrice(v.monto_total)}
                      </span>
                      {v.estado === 'completada' && (
                        <button onClick={() => handleAnular(v)} title="Anular venta" className="text-red-400 hover:text-red-600 p-1 font-bold text-xs">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {v.estado === 'anulada' && <span className="text-[10px] text-red-500 font-bold uppercase">Anulada</span>}
                  <div className="text-[10px] md:text-xs text-mikita-cocoa/70 pl-2 border-l-2 border-mikita-warm/50">
                    {Array.isArray(v.detalle) && v.detalle.map((d, i) => (
                      <div key={i}>1x {d.nombre}</div>
                    ))}
                    {v.descuento > 0 && <div className="text-green-600 font-medium">- Desc: {formatPrice(v.descuento)}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
