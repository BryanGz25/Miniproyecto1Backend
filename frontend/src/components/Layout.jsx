import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/** Estructura de las páginas protegidas: menú lateral + contenido. */
export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
