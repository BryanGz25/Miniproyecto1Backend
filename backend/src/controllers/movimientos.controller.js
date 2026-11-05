const { MovimientoStock, Producto, Usuario, sequelize } = require('../models');
const { textoOpcional, numeroNoNegativo, idValido, parsearId } = require('../utils/validaciones');

const TIPOS = ['ENTRADA', 'SALIDA', 'AJUSTE'];

// ENTRADA suma al stock; SALIDA y AJUSTE (merma, daño, pérdida) restan.
const efectoEnStock = ({ tipo, cantidad }) => (tipo === 'ENTRADA' ? cantidad : -cantidad);

const INCLUIR_PRODUCTO = [
  { model: Producto, as: 'producto', attributes: ['id', 'sku', 'nombre', 'stockActual'] },
  { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }, // quién registró el movimiento
];

// Error de negocio que se responde con un código HTTP concreto.
class ErrorNegocio extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const validarMovimiento = (body = {}) => {
  const errores = [];
  const datos = {
    productoId: body.productoId,
    tipo: typeof body.tipo === 'string' ? body.tipo.trim().toUpperCase() : body.tipo,
    cantidad: numeroNoNegativo(errores, 'cantidad', body.cantidad, { entero: true }),
    costoUnitario: numeroNoNegativo(errores, 'costoUnitario', body.costoUnitario, { requerido: false }) ?? null,
    motivo: textoOpcional(errores, 'motivo', body.motivo, 255),
  };

  if (!idValido(datos.productoId)) errores.push("El campo 'productoId' es obligatorio y debe ser un entero positivo.");
  if (!TIPOS.includes(datos.tipo)) errores.push(`El campo 'tipo' debe ser uno de: ${TIPOS.join(', ')}.`);
  if (datos.cantidad === 0) errores.push("El campo 'cantidad' debe ser mayor que 0.");

  if (body.fecha !== undefined && body.fecha !== null && body.fecha !== '') {
    const fecha = new Date(body.fecha);
    if (typeof body.fecha !== 'string' || Number.isNaN(fecha.getTime())) {
      errores.push("El campo 'fecha' debe ser una fecha válida (ej. 2026-11-04 o 2026-11-04T10:30).");
    } else {
      datos.fecha = fecha;
    }
  }

  return { errores, datos };
};

// Suma `delta` al stock del producto dentro de la transacción, bloqueando la fila.
const moverStock = async (productoId, delta, transaction) => {
  const producto = await Producto.findByPk(productoId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!producto) throw new ErrorNegocio(400, `No existe el producto con id ${productoId}.`);

  const nuevoStock = producto.stockActual + delta;
  if (nuevoStock < 0) {
    throw new ErrorNegocio(
      409,
      `Stock insuficiente para "${producto.nombre}": hay ${producto.stockActual} y el movimiento requiere ${-delta}.`,
    );
  }
  await producto.update({ stockActual: nuevoStock }, { transaction });
};

const responderError = (res, error) => {
  if (error instanceof ErrorNegocio) return res.status(error.status).json({ error: error.message });
  throw error; // lo atrapa el middleware de errores
};

// POST /api/movimientos
const crear = async (req, res) => {
  const { errores, datos } = validarMovimiento(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  try {
    const id = await sequelize.transaction(async (transaction) => {
      await moverStock(datos.productoId, efectoEnStock(datos), transaction);
      const movimiento = await MovimientoStock.create({ ...datos, usuarioId: req.usuario.id }, { transaction });
      return movimiento.id;
    });
    const movimiento = await MovimientoStock.findByPk(id, { include: INCLUIR_PRODUCTO });
    return res.status(201).json(movimiento);
  } catch (error) {
    return responderError(res, error);
  }
};

// GET /api/movimientos  (opcional: ?productoId=1)
const listar = async (req, res) => {
  const where = {};
  if (req.query.productoId !== undefined) {
    const productoId = parsearId(req.query.productoId);
    if (!productoId) return res.status(400).json({ error: 'productoId debe ser un entero positivo.' });
    where.productoId = productoId;
  }
  const movimientos = await MovimientoStock.findAll({
    where,
    include: INCLUIR_PRODUCTO,
    order: [['fecha', 'DESC'], ['id', 'DESC']],
  });
  return res.status(200).json(movimientos);
};

// GET /api/movimientos/:id
const obtener = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });

  const movimiento = await MovimientoStock.findByPk(id, { include: INCLUIR_PRODUCTO });
  if (!movimiento) return res.status(404).json({ error: `No existe el movimiento con id ${id}.` });
  return res.status(200).json(movimiento);
};

// PUT /api/movimientos/:id  (revierte el efecto anterior y aplica el nuevo)
const actualizar = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });

  const { errores, datos } = validarMovimiento(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  try {
    const encontrado = await sequelize.transaction(async (transaction) => {
      const movimiento = await MovimientoStock.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!movimiento) return false;

      await moverStock(movimiento.productoId, -efectoEnStock(movimiento), transaction);
      await moverStock(datos.productoId, efectoEnStock(datos), transaction);
      await movimiento.update(datos, { transaction });
      return true;
    });
    if (!encontrado) return res.status(404).json({ error: `No existe el movimiento con id ${id}.` });

    const movimiento = await MovimientoStock.findByPk(id, { include: INCLUIR_PRODUCTO });
    return res.status(200).json(movimiento);
  } catch (error) {
    return responderError(res, error);
  }
};

// DELETE /api/movimientos/:id  (revierte su efecto en el stock)
const eliminar = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });

  try {
    const encontrado = await sequelize.transaction(async (transaction) => {
      const movimiento = await MovimientoStock.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!movimiento) return false;

      await moverStock(movimiento.productoId, -efectoEnStock(movimiento), transaction);
      await movimiento.destroy({ transaction });
      return true;
    });
    if (!encontrado) return res.status(404).json({ error: `No existe el movimiento con id ${id}.` });
    return res.status(200).json({ mensaje: 'Movimiento eliminado y stock revertido.', id });
  } catch (error) {
    return responderError(res, error);
  }
};

module.exports = { crear, listar, obtener, actualizar, eliminar };
