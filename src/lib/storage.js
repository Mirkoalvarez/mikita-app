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
 * Save a quote to history
 */
export function saveQuoteToHistory(quote) {
  const history = loadFromStorage(STORAGE_KEYS.HISTORY) || [];
  history.unshift({
    ...quote,
    id: Date.now(),
    fecha: new Date().toISOString(),
  });
  // Keep last 100 quotes
  if (history.length > 100) history.length = 100;
  saveToStorage(STORAGE_KEYS.HISTORY, history);
}

/**
 * Get quote history
 */
export function getQuoteHistory() {
  return loadFromStorage(STORAGE_KEYS.HISTORY) || [];
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
