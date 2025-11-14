const express = require('express');
const router = express.Router();
const GameController = require('../controllers/gameController');
const { verificarToken } = require('../middleware/authMiddleware');

// Todas las rutas de juego requieren autenticación
router.use(verificarToken);

router.post('/guardar', GameController.guardarPartida);
router.get('/historial', GameController.obtenerHistorial);
router.get('/ranking', GameController.obtenerRanking);
router.get('/mejor-puntuacion', GameController.obtenerMejorPuntuacion);

module.exports = router;