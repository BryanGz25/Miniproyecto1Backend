// Cliente HTTP base: todas las llamadas a la API pasan por aquí.
// Funciona como "interceptor": agrega el token a cada petición y reacciona a los 401.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TIMEOUT_MS = 10000;
const CLAVE_TOKEN = 'inventario.token';

export class ApiError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

// ---------- Token (localStorage) ----------
export const tokenStorage = {
  leer: () => {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  },
  guardar: (token) => {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
      /* modo privado o almacenamiento bloqueado: la sesión dura lo que la pestaña */
    }
  },
  borrar: () => {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
    } catch {
      /* nada que borrar */
    }
  },
};

// AuthContext registra aquí qué hacer ante un 401 (cerrar sesión e ir a /login).
let alNoAutorizado = () => {};
export const configurarNoAutorizado = (fn) => {
  alNoAutorizado = fn;
};

// En login/registro un 401 significa "credenciales inválidas", no "sesión vencida".
const RUTAS_PUBLICAS = ['/auth/login', '/auth/register'];

/**
 * Hace una petición JSON y devuelve el cuerpo de la respuesta.
 * @param {string} ruta  ej. '/productos'
 * @param {{ method?: string, body?: object }} [opciones]
 */
export async function request(ruta, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = tokenStorage.leer();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const respuesta = await fetch(BASE_URL + ruta, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

    if (respuesta.status === 401 && !RUTAS_PUBLICAS.includes(ruta)) {
      alNoAutorizado(); // autologout
      throw new ApiError(401, 'Tu sesión expiró o no es válida. Inicia sesión de nuevo.');
    }
    // Sin JSON y con 5xx: lo respondió el proxy de Vite porque el backend no está corriendo.
    if (respuesta.status >= 500 && !datos) {
      throw new ApiError(respuesta.status, 'No se pudo conectar con el servidor. Revisa que el backend esté corriendo.');
    }
    if (!respuesta.ok) {
      throw new ApiError(respuesta.status, datos?.error || 'Ocurrió un error inesperado.', datos?.detalles || []);
    }
    return datos;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') throw new ApiError(0, 'El servidor tardó demasiado en responder.');
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté corriendo.');
  } finally {
    clearTimeout(timer);
  }
}

/** Crea las 5 operaciones CRUD para un recurso de la API. */
export const crearServicioCrud = (recurso) => ({
  listar: (query = '') => request(`/${recurso}${query}`),
  obtener: (id) => request(`/${recurso}/${id}`),
  crear: (datos) => request(`/${recurso}`, { method: 'POST', body: datos }),
  actualizar: (id, datos) => request(`/${recurso}/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => request(`/${recurso}/${id}`, { method: 'DELETE' }),
});
