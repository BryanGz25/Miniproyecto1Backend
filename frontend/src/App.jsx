import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AvisosProvider } from './components/Avisos';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ResumenPage from './pages/ResumenPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import MovimientosPage from './pages/MovimientosPage';
import { PAGINAS_ADMIN } from './pages/admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AvisosProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Protegidas: sin token redirigen a /login */}
            <Route element={<RutaProtegida />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/resumen" replace />} />
                <Route path="/resumen" element={<ResumenPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
                <Route path="/proveedores" element={<ProveedoresPage />} />
                <Route path="/movimientos" element={<MovimientosPage />} />
                {/* 16 vistas de administración (catálogos, bodegas, compras, ventas, personal y usuarios) */}
                {Object.entries(PAGINAS_ADMIN).map(([ruta, Pagina]) => (
                  <Route key={ruta} path={`/${ruta}`} element={<Pagina />} />
                ))}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AvisosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
