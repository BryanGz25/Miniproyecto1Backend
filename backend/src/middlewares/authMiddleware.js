const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const jwtConfig = require('../config/jwt');

const NO_AUTORIZADO = { error: 'No autorizado' };

/**
 * Exige `Authorization: Bearer <token>` válido. Si todo está bien deja el usuario en req.usuario.
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

  const usuario = await Usuario.findByPk(Number(payload.sub));
  if (!usuario) return res.status(401).json(NO_AUTORIZADO);

  req.usuario = usuario;
  return next();
};

module.exports = authMiddleware;
