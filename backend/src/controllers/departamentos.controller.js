// Controlador de la entidad «departamento» · área Personal.
// CRUD completo de /api/departamentos: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.Departamento,
  entidad: { singular: 'departamento', articulo: 'el' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 80 },
    descripcion: { tipo: 'texto', max: 255 },
  },
});
