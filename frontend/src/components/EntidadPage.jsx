import { useMemo } from 'react';
import CrudPage from './CrudPage';
import EntidadForm from './forms/EntidadForm';
import { useCrud } from '../hooks/useCrud';
import { useOpciones } from '../hooks/useOpciones';
import { useAuth } from '../context/AuthContext';
import { crearServicioCrud } from '../services/api';
import { aFechaLocal, formatearColones, formatearEntero, formatearFecha, formatearFechaCorta } from '../utils/formato';

const ESTILO_ESTADO = { PAGADA: 'ok', RECIBIDA: 'ok', ENVIADA: 'neutra', PENDIENTE: 'alerta', BORRADOR: 'neutra', ANULADA: 'peligro', CANCELADA: 'peligro' };
const DIA = 86400000;

// Texto plano de una celda (también se usa para el buscador).
const textoCelda = (col, item) => {
  const v = col.calcular ? col.calcular(item) : item[col.clave];
  if (col.tipo === 'relacion') return v ? col.mostrar(v) : '';
  return v ?? '';
};

// Cómo se dibuja cada tipo de columna.
const celda = (col, item) => {
  const v = col.calcular ? col.calcular(item) : item[col.clave];
  if (v === null || v === undefined || v === '') return <span className="secundario">—</span>;
  switch (col.tipo) {
    case 'fuerte':
      return <strong style={{ fontWeight: 500 }}>{v}</strong>;
    case 'mono':
      return <span className="mono">{v}</span>;
    case 'colones':
      return formatearColones(v);
    case 'porcentaje':
      return `${v} %`;
    case 'entero':
      return formatearEntero(v);
    case 'fecha':
      return <span className="secundario">{formatearFechaCorta(v)}</span>;
    case 'fechaHora':
      return <span className="secundario">{formatearFecha(v)}</span>;
    case 'bool': {
      const [si, no] = col.textos ?? ['Activo', 'Inactivo'];
      return <span className={`pastilla ${v ? 'ok' : 'neutra'}`}>{v ? si : no}</span>;
    }
    case 'estado':
      return <span className={`pastilla ${ESTILO_ESTADO[v] ?? 'neutra'}`}>{v.toLowerCase()}</span>;
    case 'vencimiento': {
      const dias = Math.ceil((aFechaLocal(v) - Date.now()) / DIA);
      const estilo = dias < 0 ? 'peligro' : dias <= 30 ? 'alerta' : 'ok';
      return <span className={`pastilla ${estilo}`}>{formatearFechaCorta(v)}{dias < 0 ? ' · vencido' : dias <= 30 ? ` · ${dias} d` : ''}</span>;
    }
    case 'relacion':
      return col.mono ? <span className="mono">{col.mostrar(v)}</span> : col.mostrar(v);
    default:
      return <span className="secundario">{v}</span>;
  }
};

/** Pantalla CRUD completa a partir de una entrada de config/entidades.js. */
export default function EntidadPage({ config }) {
  const servicio = useMemo(() => crearServicioCrud(config.ruta), [config.ruta]);
  const crud = useCrud(servicio);
  const { puede } = useAuth();

  // Las listas de los <select> solo hacen falta si el usuario puede abrir el formulario.
  const usaFormulario = puede(`${config.ruta}.crear`) || puede(`${config.ruta}.editar`);
  const recursosFk = useMemo(
    () => (usaFormulario ? [...new Set(config.campos.filter((c) => c.tipo === 'fk').map((c) => c.recurso))] : []),
    [config, usaFormulario],
  );
  const opciones = useOpciones(recursosFk);

  const columnas = useMemo(
    () => config.columnas.map((col) => ({ clave: col.clave, titulo: col.titulo, clase: ['colones', 'entero', 'porcentaje'].includes(col.tipo) ? 'derecha' : undefined, render: (item) => celda(col, item) })),
    [config],
  );
  const busqueda = useMemo(() => config.columnas.map((col) => (item) => textoCelda(col, item)), [config]);

  const { articulo, singular } = config.entidad;
  const describir = config.describir ?? ((item) => `${articulo} ${singular} "${item[config.titular]}"`);

  return (
    <CrudPage
      titulo={config.titulo}
      subtitulo={`${crud.items.length} registros · ${config.subtitulo}`}
      entidad={config.entidad}
      recurso={config.ruta}
      crud={crud}
      columnas={columnas}
      camposBusqueda={busqueda}
      Formulario={EntidadForm}
      propsFormulario={{ campos: config.campos, opciones }}
      describir={describir}
    />
  );
}
