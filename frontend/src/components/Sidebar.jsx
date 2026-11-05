import { NavLink } from 'react-router-dom';
import Icono from './Icono';
import { useAuth } from '../context/AuthContext';

export const SECCIONES = [
  { ruta: '/resumen', titulo: 'Resumen', icono: 'resumen' },
  { ruta: '/productos', titulo: 'Productos', icono: 'caja' },
  { ruta: '/categorias', titulo: 'Categorías', icono: 'etiqueta' },
  { ruta: '/proveedores', titulo: 'Proveedores', icono: 'camion' },
  { ruta: '/movimientos', titulo: 'Movimientos', icono: 'flechas' },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();

  return (
    <aside className="sidebar glass">
      <div className="marca">
        <Icono nombre="caja" tamano={22} />
        Inventario
      </div>
      <nav className="nav" aria-label="Secciones">
        {SECCIONES.map(({ ruta, titulo, icono }) => (
          <NavLink key={ruta} to={ruta}>
            <Icono nombre={icono} />
            {titulo}
          </NavLink>
        ))}
      </nav>
      <div className="sesion">
        <div className="sesion-usuario">
          <span className="avatar" aria-hidden="true">
            {(usuario?.nombre ?? '?').charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="sesion-nombre">{usuario?.nombre ?? 'Cargando…'}</p>
            <p className="sesion-correo">{usuario?.correo}</p>
          </div>
        </div>
        <button type="button" className="btn sesion-salir" onClick={() => logout('Cerraste sesión.')}>
          <Icono nombre="salir" tamano={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
