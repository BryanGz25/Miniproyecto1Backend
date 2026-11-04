import Sidebar from './components/Sidebar';
import { AvisosProvider } from './components/Avisos';
import { useRuta } from './hooks/useRuta';
import ResumenPage from './pages/ResumenPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import MovimientosPage from './pages/MovimientosPage';

const PAGINAS = {
  resumen: ResumenPage,
  productos: ProductosPage,
  categorias: CategoriasPage,
  proveedores: ProveedoresPage,
  movimientos: MovimientosPage,
};

export default function App() {
  const ruta = useRuta();
  const Pagina = PAGINAS[ruta] ?? ResumenPage;

  return (
    <AvisosProvider>
      <div className="layout">
        <Sidebar rutaActual={PAGINAS[ruta] ? ruta : 'resumen'} />
        <main className="contenido">
          <Pagina key={ruta} />
        </main>
      </div>
    </AvisosProvider>
  );
}
