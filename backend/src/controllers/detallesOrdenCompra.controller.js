// Controlador de la entidad «línea de orden» · área Compras.
// CRUD completo de /api/detalles-orden-compra: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { PRODUCTO } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.DetalleOrdenCompra,
  entidad: { singular: 'línea de orden', articulo: 'la' },
  incluir: [{ model: m.OrdenCompra, as: 'ordenCompra', attributes: ['id', 'numero'] }, PRODUCTO],
  campos: {
    ordenCompraId: { tipo: 'fk', requerido: true, modelo: 'OrdenCompra', etiqueta: 'la orden de compra' },
    productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
    cantidad: { tipo: 'entero', requerido: true, min: 1 },
    costoUnitario: { tipo: 'decimal', requerido: true, min: 0 },
  },
});
