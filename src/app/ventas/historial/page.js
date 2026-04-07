'use client';

import { useState, useEffect } from 'react';
import { getHistorialCajas } from '@/lib/pos';
import { formatPrice } from '@/lib/formatters';

export default function HistorialPage() {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getHistorialCajas(30); // Ultimos 30 turnos
      setCajas(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
      </div>
    );
  }

  const formatFecha = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-6 bg-white p-6 rounded-3xl border border-mikita-warm/40 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-mikita-chocolate">Historial de Turnos</h2>
          <p className="text-sm text-mikita-cocoa/70">Últimos {cajas.length} cierres de caja registrados</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-mikita-cocoa uppercase tracking-wide">Recaudación Acumulada Rango</p>
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(cajas.reduce((sum, c) => sum + (c.total_efectivo || 0) + (c.total_digital || 0), 0))}
          </p>
        </div>
      </div>

      <div className="overflow-hidden bg-white border border-mikita-warm/40 rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mikita-cream/50 text-xs text-mikita-cocoa uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-mikita-warm/40">Apertura</th>
                <th className="p-4 font-semibold border-b border-mikita-warm/40">Cierre</th>
                <th className="p-4 font-semibold border-b border-mikita-warm/40">Estado</th>
                <th className="p-4 font-semibold border-b border-mikita-warm/40 text-right">Efectivo 💵</th>
                <th className="p-4 font-semibold border-b border-mikita-warm/40 text-right">Digital 📱</th>
                <th className="p-4 font-semibold border-b border-mikita-warm/40 text-right">Total Facturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mikita-warm/20 text-sm text-mikita-chocolate/80">
              {cajas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-mikita-cocoa/50">No hay historiales guardados.</td>
                </tr>
              ) : (
                cajas.map(c => {
                  const vend = (c.total_efectivo || 0) + (c.total_digital || 0);
                  return (
                    <tr key={c.id} className="hover:bg-mikita-cream/20 transition-colors">
                      <td className="p-4 font-medium">{formatFecha(c.fecha_apertura)}</td>
                      <td className="p-4">{formatFecha(c.fecha_cierre)}</td>
                      <td className="p-4">
                        {c.estado === 'abierta' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">EN CURSO</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">CERRADO</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-medium">{formatPrice(c.total_efectivo || 0)}</td>
                      <td className="p-4 text-right font-medium">{formatPrice(c.total_digital || 0)}</td>
                      <td className="p-4 text-right font-bold text-mikita-chocolate">{formatPrice(vend)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
