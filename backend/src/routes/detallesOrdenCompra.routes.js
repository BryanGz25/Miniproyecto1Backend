const { Router } = require('express');
const controller = require('../controllers/detallesOrdenCompra.controller');

// /api/detalles-orden-compra · todas exigen token (authMiddleware se aplica en routes/index.js)
const router = Router();

router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
