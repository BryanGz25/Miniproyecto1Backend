import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AvisosProvider } from './components/Avisos';
import Layout from './components/Layout';
import RutaPermiso from './components/RutaPermiso';
import RutaProtegida from './components/RutaProtegida';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ResumenPage from './pages/ResumenPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import MovimientosPage from './pages/MovimientosPage';
import AlertasInventarioPage from './pages/AlertasInventarioPage';
import PermisosPage from './pages/admin/PermisosPage';
import { PAGINAS_ADMIN } from './pages/admin';

// Cada página exige el permiso "<ruta>.ver", salvo las que indican otro.
const PAGINAS = [
  ['alertas-inventario', AlertasInventarioPage, 'alertas.ver'],
  ['permisos', PermisosPage, 'permisos.administrar'], // no está en el catálogo: solo el Administrador
  ['productos', ProductosPage],
  ['categorias', CategoriasPage],
  ['proveedores', ProveedoresPage],
  ['movimientos', MovimientosPage],
  ...Object.entries(PAGINAS_ADMIN), // catálogos, bodegas, compras, ventas, personal y usuarios
];

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
                {PAGINAS.map(([ruta, Pagina, permiso = `${ruta}.ver`]) => (
                  <Route
                    key={ruta}
                    path={`/${ruta}`}
                    element={
                      <RutaPermiso permiso={permiso}>
                        <Pagina />
                      </RutaPermiso>
                    }
                  />
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
