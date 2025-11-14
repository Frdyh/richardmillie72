const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/questionController');
const { verificarToken } = require('../middleware/authMiddleware');

// Todas las rutas de preguntas requieren autenticación
router.use(verificarToken);

router.get('/aleatorias', QuestionController.obtenerPreguntasAleatorias);
router.get('/categorias', QuestionController.obtenerCategorias);

module.exports = router;