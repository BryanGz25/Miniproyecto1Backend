const { Router } = require('express');

const router = Router();

router.use('/categorias', require('./categorias.routes'));
router.use('/proveedores', require('./proveedores.routes'));
router.use('/productos', require('./productos.routes'));

module.exports = router;
