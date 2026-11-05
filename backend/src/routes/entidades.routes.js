const { Router } = require('express');
const controllers = require('../controllers/entidades.controller');
const { crearRutasCrud } = require('../controllers/crudFactory');

// Monta /api/marcas, /api/bodegas, /api/ventas… (un router CRUD por entidad).
const router = Router();
for (const [recurso, controller] of Object.entries(controllers)) {
  router.use(`/${recurso}`, crearRutasCrud(controller));
}

module.exports = router;
