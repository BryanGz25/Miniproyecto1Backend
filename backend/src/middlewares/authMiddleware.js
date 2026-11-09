const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const jwtConfig = require('../config/jwt');
const { INCLUDE_ACCESO, accesoDe } = require('../services/acceso.service');

const NO_AUTORIZADO = { error: 'No autorizado' };

/**
 * Exige `Authorization: Bearer <token>` válido. Si todo está bien deja req.usuario y req.acceso.
 * Cualquier fallo (sin token, firma inválida, vencido, usuario borrado) responde 401 genérico.
 */
const authMiddleware = async (req, res, next) => {
  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) return res.status(401).json(NO_AUTORIZADO);

  let payload;
  try {
    payload = jwt.verify(token, jwtConfig.secreto, {
      algorithms: [jwtConfig.algoritmo], // lista blanca: bloquea alg "none" y confusión de algoritmos
      issuer: jwtConfig.emisor,
      audience: jwtConfig.audiencia,
    });
  } catch {
    return res.status(401).json(NO_AUTORIZADO);
  }

  // Los permisos se leen de la BD en cada petición: un cambio del administrador aplica al instante.
  const usuario = await Usuario.findByPk(Number(payload.sub), { include: INCLUDE_ACCESO });
  if (!usuario) return res.status(401).json(NO_AUTORIZADO);

  req.usuario = usuario;
  req.acceso = accesoDe(usuario);
  return next();
};

module.exports = authMiddleware;
