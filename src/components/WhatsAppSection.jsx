'use client';

import { useState } from 'react';
import { isValidPhone } from '@/lib/formatters';
import { buildMessage, buildWhatsAppLink, copyToClipboard } from '@/lib/whatsapp';
import { saveQuoteToHistory } from '@/lib/storage';

export default function WhatsAppSection({ servicios, decoSummary, remociones, extras, total }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const messageData = {
    clientName,
    servicios,
    decoraciones: decoSummary,
    remociones,
    extras,
    total,
  };

  const handleSendWhatsApp = () => {
    if (!phone.trim()) {
      showToast('Ingresá el teléfono de la clienta', 'error');
      return;
    }
    if (!isValidPhone(phone)) {
      showToast('El teléfono no parece válido', 'error');
      return;
    }

    const message = buildMessage(messageData);
    const link = buildWhatsAppLink(phone, message);

    // Save to history
    saveQuoteToHistory({
      clientName: clientName || 'Sin nombre',
      phone,
      servicio: servicios.map(s => s.nombre).join(' + '),
      total,
      detalles: message,
    });

    window.open(link, '_blank');
    showToast('¡Presupuesto enviado! 🤎');
  };

  const handleNativeShare = async () => {
    const message = buildMessage(messageData);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Presupuesto Mikita',
          text: message,
        });
        saveQuoteToHistory({
          clientName: clientName || 'Sin nombre',
          phone: phone || 'N/A',
          servicio: servicios.map(s => s.nombre).join(' + '),
          total,
          detalles: message,
        });
        showToast('¡Presupuesto compartido! 🤎');
      } catch (error) {
        if (error.name !== 'AbortError') {
          showToast('No se pudo compartir', 'error');
        }
      }
    } else {
      showToast('Compartir no soportado en tu navegador', 'error');
    }
  };

  const handleCopy = async () => {
    const message = buildMessage(messageData);
    const success = await copyToClipboard(message);
    if (success) {
      // Save to history too
      saveQuoteToHistory({
        clientName: clientName || 'Sin nombre',
        phone: phone || 'N/A',
        servicio: servicios.map(s => s.nombre).join(' + '),
        total,
        detalles: message,
      });
      showToast('¡Copiado al portapapeles! 📋');
    } else {
      showToast('No se pudo copiar', 'error');
    }
  };

  if (!servicios || servicios.length === 0) return null;

  return (
    <section className="px-4 mt-6 pb-8 animate-fade-in">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-mikita-cocoa mb-3">
        ④ Enviar presupuesto
      </h2>

      <div className="space-y-3">
        {/* Client name */}
        <div>
          <label className="block text-xs text-mikita-cocoa/70 mb-1 font-medium">Nombre de la clienta (opcional)</label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Ej: María"
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-mikita-warm/40 text-mikita-chocolate placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa focus:ring-2 focus:ring-mikita-cocoa/20 transition-all min-h-[44px]"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs text-mikita-cocoa/70 mb-1 font-medium">Teléfono (WhatsApp)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Ej: 1123456789"
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-mikita-warm/40 text-mikita-chocolate placeholder:text-mikita-cocoa/30 focus:outline-none focus:border-mikita-cocoa focus:ring-2 focus:ring-mikita-cocoa/20 transition-all min-h-[44px]"
          />
        </div>

        {/* Actions side-by-side */}
        <div className="flex gap-2">
          {/* WhatsApp button */}
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 py-4 rounded-2xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#25D366]/30 hover:bg-[#20BD5A] active:scale-[0.98] transition-all min-h-[52px] leading-tight px-1"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar WA
          </button>

          {/* Native Share button */}
          <button
            onClick={handleNativeShare}
            className="flex-1 py-4 rounded-2xl bg-mikita-chocolate text-mikita-cream font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-mikita-chocolate/30 hover:bg-mikita-chocolate-light active:scale-[0.98] transition-all min-h-[52px] leading-tight px-1"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartir
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl bg-white/80 border-2 border-mikita-chocolate/20 text-mikita-chocolate font-semibold text-sm flex items-center justify-center gap-2 hover:bg-mikita-cream-dark active:scale-[0.98] transition-all min-h-[48px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copiar mensaje
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast px-5 py-3 rounded-2xl text-sm font-medium shadow-xl
          ${toast.type === 'error' 
            ? 'bg-mikita-danger text-white' 
            : 'bg-mikita-chocolate text-mikita-cream'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </section>
  );
}
