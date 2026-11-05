const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { crearRutasCrud } = require('../controllers/crudFactory');

const router = Router();

// Públicas: registro e inicio de sesión (GET /api/auth/me se protege dentro de authRoutes).
router.use('/auth', require('./authRoutes'));

// Todo lo que sigue exige Authorization: Bearer <token>.
router.use(authMiddleware);

// Entidades del Día 1 (controladores propios: stock con transacciones, validaciones específicas).
router.use('/categorias', require('./categorias.routes'));
router.use('/proveedores', require('./proveedores.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/movimientos', require('./movimientos.routes'));
router.use('/usuarios', crearRutasCrud(require('../controllers/usuarios.controller')));

// 15 entidades de administración: catálogos, bodegas, compras, ventas y personal.
router.use(require('./entidades.routes'));

module.exports = router;
