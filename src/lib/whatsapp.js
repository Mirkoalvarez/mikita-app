import { formatPrice, formatPhone } from './formatters';

/**
 * Build WhatsApp message from quote data
 */
export function buildMessage({ clientName, servicios, decoraciones, remociones, extras, total }) {
  const name = clientName?.trim() || 'Cliente';
  
  let msg = `¡Hola ${name}! ✨ Este es el presupuesto de tu servicio en Mikita:\n\n`;
  if (servicios && servicios.length > 0) {
    servicios.forEach(srv => {
      msg += `💅 *Servicio:* ${srv.nombre} — ${formatPrice(srv.precio)}\n`;
    });
  }
  
  if (decoraciones && decoraciones.length > 0) {
    const decoLines = decoraciones.map(d => {
      if (d.tipo === 'full') return `   • ${d.nombre} — ${formatPrice(d.precioTotal)}`;
      if (d.tipo === 'por_par') return `   • ${d.cantidad}× ${d.nombre} — ${formatPrice(d.precioTotal)}`;
      return `   • ${d.cantidad}× ${d.nombre} — ${formatPrice(d.precioTotal)}`;
    });
    msg += `🎨 *Diseño:*\n${decoLines.join('\n')}\n`;
  }
  
  if (remociones && remociones.length > 0) {
    const remoLines = remociones.map(r => `   • ${r.nombre} — ${formatPrice(r.precio)}`);
    msg += `🧼 *Remoción:*\n${remoLines.join('\n')}\n`;
  }
  
  if (extras && extras.length > 0) {
    const extraLines = extras.map(e => `   • ${e.nombre} — ${formatPrice(e.precio)}`);
    msg += `✨ *Extras:*\n${extraLines.join('\n')}\n`;
  }
  
  msg += `\n💰 *TOTAL ESTIMADO: ${formatPrice(total)}*\n`;
  msg += `\nVálido por 48hs. ¡Te esperamos! 🤎`;
  
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
