// Configuración de Express: middlewares, rutas y manejo de errores.
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errores');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

// Datos privados de cada usuario: se revalidan siempre. Si no cambiaron, Express responde 304 por su ETag.
app.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-cache');
  next();
});

app.get('/api/health', (_req, res) => res.status(200).json({ estado: 'ok' }));
app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
