// CRUD de usuarios para la administración. El password se recibe en texto, se guarda como hash
// bcrypt y nunca se devuelve (el modelo lo excluye de todas las consultas y del JSON).
const bcrypt = require('bcrypt');
const { Usuario, Perfil, UsuarioPermiso, sequelize } = require('../models');
const { textoRequerido, parsearId, idValido } = require('../utils/validaciones');
const { validarCorreo, validarPassword, COSTO_BCRYPT } = require('./authController');
const { idPerfilPorDefecto } = require('../services/acceso.service');

const ORDEN = [['nombre', 'ASC']];
const CON_PERFIL = [{ model: Perfil, as: 'perfil', attributes: ['id', 'nombre'] }];

const validarPerfil = async (errores, perfilId) => {
  if (!idValido(perfilId) || !(await Perfil.findByPk(perfilId))) {
    errores.push("El campo 'perfilId' no corresponde a un perfil existente.");
  }
};

// En PUT el password y el perfil son opcionales: si no vienen, se conservan los actuales.
const validar = async (body = {}, { passwordRequerido }) => {
  const errores = [];
  const datos = {
    nombre: textoRequerido(errores, 'nombre', body.nombre, 100),
    correo: validarCorreo(errores, body.correo),
  };
  if (passwordRequerido || (body.password !== undefined && body.password !== '')) {
    datos.password = validarPassword(errores, body.password);
  }
  if (body.perfilId !== undefined && body.perfilId !== null) {
    await validarPerfil(errores, body.perfilId);
    datos.perfilId = body.perfilId;
  }
  return { errores, datos };
};

const conHash = async (datos) => (datos.password ? { ...datos, password: await bcrypt.hash(datos.password, COSTO_BCRYPT) } : datos);

const cargar = (id) => Usuario.findByPk(id, { include: CON_PERFIL });

const buscar = async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return null;
  }
  const usuario = await cargar(id);
  if (!usuario) res.status(404).json({ error: `No existe el usuario con id ${id}.` });
  return usuario;
};

// POST /api/usuarios  (correo duplicado → 409 por el índice único)
const crear = async (req, res) => {
  const { errores, datos } = await validar(req.body, { passwordRequerido: true });
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  const perfilId = datos.perfilId ?? (await idPerfilPorDefecto());
  const usuario = await Usuario.create(await conHash({ ...datos, perfilId }));
  return res.status(201).json(await cargar(usuario.id));
};

const listar = async (_req, res) => res.status(200).json(await Usuario.findAll({ order: ORDEN, include: CON_PERFIL }));

const obtener = async (req, res) => {
  const usuario = await buscar(req, res);
  if (usuario) res.status(200).json(usuario);
};

// PUT /api/usuarios/:id  (al cambiar de perfil se descartan sus excepciones de permisos)
const actualizar = async (req, res) => {
  const usuario = await buscar(req, res);
  if (!usuario) return;
  const { errores, datos } = await validar(req.body, { passwordRequerido: false });
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const cambiaPerfil = datos.perfilId !== undefined && datos.perfilId !== usuario.perfilId;
  if (cambiaPerfil && usuario.id === req.usuario.id) {
    return res.status(409).json({ error: 'No puedes cambiar tu propio perfil.' });
  }

  const cambios = await conHash(datos);
  await sequelize.transaction(async (transaction) => {
    await usuario.update(cambios, { transaction });
    if (cambiaPerfil) await UsuarioPermiso.destroy({ where: { usuarioId: usuario.id }, transaction });
  });
  return res.status(200).json(await cargar(usuario.id));
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
