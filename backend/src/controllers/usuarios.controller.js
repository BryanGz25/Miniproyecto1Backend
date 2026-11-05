// CRUD de usuarios para la administración. El password se recibe en texto, se guarda como hash
// bcrypt y nunca se devuelve (el modelo lo excluye de todas las consultas y del JSON).
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const { textoRequerido, parsearId } = require('../utils/validaciones');
const { validarCorreo, validarPassword, COSTO_BCRYPT } = require('./authController');

const ORDEN = [['nombre', 'ASC']];

// En PUT el password es opcional: si no viene, se conserva el actual.
const validar = (body = {}, { passwordRequerido }) => {
  const errores = [];
  const datos = {
    nombre: textoRequerido(errores, 'nombre', body.nombre, 100),
    correo: validarCorreo(errores, body.correo),
  };
  if (passwordRequerido || (body.password !== undefined && body.password !== '')) {
    datos.password = validarPassword(errores, body.password);
  }
  return { errores, datos };
};

const conHash = async (datos) => (datos.password ? { ...datos, password: await bcrypt.hash(datos.password, COSTO_BCRYPT) } : datos);

const buscar = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const usuario = await Usuario.findByPk(id);
  if (!usuario) res.status(404).json({ error: `No existe el usuario con id ${id}.` });
  return usuario;
};

// POST /api/usuarios  (correo duplicado → 409 por el índice único)
const crear = async (req, res) => {
  const { errores, datos } = validar(req.body, { passwordRequerido: true });
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  const usuario = await Usuario.create(await conHash(datos));
  return res.status(201).json(await Usuario.findByPk(usuario.id));
};

const listar = async (_req, res) => res.status(200).json(await Usuario.findAll({ order: ORDEN }));

const obtener = async (req, res) => {
  const usuario = await buscar(req, res);
  if (usuario) res.status(200).json(usuario);
};

const actualizar = async (req, res) => {
  const usuario = await buscar(req, res);
  if (!usuario) return;
  const { errores, datos } = validar(req.body, { passwordRequerido: false });
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  await usuario.update(await conHash(datos));
  return res.status(200).json(await Usuario.findByPk(usuario.id));
};

// DELETE /api/usuarios/:id  (no se puede borrar la cuenta con la que se inició sesión)
const eliminar = async (req, res) => {
  const usuario = await buscar(req, res);
  if (!usuario) return;
  if (usuario.id === req.usuario.id) {
    return res.status(409).json({ error: 'No puedes eliminar tu propia cuenta mientras la usas.' });
  }
  await usuario.destroy(); // sus movimientos, órdenes y ventas quedan sin responsable (SET NULL)
  return res.status(200).json({ mensaje: 'Usuario eliminado.', id: usuario.id });
};

module.exports = { crear, listar, obtener, actualizar, eliminar };
