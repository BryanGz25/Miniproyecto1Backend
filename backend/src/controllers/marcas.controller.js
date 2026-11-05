// Controlador de la entidad «marca» · área Catálogos de producto.
// CRUD completo de /api/marcas: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.Marca,
  entidad: { singular: 'marca', articulo: 'la' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 80 },
    paisOrigen: { tipo: 'texto', max: 60 },
  },
});
