import { supabase } from './supabase';

/**
 * Obtener la caja activa actual (estado 'abierta').
 * Solo debería haber una, tomamos la más reciente.
 */
export async function getActiveCaja() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('estado', 'abierta')
    .order('fecha_apertura', { ascending: false })
    .limit(1)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error('getActiveCaja error:', error);
    return null;
  }
  return data || null; // Returns null if no box is open
}

/**
 * Abrir una nueva caja
 */
export async function abrirCaja(fondo_inicial = 0, observaciones = '') {
  if (!supabase) return null;
  
  // First, checking if there is an active caja just to be safe
  const active = await getActiveCaja();
  if (active) return active;

  const { data, error } = await supabase
    .from('cajas')
    .insert({
      estado: 'abierta',
      fondo_inicial,
      observaciones
    })
    .select()
    .single();

  if (error) {
    console.error('abrirCaja error:', error);
    return null;
  }
  return data;
}

/**
 * Cerrar la caja actual
 */
export async function cerrarCaja(cajaId) {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('cajas')
    .update({ 
      estado: 'cerrada',
      fecha_cierre: new Date().toISOString()
    })
    .eq('id', cajaId);

  if (error) {
    console.error('cerrarCaja error:', error);
    return false;
  }
  return true;
}

/**
 * Registrar una nueva venta en la caja actual
 */
export async function registrarVenta({ caja_id, monto_total, metodo_pago, detalle, descuento }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('ventas')
    .insert({
      caja_id,
      monto_total,
      metodo_pago,
      detalle,
      descuento: descuento || 0,
      estado: 'completada'
    })
    .select()
    .single();

  if (error) {
    console.error('registrarVenta error:', error);
    return null;
  }
  return data;
}

/**
 * Anular una venta (Error de tipeo/cobro)
 */
export async function anularVenta(ventaId) {
  if (!supabase) return false;

  const { error } = await supabase
    .from('ventas')
    .update({ estado: 'anulada' })
    .eq('id', ventaId);

  if (error) {
    console.error('anularVenta error:', error);
    return false;
  }
  return true;
}

/**
 * Obtener ventas de una caja específica
 */
export async function getVentasPorCaja(cajaId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('caja_id', cajaId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('getVentasPorCaja error:', error);
    return [];
  }
  return data;
}

/**
 * Obtener todas las cajas (Para Dashboard/Historial)
 */
export async function getHistorialCajas(limit = 10) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .order('fecha_apertura', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getHistorialCajas error:', error);
    return [];
  }
  
  // Also fetch totals per box (this can get heavy, but we usually limit to 10-30 rows)
  if (data && data.length > 0) {
    const cajaIds = data.map(c => c.id);
    const { data: ventas, error: ventasErr } = await supabase
      .from('ventas')
      .select('caja_id, monto_total, metodo_pago')
      .eq('estado', 'completada')
      .in('caja_id', cajaIds);
      
    if (!ventasErr && ventas) {
      // Map totals
      data.forEach(c => {
        const cVentas = ventas.filter(v => v.caja_id === c.id);
        c.total_esperado = cVentas.reduce((sum, v) => sum + v.monto_total, 0) + (c.fondo_inicial || 0);
        c.total_efectivo = cVentas.filter(v => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + v.monto_total, 0);
        c.total_digital = cVentas.filter(v => v.metodo_pago === 'digital').reduce((sum, v) => sum + v.monto_total, 0);
      });
    }
  }

  return data;
}
