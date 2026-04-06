import {
  fetchCategorias,
  fetchServicios,
  fetchDecoraciones,
  fetchRemociones,
  fetchExtras,
} from './supabase';
import fallbackData from '@/data/services.json';

/**
 * Fetch the full catalog from Supabase, transforming it into
 * the same shape as services.json for backward compatibility.
 * Falls back to the static JSON if Supabase is unavailable.
 */
export async function fetchCatalog() {
  try {
    const [categorias, servicios, decoraciones, remociones, extras] = await Promise.all([
      fetchCategorias(),
      fetchServicios(),
      fetchDecoraciones(),
      fetchRemociones(),
      fetchExtras(),
    ]);

    // If any critical fetch failed, use fallback
    if (!categorias || !servicios) {
      console.warn('⚠ Supabase fetch failed — using offline data');
      return fallbackData;
    }

    // Group servicios by categoria_id
    const catMap = {};
    categorias.forEach(cat => {
      catMap[cat.id] = {
        id: cat.id,
        nombre: cat.nombre,
        icon: cat.icon || '💅',
        orden: cat.orden || 0,
        servicios: [],
      };
    });

    servicios.forEach(srv => {
      if (catMap[srv.categoria_id]) {
        catMap[srv.categoria_id].servicios.push({
          id: srv.id,
          nombre: srv.nombre,
          precio: srv.precio,
          duracion: srv.duracion,
        });
      }
    });

    // Find the "Manos" category ID
    const manosCategory = categorias.find(c =>
      c.nombre.toLowerCase().includes('manos')
    );

    const sortedCats = Object.values(catMap)
      .filter(c => c.servicios.length > 0)
      .sort((a, b) => a.orden - b.orden);

    const catalog = {
      categorias: sortedCats,
      adicionales: {
        decoraciones: decoraciones || fallbackData.adicionales.decoraciones,
        remociones: remociones || fallbackData.adicionales.remociones,
        extras: extras || fallbackData.adicionales.extras,
      },
      categoriaManos: manosCategory?.id || fallbackData.categoriaManos,
    };

    return catalog;
  } catch (err) {
    console.error('fetchCatalog error:', err);
    return fallbackData;
  }
}
