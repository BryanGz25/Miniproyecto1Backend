const colones = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 2 });
const entero = new Intl.NumberFormat('es-CR');
const fechaHora = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' });

export const formatearColones = (valor) => (valor === null || valor === undefined ? '—' : colones.format(valor));
export const formatearEntero = (valor) => entero.format(valor ?? 0);
export const formatearFecha = (valor) => (valor ? fechaHora.format(new Date(valor)) : '—');

/** Convierte una fecha ISO al formato que usa <input type="datetime-local">. */
export const aInputFecha = (valor) => {
  const fecha = valor ? new Date(valor) : new Date();
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/** Compara textos sin importar mayúsculas ni tildes. */
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Estado del stock respecto al mínimo: 'agotado' | 'bajo' | 'ok'. */
export const estadoStock = ({ stockActual, stockMinimo }) => {
  if (stockActual === 0) return 'agotado';
  if (stockActual <= stockMinimo) return 'bajo';
  return 'ok';
};
