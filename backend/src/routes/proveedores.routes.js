const { Router } = require('express');
const controller = require('../controllers/proveedores.controller');

const router = Router();

router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
