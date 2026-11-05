import { NavLink } from 'react-router-dom';
import Icono from './Icono';
import { useAuth } from '../context/AuthContext';

// Menú agrupado por área. Cada enlace es un CRUD (salvo Resumen): 20 en total.
export const MENU = [
  { grupo: null, enlaces: [['/resumen', 'Resumen', 'resumen']] },
  {
    grupo: 'Inventario',
    enlaces: [
      ['/productos', 'Productos', 'caja'],
      ['/categorias', 'Categorías', 'etiqueta'],
      ['/marcas', 'Marcas', 'estrella'],
      ['/unidades-medida', 'Unidades de medida', 'regla'],
      ['/impuestos', 'Impuestos', 'porcentaje'],
      ['/lotes', 'Lotes', 'calendario'],
      ['/movimientos', 'Movimientos', 'flechas'],
    ],
  },
  {
    grupo: 'Bodegas',
    enlaces: [
      ['/bodegas', 'Bodegas', 'almacen'],
      ['/ubicaciones', 'Ubicaciones', 'pin'],
    ],
  },
  {
    grupo: 'Compras',
    enlaces: [
      ['/proveedores', 'Proveedores', 'camion'],
      ['/contactos-proveedor', 'Contactos', 'contacto'],
      ['/ordenes-compra', 'Órdenes de compra', 'documento'],
      ['/detalles-orden-compra', 'Detalle de órdenes', 'lista'],
    ],
  },
  {
    grupo: 'Ventas',
    enlaces: [
      ['/clientes', 'Clientes', 'persona'],
      ['/metodos-pago', 'Métodos de pago', 'tarjeta'],
      ['/ventas', 'Ventas', 'recibo'],
      ['/detalles-venta', 'Detalle de ventas', 'lista'],
    ],
  },
  {
    grupo: 'Personal',
    enlaces: [
      ['/departamentos', 'Departamentos', 'edificio'],
      ['/empleados', 'Empleados', 'persona'],
      ['/usuarios', 'Usuarios', 'usuarios'],
    ],
  },
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
        {MENU.map(({ grupo, enlaces }) => (
          <div key={grupo ?? 'general'} className="nav-grupo">
            {grupo && <p className="nav-titulo">{grupo}</p>}
            {enlaces.map(([ruta, titulo, icono]) => (
              <NavLink key={ruta} to={ruta}>
                <Icono nombre={icono} />
                {titulo}
              </NavLink>
            ))}
          </div>
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
