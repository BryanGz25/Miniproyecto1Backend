import Icono from './Icono';

/**
 * Tabla genérica.
 * columnas: [{ clave, titulo, render?: (item) => node, clase?: string }]
 */
export default function DataTable({ columnas, filas, cargando, error, vacio, onEditar, onEliminar }) {
  const totalColumnas = columnas.length + 1;

  const estado = (contenido, clase = 'estado-tabla') => (
    <tr>
      <td colSpan={totalColumnas} className={clase}>
        {contenido}
      </td>
    </tr>
  );

  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} className={c.clase}>
                {c.titulo}
              </th>
            ))}
            <th className="acciones">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cargando && estado('Cargando…')}
          {!cargando && error && estado(error, 'estado-tabla error-carga')}
          {!cargando && !error && filas.length === 0 && estado(vacio)}
          {!cargando &&
            !error &&
            filas.map((fila) => (
              <tr key={fila.id}>
                {columnas.map((c) => (
                  <td key={c.clave} className={c.clase}>
                    {c.render ? c.render(fila) : fila[c.clave] ?? '—'}
                  </td>
                ))}
                <td className="acciones">
                  <button type="button" className="btn btn-icono" onClick={() => onEditar(fila)} aria-label="Editar">
                    <Icono nombre="editar" />
                  </button>
                  <button type="button" className="btn btn-icono" onClick={() => onEliminar(fila)} aria-label="Eliminar">
                    <Icono nombre="basura" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
