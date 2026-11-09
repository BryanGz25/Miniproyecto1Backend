import { useCallback, useMemo, useState } from 'react';
import Icono from './Icono';
import DataTable from './DataTable';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { useAvisos } from './Avisos';
import { useAuth } from '../context/AuthContext';
import { normalizar } from '../utils/formato';

/**
 * Pantalla CRUD reutilizable: encabezado, buscador, tabla, formulario en modal
 * y confirmación de eliminación. Cada página solo define columnas y formulario.
 */
export default function CrudPage({
  titulo,
  subtitulo,
  entidad, // { singular: 'producto', articulo: 'el' }
  recurso, // ruta de la API: decide qué botones ve el usuario
  crud,
  columnas,
  camposBusqueda,
  Formulario,
  propsFormulario = {},
  filtroExtra,
  filtrar = () => true,
  describir,
  antesDeTabla,
}) {
  const avisar = useAvisos();
  const { puede } = useAuth();
  const puedeCrear = puede(`${recurso}.crear`);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, item = editar
  const [eliminando, setEliminando] = useState(null);

  const filas = useMemo(() => {
    const texto = normalizar(busqueda);
    return crud.items.filter(
      (item) => filtrar(item) && (!texto || camposBusqueda.some((campo) => normalizar(campo(item)).includes(texto))),
    );
  }, [crud.items, busqueda, camposBusqueda, filtrar]);

  const cerrar = useCallback(() => setEditando(null), []);
  const cancelarEliminar = useCallback(() => setEliminando(null), []);
  const esNuevo = editando && !editando.id;
  const Nombre = entidad.singular[0].toUpperCase() + entidad.singular.slice(1);
  const o = entidad.articulo === 'la' ? 'a' : 'o'; // concordancia: nuevo/nueva, creado/creada
  const tituloNuevo = `Nuev${o} ${entidad.singular}`;

  const guardar = async (datos) => {
    await crud.guardar(datos, editando.id);
    avisar(esNuevo ? `${Nombre} cread${o}` : `${Nombre} actualizad${o}`);
    setEditando(null);
  };

  const eliminar = async () => {
    await crud.eliminar(eliminando.id);
    avisar(`${Nombre} eliminad${o}`);
    setEliminando(null);
  };

  return (
    <>
      <header className="encabezado">
        <div>
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
        {puedeCrear && (
          <button type="button" className="btn btn-primario" onClick={() => setEditando({})}>
            <Icono nombre="mas" tamano={16} />
            {tituloNuevo}
          </button>
        )}
      </header>

      {antesDeTabla}

      <section className="panel glass">
        <div className="herramientas">
          <div className="buscador">
            <Icono nombre="buscar" tamano={16} />
            <label className="sr-only" htmlFor="buscar">
              Buscar
            </label>
            <input
              id="buscar"
              className="campo"
              type="search"
              placeholder="Buscar…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          {filtroExtra}
        </div>
        <DataTable
          columnas={columnas}
          filas={filas}
          cargando={crud.cargando}
          error={crud.error}
          vacio={
            busqueda
              ? 'No hay resultados para tu búsqueda.'
              : `Aún no hay registros.${puedeCrear ? ` Crea ${entidad.articulo} primer${o === 'a' ? 'a' : 'o'}.` : ''}`
          }
          onEditar={puede(`${recurso}.editar`) ? setEditando : undefined}
          onEliminar={puede(`${recurso}.eliminar`) ? setEliminando : undefined}
        />
      </section>

      {editando && (
        <Modal titulo={esNuevo ? tituloNuevo : `Editar ${entidad.singular}`} onCerrar={cerrar}>
          <Formulario
            inicial={editando}
            onGuardar={guardar}
            onCancelar={cerrar}
            textoGuardar={esNuevo ? 'Crear' : 'Guardar cambios'}
            {...propsFormulario}
          />
        </Modal>
      )}

      {eliminando && (
        <ConfirmDialog
          titulo={`¿Eliminar ${describir(eliminando)}?`}
          mensaje="Esta acción no se puede deshacer."
          onConfirmar={eliminar}
          onCancelar={cancelarEliminar}
        />
      )}
    </>
  );
}
