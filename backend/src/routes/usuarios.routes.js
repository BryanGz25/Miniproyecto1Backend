const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const permisos = require('../controllers/permisosUsuario.controller');
const { requierePermiso, soloAdministrador } = require('../middlewares/permisos');

// /api/usuarios · todas exigen token (authMiddleware se aplica en routes/index.js).
// Modificar cuentas y permisos es exclusivo del Administrador: quien edita un usuario puede
// cambiarle la contraseña, así que delegarlo permitiría escalar privilegios.
const router = Router();

router.post('/', soloAdministrador, controller.crear);
router.get('/', requierePermiso('usuarios.ver'), controller.listar);
router.get('/:id', requierePermiso('usuarios.ver'), controller.obtener);
router.put('/:id', soloAdministrador, controller.actualizar);
router.delete('/:id', soloAdministrador, controller.eliminar);

// Habilitar y deshabilitar permisos de un usuario
router.get('/:id/permisos', soloAdministrador, permisos.obtener);
router.put('/:id/permisos/:codigo', soloAdministrador, permisos.cambiar);
router.delete('/:id/permisos', soloAdministrador, permisos.restablecer);

module.exports = router;
