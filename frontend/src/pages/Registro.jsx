import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { useFormulario } from '../hooks/useFormulario';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Las mismas reglas que valida el backend, para avisar antes de enviar.
const validar = (v) => {
  const errores = [];
  if (!v.nombre.trim()) errores.push('Escribe tu nombre.');
  if (!EMAIL_VALIDO.test(v.correo.trim())) errores.push('Escribe un correo válido.');
  if (v.password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');
  if (v.password.length > 72) errores.push('La contraseña admite máximo 72 caracteres.');
  if (v.password !== v.confirmar) errores.push('Las contraseñas no coinciden.');
  return errores;
};

export default function Registro() {
  const { autenticado, registrar } = useAuth();
  const navigate = useNavigate();
  const { valores, cambiar, errores, enviando, enviar } = useFormulario(
    { nombre: '', correo: '', password: '', confirmar: '' },
    { validar },
  );

  if (autenticado) return <Navigate to="/" replace />;

  const crearCuenta = async ({ nombre, correo, password }) => {
    await registrar({ nombre: nombre.trim(), correo: correo.trim(), password });
    navigate('/', { replace: true });
  };

  return (
    <AuthLayout
      titulo="Crear cuenta"
      subtitulo="Regístrate para empezar a usar el sistema"
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      {errores.length > 0 && (
        <div className="alerta-form" role="alert">
          <ul>
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={enviar(crearCuenta)} noValidate className="auth-form">
        <Campo etiqueta="Nombre">
          {(id) => <input id={id} name="nombre" autoComplete="name" maxLength={100} className="campo" value={valores.nombre} onChange={cambiar} placeholder="Ana Rodríguez" />}
        </Campo>
        <Campo etiqueta="Correo">
          {(id) => <input id={id} name="correo" type="email" autoComplete="email" maxLength={120} className="campo" value={valores.correo} onChange={cambiar} placeholder="ana@empresa.cr" />}
        </Campo>
        <Campo etiqueta="Contraseña" ayuda="Mínimo 8 caracteres">
          {(id) => <input id={id} name="password" type="password" autoComplete="new-password" maxLength={72} className="campo" value={valores.password} onChange={cambiar} />}
        </Campo>
        <Campo etiqueta="Confirmar contraseña">
          {(id) => <input id={id} name="confirmar" type="password" autoComplete="new-password" maxLength={72} className="campo" value={valores.confirmar} onChange={cambiar} />}
        </Campo>
        <button type="submit" className="btn btn-primario auth-boton" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
