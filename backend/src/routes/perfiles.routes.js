const { Router } = require('express');
const controller = require('../controllers/perfiles.controller');
const { soloAdministrador } = require('../middlewares/permisos');

const router = Router();

router.get('/', soloAdministrador, controller.listar);

module.exports = router;
