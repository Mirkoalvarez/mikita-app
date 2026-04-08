import { fetchPresupuestos, insertPresupuesto, deletePresupuesto as deletePresupuestoDb } from './supabase';

const STORAGE_KEYS = {
  SERVICES: 'mikita_services',
  HISTORY: 'mikita_history',
  CUSTOM_PRICES: 'mikita_custom_prices',
  INVENTORY: 'mikita_inventory',
};

/**
 * Save data to LocalStorage
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load data from LocalStorage
 */
export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save a quote to history (Supabase first, localStorage fallback)
 */
export async function saveQuoteToHistory(quote) {
  const row = {
    client_name: quote.clientName || 'Sin nombre',
    phone: quote.phone || 'N/A',
    servicio: quote.servicio || '',
    total: quote.total || 0,
    detalles: quote.detalles || '',
  };

  const result = await insertPresupuesto(row);
  if (result) return result;

  // Fallback to localStorage
  const history = loadFromStorage(STORAGE_KEYS.HISTORY) || [];
  history.unshift({
    ...quote,
    id: Date.now(),
    fecha: new Date().toISOString(),
  });
  if (history.length > 100) history.length = 100;
  saveToStorage(STORAGE_KEYS.HISTORY, history);
}

/**
 * Get quote history (Supabase first, localStorage fallback)
 */
export async function getQuoteHistory() {
  const data = await fetchPresupuestos(100);
  if (data) {
    // Normalize shape for the UI
    return data.map(p => ({
      id: p.id,
      clientName: p.client_name,
      phone: p.phone,
      servicio: p.servicio,
      total: p.total,
      detalles: p.detalles,
      fecha: p.creado_en,
    }));
  }
  // Fallback to localStorage
  return loadFromStorage(STORAGE_KEYS.HISTORY) || [];
}

/**
 * Delete a specific quote by ID (Supabase first, localStorage fallback)
 */
export async function deleteQuoteFromHistory(id) {
  const ok = await deletePresupuestoDb(id);
  if (ok) return true;

  // Fallback to localStorage
  const history = await getQuoteHistory();
  const updated = history.filter(q => q.id !== id);
  saveToStorage(STORAGE_KEYS.HISTORY, updated);
}

/**
 * Save custom prices (admin overrides)
 */
export function saveCustomPrices(prices) {
  saveToStorage(STORAGE_KEYS.CUSTOM_PRICES, prices);
}

/**
 * Get custom prices
 */
export function getCustomPrices() {
  return loadFromStorage(STORAGE_KEYS.CUSTOM_PRICES) || {};
}

/**
 * Save inventory data
 */
export function saveInventory(inventory) {
  saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
}

/**
 * Get inventory data
 */
export function getInventory() {
  return loadFromStorage(STORAGE_KEYS.INVENTORY) || [];
}

export { STORAGE_KEYS };
