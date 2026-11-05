const {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError,
  DatabaseError,
} = require('sequelize');

// 404 para rutas que no existen.
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Traduce los errores conocidos a respuestas JSON claras; el resto es 500 sin filtrar detalles internos.
// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err instanceof UniqueConstraintError) {
    const campos = Object.keys(err.fields || {}).join(', ');
    return res.status(409).json({ error: `Ya existe un registro con ese valor en: ${campos}.` });
  }
  if (err instanceof ForeignKeyConstraintError) {
    // MySQL indica la tabla que depende de este registro: "... constraint fails (`bd`.`DetallesVenta`, ..."
    const tabla = /`[^`]+`\.`([^`]+)`/.exec(err.parent?.sqlMessage || '')?.[1];
    const dependientes = tabla ? tabla.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase() : 'otros registros';
    return res.status(409).json({
      error: `No se puede eliminar porque tiene ${dependientes} asociados. Elimínalos o reasígnalos primero.`,
    });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: err.errors.map((e) => e.message) });
  }
  if (err instanceof DatabaseError && err.parent?.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ error: 'Los datos violan una regla de negocio (valores negativos o en cero).' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
};

module.exports = { rutaNoEncontrada, manejadorErrores };
