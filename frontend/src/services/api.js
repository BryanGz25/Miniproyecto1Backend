// Cliente HTTP base: todas las llamadas a la API pasan por aquí.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

/**
 * Hace una petición JSON y devuelve el cuerpo de la respuesta.
 * @param {string} ruta  ej. '/productos'
 * @param {{ method?: string, body?: object }} [opciones]
 */
export async function request(ruta, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(BASE_URL + ruta, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

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
