// Controlador de la entidad «unidad de medida» · área Catálogos de producto.
// CRUD completo de /api/unidades-medida: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.UnidadMedida,
  entidad: { singular: 'unidad de medida', articulo: 'la' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 40 },
    abreviatura: { tipo: 'texto', requerido: true, max: 10 },
  },
});
 