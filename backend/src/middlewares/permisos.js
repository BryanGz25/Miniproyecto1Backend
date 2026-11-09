// Autorización. Se usa siempre después de authMiddleware, que deja req.acceso.
// Sin permiso se responde igual que una ruta inexistente: el endpoint queda oculto para ese usuario.
const { rutaNoEncontrada } = require('./errores');

const ACCION_POR_METODO = { GET: 'ver', HEAD: 'ver', POST: 'crear', PUT: 'editar', DELETE: 'eliminar' };

/** Exige un permiso concreto, ej. requierePermiso('alertas.enviar'). */
const requierePermiso = (codigo) => (req, res, next) => (req.acceso.puede(codigo) ? next() : rutaNoEncontrada(req, res));

/** Para un CRUD: deduce la acción del método HTTP. Un método no contemplado no existe. */
const permisoDeRecurso = (recurso) => (req, res, next) => {
  const accion = ACCION_POR_METODO[req.method];
  if (!accion) return rutaNoEncontrada(req, res);
  return requierePermiso(`${recurso}.${accion}`)(req, res, next);
};

const soloAdministrador = (req, res, next) => (req.acceso.esAdministrador ? next() : rutaNoEncontrada(req, res));

module.exports = { requierePermiso, permisoDeRecurso, soloAdministrador };
