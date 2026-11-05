// Controlador de la entidad «venta» · área Ventas.
// CRUD completo de /api/ventas: crear, listar (con filtros por clave foránea), ver, actualizar y eliminar.
// La validación de cada campo y las respuestas 400/404/409 las arma crudFactory a partir de esta descripción.
const m = require('../models');
const { crearControladorCrud } = require('./crudFactory');
const { USUARIO, ESTADOS_VENTA, responsable } = require('../utils/relaciones');

module.exports = crearControladorCrud({
  modelo: m.Venta,
  entidad: { singular: 'venta', articulo: 'la' },
  incluir: [
    { model: m.Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
    { model: m.MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
    USUARIO,
  ],
  orden: [['fecha', 'DESC']],
  alCrear: responsable,
  campos: {
    numero: { tipo: 'texto', requerido: true, max: 20, mayusculas: true },
    clienteId: { tipo: 'fk', requerido: true, modelo: 'Cliente', etiqueta: 'el cliente' },
    metodoPagoId: { tipo: 'fk', requerido: true, modelo: 'MetodoPago', etiqueta: 'el método de pago' },
    fecha: { tipo: 'fechaHora' },
    estado: { tipo: 'enum', valores: ESTADOS_VENTA },
    observaciones: { tipo: 'texto', max: 255 },
  },
});
