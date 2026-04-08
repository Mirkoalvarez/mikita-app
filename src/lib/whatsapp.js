import { formatPrice, formatPhone } from './formatters';

/**
 * Default WhatsApp template (used when no custom template is set)
 */
const DEFAULT_TEMPLATE = `¡Hola {nombre}! ✨ Este es el presupuesto de tu servicio en Mikita:

{servicios}
{decoraciones}
{remociones}
{extras}

💰 *TOTAL ESTIMADO: {total}*

Válido por 48hs. ¡Te esperamos! 🤎`;

/**
 * Build WhatsApp message from quote data, optionally using a custom template.
 */
export function buildMessage({ clientName, servicios, decoraciones, remociones, extras, total }, customTemplate) {
  const name = clientName?.trim() || 'Cliente';

  // Build section strings
  let srvLines = '';
  if (servicios && servicios.length > 0) {
    srvLines = servicios.map(srv => `💅 *Servicio:* ${srv.nombre} — ${formatPrice(srv.precio)}`).join('\n');
  }

  let decoLines = '';
  if (decoraciones && decoraciones.length > 0) {
    const lines = decoraciones.map(d => {
      if (d.tipo === 'full') return `   • ${d.nombre} — ${formatPrice(d.precioTotal)}`;
      return `   • ${d.cantidad}× ${d.nombre} — ${formatPrice(d.precioTotal)}`;
    });
    decoLines = `🎨 *Diseño:*\n${lines.join('\n')}`;
  }

  let remoLines = '';
  if (remociones && remociones.length > 0) {
    const lines = remociones.map(r => `   • ${r.nombre} — ${formatPrice(r.precio)}`);
    remoLines = `🧼 *Remoción:*\n${lines.join('\n')}`;
  }

  let extraLines = '';
  if (extras && extras.length > 0) {
    const lines = extras.map(e => `   • ${e.nombre} — ${formatPrice(e.precio)}`);
    extraLines = `✨ *Extras:*\n${lines.join('\n')}`;
  }

  const template = customTemplate || DEFAULT_TEMPLATE;

  // Replace variables in template
  let msg = template
    .replace(/\{nombre\}/g, name)
    .replace(/\{servicios\}/g, srvLines)
    .replace(/\{decoraciones\}/g, decoLines)
    .replace(/\{remociones\}/g, remoLines)
    .replace(/\{extras\}/g, extraLines)
    .replace(/\{total\}/g, formatPrice(total));

  // Clean up: remove multiple consecutive blank lines
  msg = msg.replace(/\n{3,}/g, '\n\n').trim();

  return msg;
}

/**
 * Generate wa.me link
 */
export function buildWhatsAppLink(phone, message) {
  const formattedPhone = formatPhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encoded}`;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export { DEFAULT_TEMPLATE };
