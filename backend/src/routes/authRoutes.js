const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.post('/register', authController.register); // público
router.post('/login', authController.login); // público
router.get('/me', authMiddleware, authController.me); // protegido

module.exports = router;
