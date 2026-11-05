// Controlador de la entidad «cliente» · área Ventas.
// CRUD completo de /api/clientes: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.Cliente,
  entidad: { singular: 'cliente', articulo: 'el' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 120 },
    identificacion: { tipo: 'texto', requerido: true, max: 20 },
    telefono: { tipo: 'telefono' },
    email: { tipo: 'email' },
    direccion: { tipo: 'texto', max: 255 },
  },
});
