const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// ---------- Públicas ----------
// Registro e inicio de sesión (GET /api/auth/me se protege dentro de authRoutes).
router.use('/auth', require('./authRoutes'));

// ---------- Protegidas: todo lo que sigue exige Authorization: Bearer <token> ----------
router.use(authMiddleware);

// Personal
router.use('/usuarios', require('./usuarios.routes'));
router.use('/departamentos', require('./departamentos.routes'));
router.use('/empleados', require('./empleados.routes'));

// Inventario
router.use('/categorias', require('./categorias.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/movimientos', require('./movimientos.routes'));
router.use('/marcas', require('./marcas.routes'));
router.use('/unidades-medida', require('./unidadesMedida.routes'));
router.use('/impuestos', require('./impuestos.routes'));
router.use('/lotes', require('./lotes.routes'));

// Bodegas
router.use('/bodegas', require('./bodegas.routes'));
router.use('/ubicaciones', require('./ubicaciones.routes'));

// Compras
router.use('/proveedores', require('./proveedores.routes'));
router.use('/contactos-proveedor', require('./contactosProveedor.routes'));
router.use('/ordenes-compra', require('./ordenesCompra.routes'));
router.use('/detalles-orden-compra', require('./detallesOrdenCompra.routes'));

// Ventas
router.use('/clientes', require('./clientes.routes'));
router.use('/metodos-pago', require('./metodosPago.routes'));
router.use('/ventas', require('./ventas.routes'));
router.use('/detalles-venta', require('./detallesVenta.routes'));

// Agentes Inteligentes (Alertas de Inventario por correo y Chatbot Integral)
router.use('/agentes', require('./agentes.routes'));

module.exports = router;
