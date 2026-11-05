// Controlador de la entidad «línea de venta» · área Ventas.
// CRUD completo de /api/detalles-venta: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { PRODUCTO } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.DetalleVenta,
  entidad: { singular: 'línea de venta', articulo: 'la' },
  incluir: [{ model: m.Venta, as: 'venta', attributes: ['id', 'numero'] }, PRODUCTO],
  campos: {
    ventaId: { tipo: 'fk', requerido: true, modelo: 'Venta', etiqueta: 'la venta' },
    productoId: { tipo: 'fk', requerido: true, modelo: 'Producto', etiqueta: 'el producto' },
    cantidad: { tipo: 'entero', requerido: true, min: 1 },
    precioUnitario: { tipo: 'decimal', requerido: true, min: 0 },
    descuento: { tipo: 'decimal', min: 0, max: 100, defecto: 0 },
  },
});
