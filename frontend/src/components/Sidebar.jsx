import Icono from './Icono';

export const SECCIONES = [
  { ruta: 'resumen', titulo: 'Resumen', icono: 'resumen' },
  { ruta: 'productos', titulo: 'Productos', icono: 'caja' },
  { ruta: 'categorias', titulo: 'Categorías', icono: 'etiqueta' },
  { ruta: 'proveedores', titulo: 'Proveedores', icono: 'camion' },
  { ruta: 'movimientos', titulo: 'Movimientos', icono: 'flechas' },
];

export default function Sidebar({ rutaActual }) {
  return (
    <aside className="sidebar glass">
      <div className="marca">
        <Icono nombre="caja" tamano={22} />
        Inventario
      </div>
      <nav className="nav" aria-label="Secciones">
        {SECCIONES.map(({ ruta, titulo, icono }) => (
          <a key={ruta} href={`#/${ruta}`} aria-current={rutaActual === ruta ? 'page' : undefined}>
            <Icono nombre={icono} />
            {titulo}
          </a>
        ))}
      </nav>
    </aside>
  );
}
