// Punto de entrada: verifica la conexión a MySQL y levanta el servidor.
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

// API_PORT (y no PORT) porque otras herramientas suelen definir PORT para sí mismas.
const PORT = Number(process.env.API_PORT) || 3000;

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Conectado a MySQL (base de datos: ${sequelize.config.database})`);
    const servidor = app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}/api`));
    servidor.on('error', (error) => {
      const mensaje = error.code === 'EADDRINUSE' ? `El puerto ${PORT} ya está en uso.` : error.message;
      console.error('No se pudo iniciar el servidor:', mensaje);
      process.exit(1);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

iniciar();
