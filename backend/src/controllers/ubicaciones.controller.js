// Controlador de la entidad «ubicación» · área Bodegas e inventario.
// CRUD completo de /api/ubicaciones: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { BODEGA } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.Ubicacion,
  entidad: { singular: 'ubicación', articulo: 'la' },
  incluir: [BODEGA],
  orden: [['codigo', 'ASC']],
  campos: {
    bodegaId: { tipo: 'fk', requerido: true, modelo: 'Bodega', etiqueta: 'la bodega' },
    codigo: { tipo: 'texto', requerido: true, max: 30, mayusculas: true },
    descripcion: { tipo: 'texto', max: 255 },
  },
});
