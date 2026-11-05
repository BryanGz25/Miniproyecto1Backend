import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { configurarNoAutorizado, tokenStorage } from '../services/api';
import { authService, expiracionDeToken } from '../services/auth.service';

const AuthContext = createContext(null);

// Token guardado y todavía vigente, o null.
const tokenInicial = () => {
  const token = tokenStorage.leer();
  const expira = token && expiracionDeToken(token);
  if (!token || !expira || expira <= Date.now()) {
    tokenStorage.borrar();
    return null;
  }
  return token;
};

/** Estado global de autenticación: token, usuario actual, login, registro y logout. */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenInicial);
  const [usuario, setUsuario] = useState(null);
  const [aviso, setAviso] = useState(null); // mensaje para la pantalla de login

  const logout = useCallback((motivo = null) => {
    tokenStorage.borrar();
    setToken(null);
    setUsuario(null);
    setAviso(motivo);
  }, []);

  // El cliente HTTP avisa aquí cuando la API responde 401 (autologout).
  useEffect(() => {
    configurarNoAutorizado(() => logout('Tu sesión expiró. Inicia sesión de nuevo.'));
  }, [logout]);

  // Con un token guardado, se pide el usuario a /auth/me (si el token ya no sirve, el 401 cierra sesión).
  useEffect(() => {
    if (!token) return undefined;
    authService.me().then(setUsuario).catch(() => {});

    // Cierra la sesión justo cuando vence el token.
    const restante = expiracionDeToken(token) - Date.now();
    const timer = setTimeout(() => logout('Tu sesión expiró. Inicia sesión de nuevo.'), Math.max(restante, 0));
    return () => clearTimeout(timer);
  }, [token, logout]);

  const login = useCallback(async (correo, password) => {
    const respuesta = await authService.login(correo, password);
    tokenStorage.guardar(respuesta.token);
    setUsuario(respuesta.usuario);
    setAviso(null);
    setToken(respuesta.token);
    return respuesta.usuario;
  }, []);

  const registrar = useCallback(
    async ({ nombre, correo, password }) => {
      await authService.registrar({ nombre, correo, password });
      return login(correo, password); // tras registrarse, entra directo
    },
    [login],
  );

  const valor = useMemo(
    () => ({ token, usuario, autenticado: Boolean(token), aviso, login, registrar, logout }),
    [token, usuario, aviso, login, registrar, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
};
