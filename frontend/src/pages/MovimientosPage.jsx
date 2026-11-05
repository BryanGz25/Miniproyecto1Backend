import { useCallback, useState } from 'react';
import CrudPage from '../components/CrudPage';
import MovimientoForm, { TIPOS_MOVIMIENTO } from '../components/forms/MovimientoForm';
import { useCrud } from '../hooks/useCrud';
import { useOpciones } from '../hooks/useOpciones';
import { movimientosService, productosService } from '../services/inventario.service';
import { formatearColones, formatearEntero, formatearFecha } from '../utils/formato';

const ESTILO_TIPO = { ENTRADA: 'ok', SALIDA: 'neutra', AJUSTE: 'alerta' };

const COLUMNAS = [
  { clave: 'fecha', titulo: 'Fecha', render: (m) => <span className="secundario">{formatearFecha(m.fecha)}</span> },
  {
    clave: 'producto',
    titulo: 'Producto',
    render: (m) => (
      <>
        <span className="mono">{m.producto?.sku}</span> {m.producto?.nombre}
      </>
    ),
  },
  { clave: 'bodega', titulo: 'Bodega', render: (m) => <span className="secundario">{m.bodega?.nombre ?? '—'}</span> },
  { clave: 'tipo', titulo: 'Tipo', render: (m) => <span className={`pastilla ${ESTILO_TIPO[m.tipo]}`}>{m.tipo.toLowerCase()}</span> },
  {
    clave: 'cantidad',
    titulo: 'Cantidad',
    clase: 'derecha',
    render: (m) => (m.tipo === 'ENTRADA' ? '+' : '−') + formatearEntero(m.cantidad),
  },
  { clave: 'costoUnitario', titulo: 'Costo unit.', clase: 'derecha', render: (m) => formatearColones(m.costoUnitario) },
  { clave: 'motivo', titulo: 'Motivo', render: (m) => <span className="secundario">{m.motivo || '—'}</span> },
  { clave: 'usuario', titulo: 'Registrado por', render: (m) => <span className="secundario">{m.usuario?.nombre ?? '—'}</span> },
];

const BUSQUEDA = [(m) => m.producto?.nombre, (m) => m.producto?.sku, (m) => m.motivo, (m) => m.bodega?.nombre];
const BODEGAS = ['bodegas'];

export default function MovimientosPage() {
  const movimientos = useCrud(movimientosService);
  const productos = useCrud(productosService);
  const { bodegas = [] } = useOpciones(BODEGAS);
  const [tipoFiltro, setTipoFiltro] = useState('');

  // Cada movimiento cambia el stock, así que también se recargan los productos.
  const crud = {
    ...movimientos,
    guardar: async (datos, id) => {
      await movimientos.guardar(datos, id);
      await productos.cargar();
    },
    eliminar: async (id) => {
      await movimientos.eliminar(id);
      await productos.cargar();
    },
  };

  const filtrar = useCallback((m) => !tipoFiltro || m.tipo === tipoFiltro, [tipoFiltro]);

  return (
    <CrudPage
      titulo="Movimientos de stock"
      subtitulo="Cada entrada, salida o ajuste actualiza el stock del producto"
      entidad={{ singular: 'movimiento', articulo: 'el' }}
      crud={crud}
      columnas={COLUMNAS}
      camposBusqueda={BUSQUEDA}
      filtrar={filtrar}
      Formulario={MovimientoForm}
      propsFormulario={{ productos: productos.items, bodegas }}
      describir={(m) => `la ${m.tipo.toLowerCase()} de ${m.cantidad} × ${m.producto?.nombre ?? 'producto'} (el stock se revierte)`}
      filtroExtra={
        <>
          <label className="sr-only" htmlFor="filtro-tipo">
            Filtrar por tipo
          </label>
          <select id="filtro-tipo" className="campo campo-filtro" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_MOVIMIENTO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.valor.charAt(0) + t.valor.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </>
      }
    />
  );
}
