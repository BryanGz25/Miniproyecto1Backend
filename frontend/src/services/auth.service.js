import { request } from './api';

export const authService = {
  registrar: (datos) => request('/auth/register', { method: 'POST', body: datos }),
  login: (correo, password) => request('/auth/login', { method: 'POST', body: { correo, password } }),
  me: () => request('/auth/me'),
};

/** Lee el `exp` del token (en milisegundos) sin verificar la firma; la verificación real la hace el backend. */
export const expiracionDeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};
