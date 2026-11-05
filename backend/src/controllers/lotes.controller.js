// Controlador de la entidad «lote» · área Bodegas e inventario.
// CRUD completo de /api/lotes: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { PRODUCTO } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.Lote,
  entidad: { singular: 'lote', articulo: 'el' },
  incluir: [PRODUCTO],
  orden: [['fechaVencimiento', 'ASC']],
  campos: {
    productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
    codigo: { tipo: 'texto', requerido: true, max: 40, mayusculas: true },
    fechaVencimiento: { tipo: 'fecha' },
    cantidad: { tipo: 'entero', requerido: true, min: 0 },
  },
});
