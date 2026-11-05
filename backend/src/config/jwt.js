// Configuración de JWT leída de .env. Si falta el secreto, el servidor no arranca.
require('dotenv').config();

const secreto = process.env.JWT_SECRET;
if (!secreto || secreto.length < 32 || secreto.startsWith('cambia-esto')) {
  throw new Error(
    'Falta JWT_SECRET en backend/.env (mínimo 32 caracteres). Genera uno con: ' +
      "node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  );
}

module.exports = {
  secreto,
  expiraEn: process.env.JWT_EXPIRES_IN || '8h',
  algoritmo: 'HS256',
  emisor: 'inventario-api',
  audiencia: 'inventario-web',
};
