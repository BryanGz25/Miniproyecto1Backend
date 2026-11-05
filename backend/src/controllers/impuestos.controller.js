// Controlador de la entidad «impuesto» · área Catálogos de producto.
// CRUD completo de /api/impuestos: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.Impuesto,
  entidad: { singular: 'impuesto', articulo: 'el' },
  orden: [['porcentaje', 'DESC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 60 },
    porcentaje: { tipo: 'decimal', requerido: true, min: 0, max: 100 },
    activo: { tipo: 'booleano' },
  },
});
