import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { useFormulario } from '../hooks/useFormulario';

const validar = (v) => {
  const errores = [];
  if (!v.correo.trim()) errores.push('Escribe tu correo.');
  if (!v.password) errores.push('Escribe tu contraseña.');
  return errores;
};

export default function Login() {
  const { autenticado, login, aviso } = useAuth();
  const navigate = useNavigate();
  const destino = useLocation().state?.desde || '/';
  const { valores, cambiar, errores, enviando, enviar } = useFormulario({ correo: '', password: '' }, { validar });

  if (autenticado) return <Navigate to={destino} replace />;

  const entrar = async ({ correo, password }) => {
    await login(correo.trim(), password);
    navigate(destino, { replace: true });
  };

  return (
    <AuthLayout
      titulo="Iniciar sesión"
      subtitulo="Entra para gestionar tu inventario"
      pie={
        <>
          ¿No tienes cuenta? <Link to="/registro">Crea una</Link>
        </>
      }
    >
      {aviso && errores.length === 0 && (
        <div className="aviso-info" role="status">
          {aviso}
        </div>
      )}
      {errores.length > 0 && (
        <div className="alerta-form" role="alert">
          {errores.join(' ')}
        </div>
      )}
      <form onSubmit={enviar(entrar)} noValidate className="auth-form">
        <Campo etiqueta="Correo">
          {(id) => (
            <input id={id} name="correo" type="email" autoComplete="email" className="campo" value={valores.correo} onChange={cambiar} placeholder="ana@empresa.cr" />
          )}
        </Campo>
        <Campo etiqueta="Contraseña">
          {(id) => (
            <input id={id} name="password" type="password" autoComplete="current-password" className="campo" value={valores.password} onChange={cambiar} />
          )}
        </Campo>
        <button type="submit" className="btn btn-primario auth-boton" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
