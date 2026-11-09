import { request } from './api';

const rutaPermisos = (usuarioId) => `/usuarios/${usuarioId}/permisos`;

export const permisosService = {
  listarUsuarios: () => request('/usuarios'),
  listarPerfiles: () => request('/perfiles'),
  obtener: (usuarioId) => request(rutaPermisos(usuarioId)),
  cambiar: (usuarioId, codigo, habilitado) =>
    request(`${rutaPermisos(usuarioId)}/${encodeURIComponent(codigo)}`, { method: 'PUT', body: { habilitado } }),
  restablecer: (usuarioId) => request(rutaPermisos(usuarioId), { method: 'DELETE' }),
  cambiarPerfil: ({ id, nombre, correo }, perfilId) =>
    request(`/usuarios/${id}`, { method: 'PUT', body: { nombre, correo, perfilId } }),
};
