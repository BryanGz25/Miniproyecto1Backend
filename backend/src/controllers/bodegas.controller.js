// Controlador de la entidad «bodega» · área Bodegas e inventario.
// CRUD completo de /api/bodegas: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');

module.exports = crearControladorCrud({
  modelo: m.Bodega,
  entidad: { singular: 'bodega', articulo: 'la' },
  orden: [['nombre', 'ASC']],
  campos: {
    nombre: { tipo: 'texto', requerido: true, max: 80 },
    direccion: { tipo: 'texto', max: 255 },
    telefono: { tipo: 'telefono' },
    activa: { tipo: 'booleano' },
  },
});
