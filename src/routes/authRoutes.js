const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/registro', AuthController.registro);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/perfil', verificarToken, AuthController.perfil);

module.exports = router;