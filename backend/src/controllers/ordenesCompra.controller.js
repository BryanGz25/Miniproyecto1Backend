// Controlador de la entidad «orden de compra» · área Compras.
// CRUD completo de /api/ordenes-compra: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { PROVEEDOR, BODEGA, USUARIO, ESTADOS_ORDEN, responsable } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.OrdenCompra,
  entidad: { singular: 'orden de compra', articulo: 'la' },
  incluir: [PROVEEDOR, BODEGA, USUARIO],
  orden: [['fecha', 'DESC']],
  alCrear: responsable,
  campos: {
    numero: { tipo: 'texto', requerido: true, max: 20, mayusculas: true },
    proveedorId: { tipo: 'fk', requerido: true, modelo: 'Proveedor', etiqueta: 'el proveedor' },
    bodegaId: { tipo: 'fk', requerido: true, modelo: 'Bodega', etiqueta: 'la bodega' },
    fecha: { tipo: 'fechaHora' },
    estado: { tipo: 'enum', valores: ESTADOS_ORDEN },
    observaciones: { tipo: 'texto', max: 255 },
  },
});
