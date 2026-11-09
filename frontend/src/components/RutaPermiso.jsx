import { useAuth } from '../context/AuthContext';

/** Muestra la página solo si el usuario tiene el permiso indicado. */
export default function RutaPermiso({ permiso, children }) {
  const { usuario, puede } = useAuth();

  if (!usuario) return <p className="secundario">Cargando…</p>;
  if (!puede(permiso)) {
    return (
      <section className="panel glass" role="alert">
        <h2>No tienes acceso a esta sección</h2>
        <p className="secundario">Si lo necesitas para tu trabajo, solicítalo al administrador del sistema.</p>
      </section>
    );
  }
  return children;
}
