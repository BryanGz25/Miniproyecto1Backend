import { useEffect, useMemo, useState } from 'react';
import { useAvisos } from '../../components/Avisos';
import { useAuth } from '../../context/AuthContext';
import { permisosService } from '../../services/permisos.service';
import { normalizar } from '../../utils/formato';

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// [{ grupo, recursos: [{ recurso, permisos: [...] }] }] conservando el orden del catálogo.
const agrupar = (permisos) => {
  const grupos = new Map();
  for (const permiso of permisos) {
    if (!grupos.has(permiso.grupo)) grupos.set(permiso.grupo, new Map());
    const recursos = grupos.get(permiso.grupo);
    if (!recursos.has(permiso.recurso)) recursos.set(permiso.recurso, []);
    recursos.get(permiso.recurso).push(permiso);
  }
  return [...grupos].map(([grupo, recursos]) => ({
    grupo,
    recursos: [...recursos].map(([recurso, lista]) => ({ recurso, permisos: lista })),
  }));
};

function Interruptor({ permiso, recurso, deshabilitado, onCambiar }) {
  const personalizado = permiso.personalizado !== null;
  const accion = capitalizar(permiso.accion);
  return (
    <label className="interruptor" title={personalizado ? 'Ajustado para este usuario' : 'Según su perfil'}>
      <input
        type="checkbox"
        checked={permiso.habilitado}
        disabled={deshabilitado}
        aria-label={`${accion}: ${recurso}`}
        onChange={(e) => onCambiar(permiso.codigo, e.target.checked)}
      />
      <span className="interruptor-pista" aria-hidden="true" />
      <span>
        {accion}
        {personalizado && <span className="interruptor-marca"> *</span>}
      </span>
    </label>
  );
}

/** El administrador elige un usuario y le habilita o deshabilita permisos. */
export default function PermisosPage() {
  const avisar = useAvisos();
  const { usuario: sesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([permisosService.listarUsuarios(), permisosService.listarPerfiles()])
      .then(([listaUsuarios, listaPerfiles]) => {
        setUsuarios(listaUsuarios);
        setPerfiles(listaPerfiles);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!seleccionado) return undefined;
    let vigente = true;
    setDetalle(null);
    permisosService
      .obtener(seleccionado)
      .then((datos) => vigente && setDetalle(datos))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [seleccionado]);

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda);
    return usuarios.filter((u) => !texto || normalizar(`${u.nombre} ${u.correo}`).includes(texto));
  }, [usuarios, busqueda]);

  const grupos = useMemo(() => (detalle ? agrupar(detalle.permisos) : []), [detalle]);
  const hayPersonalizados = detalle?.permisos.some((p) => p.personalizado !== null);

  // Las acciones se aplican de a una; un clic durante un guardado se ignora.
  const ejecutar = async (accion, mensaje) => {
    if (guardando) return;
    setGuardando(true);
    try {
      setDetalle(await accion());
      if (mensaje) avisar(mensaje);
    } catch (err) {
      avisar(err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPermiso = (codigo, habilitado) =>
    ejecutar(() => permisosService.cambiar(seleccionado, codigo, habilitado), habilitado ? 'Permiso habilitado' : 'Permiso deshabilitado');

  const restablecer = () => ejecutar(() => permisosService.restablecer(seleccionado), 'Permisos restablecidos según el perfil');

  const cambiarPerfil = (perfilId) =>
    ejecutar(async () => {
      const actualizado = await permisosService.cambiarPerfil(detalle.usuario, Number(perfilId));
      setUsuarios((lista) => lista.map((u) => (u.id === actualizado.id ? actualizado : u)));
      return permisosService.obtener(actualizado.id);
    }, 'Perfil actualizado');

  return (
    <>
      <header className="encabezado">
        <div>
          <h1>Permisos</h1>
          <p>Habilita o deshabilita lo que puede hacer cada usuario</p>
        </div>
      </header>

      {error && <div className="panel glass error-carga" role="alert">{error}</div>}

      <div className="permisos-grid">
        <section className="panel glass">
          <h2>Usuarios</h2>
          <label className="sr-only" htmlFor="buscar-usuario">Buscar usuario</label>
          <input
            id="buscar-usuario"
            className="campo"
            type="search"
            placeholder="Buscar…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <ul className="permisos-usuarios">
            {visibles.map((u) => (
              <li key={u.id}>
                <button type="button" aria-current={u.id === seleccionado ? 'true' : undefined} onClick={() => setSeleccionado(u.id)}>
                  <span className="permisos-usuario-nombre">{u.nombre}</span>
                  <span className="secundario">{u.perfil?.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel glass">
          {!seleccionado && <p className="secundario">Selecciona un usuario para ver sus permisos.</p>}
          {seleccionado && !detalle && !error && <p className="secundario">Cargando…</p>}
          {detalle && (
            <>
              <div className="permisos-cabecera">
                <div>
                  <h2>{detalle.usuario.nombre}</h2>
                  <p className="secundario">{detalle.usuario.correo}</p>
                </div>
                <div className="permisos-controles">
                  <label className="sr-only" htmlFor="perfil-usuario">Perfil del usuario</label>
                  <select
                    id="perfil-usuario"
                    className="campo campo-filtro"
                    value={detalle.usuario.perfil.id}
                    disabled={detalle.usuario.id === sesion.id}
                    onChange={(e) => cambiarPerfil(e.target.value)}
                  >
                    {perfiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {detalle.editable && (
                    <button type="button" className="btn" disabled={!hayPersonalizados} onClick={restablecer}>
                      Restablecer perfil
                    </button>
                  )}
                </div>
              </div>

              <p className="secundario permisos-nota">
                {detalle.motivoNoEditable ?? '* Ajustado para este usuario: difiere de su perfil. Al cambiar de perfil se quitan estos ajustes.'}
              </p>

              {grupos.map(({ grupo, recursos }) => (
                <div key={grupo} className="permisos-grupo">
                  <h3>{grupo}</h3>
                  {recursos.map(({ recurso, permisos }) => (
                    <div key={recurso} className="permiso-fila">
                      <span>{recurso}</span>
                      <div className="permiso-acciones">
                        {permisos.map((permiso) => (
                          <Interruptor
                            key={permiso.codigo}
                            permiso={permiso}
                            recurso={recurso}
                            deshabilitado={!detalle.editable}
                            onCambiar={cambiarPermiso}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </>
  );
}
