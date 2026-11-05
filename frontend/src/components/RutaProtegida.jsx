import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Si no hay sesión, redirige a /login y recuerda a qué página se quería entrar. */
export default function RutaProtegida() {
  const { autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}
