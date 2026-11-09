const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { permisoDeRecurso } = require('../middlewares/permisos');

const router = Router();

// ---------- Públicas ----------
// Registro e inicio de sesión (GET /api/auth/me se protege dentro de authRoutes).
router.use('/auth', require('./authRoutes'));

// ---------- Protegidas: todo lo que sigue exige Authorization: Bearer <token> ----------
router.use(authMiddleware);

// CRUD protegido por permisos "<recurso>.<ver|crear|editar|eliminar>".
const crud = (recurso, rutas) => router.use(`/${recurso}`, permisoDeRecurso(recurso), rutas);

// Personal (usuarios y perfiles definen sus reglas en su propio archivo)
router.use('/usuarios', require('./usuarios.routes'));
router.use('/perfiles', require('./perfiles.routes'));
crud('departamentos', require('./departamentos.routes'));
crud('empleados', require('./empleados.routes'));

// Inventario
crud('categorias', require('./categorias.routes'));
crud('productos', require('./productos.routes'));
crud('movimientos', require('./movimientos.routes'));
crud('marcas', require('./marcas.routes'));
crud('unidades-medida', require('./unidadesMedida.routes'));
crud('impuestos', require('./impuestos.routes'));
crud('lotes', require('./lotes.routes'));

// Bodegas
crud('bodegas', require('./bodegas.routes'));
crud('ubicaciones', require('./ubicaciones.routes'));

// Compras
crud('proveedores', require('./proveedores.routes'));
crud('contactos-proveedor', require('./contactosProveedor.routes'));
crud('ordenes-compra', require('./ordenesCompra.routes'));
crud('detalles-orden-compra', require('./detallesOrdenCompra.routes'));

// Ventas
crud('clientes', require('./clientes.routes'));
crud('metodos-pago', require('./metodosPago.routes'));
crud('ventas', require('./ventas.routes'));
crud('detalles-venta', require('./detallesVenta.routes'));

// Agentes Inteligentes (Alertas de Inventario por correo y Chatbot Integral)
router.use('/agentes', require('./agentes.routes'));

module.exports = router;
