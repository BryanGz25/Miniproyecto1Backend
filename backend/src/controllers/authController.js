const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { Usuario } = require('../models');
const jwtConfig = require('../config/jwt');
const { textoRequerido } = require('../utils/validaciones');

const COSTO_BCRYPT = 12;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CORREO_DUPLICADO = 'El correo ya está registrado.';
const CREDENCIALES_INVALIDAS = 'Credenciales inválidas.';

// Hash ficticio: si el correo no existe se compara igual, para que el tiempo de respuesta no lo delate.
const HASH_FICTICIO = bcrypt.hashSync('contraseña-que-nadie-usa', COSTO_BCRYPT);

const validarCorreo = (errores, valor) => {
  const correo = textoRequerido(errores, 'correo', valor, 120)?.toLowerCase();
  if (correo && !EMAIL_VALIDO.test(correo)) errores.push("El campo 'correo' no tiene un formato válido.");
  return correo;
};

const validarPassword = (errores, valor) => {
  if (typeof valor !== 'string' || valor.length === 0) {
    errores.push("El campo 'password' es obligatorio.");
  } else if (valor.length < 8) {
    errores.push("El campo 'password' debe tener al menos 8 caracteres.");
  } else if (valor.length > 72) {
    errores.push("El campo 'password' admite máximo 72 caracteres."); // límite de bcrypt
  }
  return valor;
};

const firmarToken = (usuario) =>
  jwt.sign({ sub: String(usuario.id), nombre: usuario.nombre }, jwtConfig.secreto, {
    algorithm: jwtConfig.algoritmo,
    expiresIn: jwtConfig.expiraEn,
    issuer: jwtConfig.emisor,
    audience: jwtConfig.audiencia,
  });

// POST /api/auth/register  (público)
const register = async (req, res) => {
  const errores = [];
  const nombre = textoRequerido(errores, 'nombre', req.body?.nombre, 100);
  const correo = validarCorreo(errores, req.body?.correo);
  const password = validarPassword(errores, req.body?.password);
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  if (await Usuario.findOne({ where: { correo } })) {
    return res.status(400).json({ error: CORREO_DUPLICADO, detalles: [CORREO_DUPLICADO] });
  }

  try {
    const hash = await bcrypt.hash(password, COSTO_BCRYPT);
    const usuario = await Usuario.create({ nombre, correo, password: hash });
    return res.status(201).json(usuario); // toJSON() omite el password
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ error: CORREO_DUPLICADO, detalles: [CORREO_DUPLICADO] });
    }
    throw error;
  }
};

// POST /api/auth/login  (público)
const login = async (req, res) => {
  const { correo, password } = req.body ?? {};
  if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: ['Correo y password son obligatorios.'] });
  }

  const usuario = await Usuario.scope('conPassword').findOne({ where: { correo: correo.trim().toLowerCase() } });
  const coincide = await bcrypt.compare(password, usuario?.password ?? HASH_FICTICIO);

  // Mismo 401 si el correo no existe o la contraseña no coincide: no se revela cuál falló.
  if (!usuario || !coincide) return res.status(401).json({ error: CREDENCIALES_INVALIDAS });

  return res.status(200).json({ token: firmarToken(usuario), usuario, expiraEn: jwtConfig.expiraEn });
};

// GET /api/auth/me  (protegido)
const me = (req, res) => res.status(200).json(req.usuario);

module.exports = { register, login, me };
