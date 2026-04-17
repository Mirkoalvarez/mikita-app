import * as XLSX from 'xlsx';
import { formatPrice } from './formatters';

/**
 * Export a single caja with its ventas to an Excel file (.xlsx)
 */
export function exportCajaToExcel(caja) {
  const ventas = caja.ventas || [];
  const completadas = ventas.filter(v => v.estado === 'completada');
  const anuladas = ventas.filter(v => v.estado === 'anulada');

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // --- Sheet 1: Resumen ---
  const resumenData = [
    ['CIERRE DE CAJA — Mikita Nail Bar'],
    [],
    ['Apertura', formatFecha(caja.fecha_apertura)],
    ['Cierre', formatFecha(caja.fecha_cierre)],
    ['Estado', caja.estado?.toUpperCase()],
    [],
    ['Fondo Inicial (Efectivo)', caja.fondo_inicial || 0],
    ['Total Efectivo', caja.total_efectivo || 0],
    ['Total Digital (QR/Transf.)', caja.total_digital || 0],
    ['Total Facturado', (caja.total_efectivo || 0) + (caja.total_digital || 0)],
    ['Efectivo en Caja (Fondo + Efectivo)', (caja.fondo_inicial || 0) + (caja.total_efectivo || 0)],
    [],
    ['Ventas Completadas', completadas.length],
    ['Ventas Anuladas', anuladas.length],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Column widths
  wsResumen['!cols'] = [{ wch: 35 }, { wch: 25 }];

  // --- Sheet 2: Detalle de Ventas ---
  const detalleHeader = ['#', 'Hora', 'Método', 'Items', 'Descuento', 'Total', 'Estado'];
  const detalleRows = ventas.map((v, i) => {
    const items = Array.isArray(v.detalle) ? v.detalle.map(d => d.nombre).join(', ') : '';
    return [
      i + 1,
      formatFecha(v.creado_en),
      v.metodo_pago === 'efectivo' ? 'Efectivo' : 'Digital',
      items,
      v.descuento || 0,
      v.monto_total,
      v.estado === 'completada' ? 'OK' : 'ANULADA'
    ];
  });

  const wsDetalle = XLSX.utils.aoa_to_sheet([detalleHeader, ...detalleRows]);
  wsDetalle['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle Ventas');

  // Generate filename
  const fecha = caja.fecha_apertura ? new Date(caja.fecha_apertura).toISOString().split('T')[0] : 'caja';
  XLSX.writeFile(wb, `Mikita_Caja_${fecha}.xlsx`);
}

/**
 * Export multiple cajas (a full month) to a single Excel file
 */
export function exportMesCompleto(cajas, mesLabel) {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Resumen Mensual ---
  let totalEfectivoMes = 0;
  let totalDigitalMes = 0;
  let totalVentasMes = 0;

  const resumenHeader = ['Fecha Apertura', 'Fecha Cierre', 'Estado', 'Fondo Inicial', 'Efectivo', 'Digital', 'Total Facturado'];
  const resumenRows = cajas.map(c => {
    const ef = c.total_efectivo || 0;
    const dig = c.total_digital || 0;
    totalEfectivoMes += ef;
    totalDigitalMes += dig;
    const ventas = (c.ventas || []).filter(v => v.estado === 'completada');
    totalVentasMes += ventas.length;

    const formatFecha = (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return [
      formatFecha(c.fecha_apertura),
      formatFecha(c.fecha_cierre),
      c.estado?.toUpperCase(),
      c.fondo_inicial || 0,
      ef,
      dig,
      ef + dig,
    ];
  });

  // Add totals row
  resumenRows.push([]);
  resumenRows.push(['', '', 'TOTALES', '', totalEfectivoMes, totalDigitalMes, totalEfectivoMes + totalDigitalMes]);

  const wsResumen = XLSX.utils.aoa_to_sheet([
    [`Reporte Mensual — Mikita Nail Bar — ${mesLabel}`],
    [],
    resumenHeader,
    ...resumenRows,
  ]);
  wsResumen['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];

  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Mes');

  // --- Sheet 2: Todas las Ventas ---
  const detalleHeader = ['Caja', 'Hora', 'Método', 'Items', 'Descuento', 'Total', 'Estado'];
  const allVentas = [];
  cajas.forEach(c => {
    const fechaCaja = c.fecha_apertura ? new Date(c.fecha_apertura).toLocaleDateString('es-AR') : '?';
    (c.ventas || []).forEach(v => {
      const items = Array.isArray(v.detalle) ? v.detalle.map(d => d.nombre).join(', ') : '';
      allVentas.push([
        fechaCaja,
        v.creado_en ? new Date(v.creado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '',
        v.metodo_pago === 'efectivo' ? 'Efectivo' : 'Digital',
        items,
        v.descuento || 0,
        v.monto_total,
        v.estado === 'completada' ? 'OK' : 'ANULADA'
      ]);
    });
  });

  const wsDetalle = XLSX.utils.aoa_to_sheet([detalleHeader, ...allVentas]);
  wsDetalle['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Todas las Ventas');

  XLSX.writeFile(wb, `Mikita_Reporte_${mesLabel.replace(/\s+/g, '_')}.xlsx`);
}
