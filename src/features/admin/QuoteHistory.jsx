'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/shared/lib/formatters';
import { getQuoteHistory, deleteQuoteFromHistory } from '@/shared/lib/storage';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function QuoteHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getQuoteHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDeleteQuote = async (id, e) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este presupuesto del historial?')) return;
    await deleteQuoteFromHistory(id);
    reload();
  };

  if (loading) return <LoadingSpinner />;

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
        <div key={q.id || i} className="bg-white/70 rounded-2xl p-4 border border-mikita-warm/30 relative group">
          <button 
            onClick={(e) => handleDeleteQuote(q.id, e)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-mikita-danger/40 hover:text-mikita-danger text-xs p-2 transition-all z-10"
          >
            ✕
          </button>
          <div className="flex justify-between items-start mb-2 pr-6">
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
