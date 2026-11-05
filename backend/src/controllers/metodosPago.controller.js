// Controlador de la entidad «método de pago» · área Ventas.
// CRUD completo de /api/metodos-pago: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.MetodoPago,
  entidad: { singular: 'método de pago', articulo: 'el' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 40 },
    activo: { tipo: 'booleano' },
  },
});
