'use client';

import { useState, useEffect } from 'react';
import { getConfig, setConfig } from '@/shared/lib/supabase';
import { DEFAULT_TEMPLATE } from '@/shared/lib/whatsapp';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function ConfigManager({ showToast }) {
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const val = await getConfig('whatsapp_template');
      setTemplate(val || DEFAULT_TEMPLATE);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const ok = await setConfig('whatsapp_template', template);
    if (ok) showToast('Template guardado ✓');
    else showToast('Error al guardar', 'error');
    setSaving(false);
  };

  const handleReset = () => {
    if (!confirm('¿Restaurar el mensaje por defecto?')) return;
    setTemplate(DEFAULT_TEMPLATE);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white/70 rounded-2xl p-4 border border-mikita-warm/30 space-y-3">
        <h3 className="font-bold text-mikita-chocolate text-sm">Mensaje de WhatsApp</h3>
        <p className="text-xs text-mikita-cocoa/60">Personalizá el mensaje que se envía con cada presupuesto. Usá estas variables:</p>
        
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {['{nombre}', '{servicios}', '{decoraciones}', '{remociones}', '{extras}', '{total}'].map(v => (
            <span key={v} className="px-2 py-1 bg-mikita-cream-dark rounded-full text-mikita-chocolate font-mono font-semibold">{v}</span>
          ))}
        </div>

        <textarea
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 rounded-xl bg-mikita-cream border border-mikita-warm/40 text-sm font-mono leading-relaxed focus:outline-none focus:border-mikita-cocoa resize-y"
        />

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-mikita-chocolate text-mikita-cream text-sm font-medium disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar template'}
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-mikita-cocoa text-sm border border-mikita-warm/40 hover:bg-mikita-cream-dark">
            Restaurar default
          </button>
        </div>
      </div>
    </div>
  );
}
