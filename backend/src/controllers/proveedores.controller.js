const { Proveedor } = require('../models');
const { textoRequerido, textoOpcional, booleanoOpcional, parsearId } = require('../utils/validaciones');

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_VALIDO = /^[0-9+\-\s()]{7,20}$/;

const validarProveedor = (body = {}) => {
  const errores = [];
  const datos = {
    nombre: textoRequerido(errores, 'nombre', body.nombre, 120),
    identificacion: textoRequerido(errores, 'identificacion', body.identificacion, 20),
    telefono: textoOpcional(errores, 'telefono', body.telefono, 20),
    email: textoOpcional(errores, 'email', body.email, 120)?.toLowerCase() ?? null,
    direccion: textoOpcional(errores, 'direccion', body.direccion, 255),
    activo: booleanoOpcional(errores, 'activo', body.activo),
  };

  if (datos.email && !EMAIL_VALIDO.test(datos.email)) errores.push("El campo 'email' no tiene un formato válido.");
  if (datos.telefono && !TELEFONO_VALIDO.test(datos.telefono)) {
    errores.push("El campo 'telefono' solo admite números, espacios, +, - y paréntesis.");
  }
  if (datos.activo === undefined) delete datos.activo;

  return { errores, datos };
};

const buscarPorId = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const proveedor = await Proveedor.findByPk(id);
  if (!proveedor) {
    res.status(404).json({ error: `No existe el proveedor con id ${id}.` });
    return null;
  }
  return proveedor;
};

// POST /api/proveedores
const crear = async (req, res) => {
  const { errores, datos } = validarProveedor(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const proveedor = await Proveedor.create(datos);
  return res.status(201).json(proveedor);
};

// GET /api/proveedores
const listar = async (_req, res) => {
  const proveedores = await Proveedor.findAll({ order: [['nombre', 'ASC']] });
  return res.status(200).json(proveedores);
};

// GET /api/proveedores/:id
const obtener = async (req, res) => {
  const proveedor = await buscarPorId(req, res);
  if (proveedor) res.status(200).json(proveedor);
};

// PUT /api/proveedores/:id
const actualizar = async (req, res) => {
  const proveedor = await buscarPorId(req, res);
  if (!proveedor) return;

  const { errores, datos } = validarProveedor(req.body);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  await proveedor.update(datos);
  return res.status(200).json(proveedor);
};

// DELETE /api/proveedores/:id  (sus productos quedan sin proveedor: FK SET NULL)
const eliminar = async (req, res) => {
  const proveedor = await buscarPorId(req, res);
  if (!proveedor) return;

  await proveedor.destroy();
  return res.status(200).json({ mensaje: 'Proveedor eliminado.', id: proveedor.id });
};

module.exports = { crear, listar, obtener, actualizar, eliminar };
