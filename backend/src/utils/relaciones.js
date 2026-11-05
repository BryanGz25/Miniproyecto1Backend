// Piezas compartidas por los controladores de administración:
// qué datos relacionados se devuelven junto a cada registro y valores permitidos de los estados.
const m = require('../models');

const PRODUCTO = { model: m.Producto, as: 'producto', attributes: ['id', 'sku', 'nombre'] };
const PROVEEDOR = { model: m.Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };
const BODEGA = { model: m.Bodega, as: 'bodega', attributes: ['id', 'nombre'] };
const USUARIO = { model: m.Usuario, as: 'usuario', attributes: ['id', 'nombre'] };

const ESTADOS_ORDEN = ['BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA'];
const ESTADOS_VENTA = ['PENDIENTE', 'PAGADA', 'ANULADA'];

// El usuario del token queda registrado como responsable del documento.
const responsable = (req) => ({ usuarioId: req.usuario.id });

module.exports = { PRODUCTO, PROVEEDOR, BODEGA, USUARIO, ESTADOS_ORDEN, ESTADOS_VENTA, responsable };
