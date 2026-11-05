const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// Públicas: registro e inicio de sesión (GET /api/auth/me se protege dentro de authRoutes).
router.use('/auth', require('./authRoutes'));

// Todo lo que sigue exige Authorization: Bearer <token>.
router.use(authMiddleware);
router.use('/categorias', require('./categorias.routes'));
router.use('/proveedores', require('./proveedores.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/movimientos', require('./movimientos.routes'));

module.exports = router;
