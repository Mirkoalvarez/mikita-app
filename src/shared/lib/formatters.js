/**
 * Format price in Argentine Pesos: $XX.XXX
 */
export function formatPrice(amount) {
  return '$' + Math.round(amount).toLocaleString('es-AR');
}

/**
 * Format phone number for WhatsApp (Argentina)
 * Accepts: 1123456789, 011-2345-6789, +5491123456789, etc.
 * Returns: 549XXXXXXXXXX
 */
export function formatPhone(phone) {
  // Remove everything except digits
  let digits = phone.replace(/\D/g, '');
  
  // If starts with +54 or 54, strip it
  if (digits.startsWith('54')) {
    digits = digits.substring(2);
  }
  
  // Remove leading 0 (for 011...)
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  
  // Remove 15 after area code (old mobile format)
  if (digits.length === 10 && digits.substring(2, 4) === '15') {
    digits = digits.substring(0, 2) + digits.substring(4);
  }
  
  // Ensure 9 prefix for mobile (WhatsApp requirement for Argentina)
  if (!digits.startsWith('9')) {
    digits = '9' + digits;
  }
  
  return '54' + digits;
}

/**
 * Validate phone has enough digits
 */
export function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8;
}
