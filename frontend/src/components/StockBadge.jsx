import { estadoStock, formatearEntero } from '../utils/formato';

const ESTILO = { ok: 'ok', bajo: 'alerta', agotado: 'peligro' };

/** Pastilla de stock: verde normal, ámbar bajo el mínimo, rojo agotado. */
export default function StockBadge({ producto }) {
  const estado = estadoStock(producto);
  const texto =
    estado === 'agotado'
      ? '0 · agotado'
      : estado === 'bajo'
        ? `${formatearEntero(producto.stockActual)} / mín ${formatearEntero(producto.stockMinimo)}`
        : formatearEntero(producto.stockActual);

  return <span className={`pastilla ${ESTILO[estado]}`}>{texto}</span>;
}
