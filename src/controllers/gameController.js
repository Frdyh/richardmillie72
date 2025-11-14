const Partida = require('../models/Partida');

class GameController {
    // Guardar resultado de una partida
    static async guardarPartida(req, res) {
        try {
            const { puntuacion, preguntas_correctas, preguntas_totales, vidas_restantes, duracion } = req.body;
            const usuario_id = req.usuario.id;
            
            // Validar datos
            if (puntuacion === undefined || preguntas_correctas === undefined || 
                preguntas_totales === undefined || vidas_restantes === undefined || 
                duracion === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos de la partida'
                });
            }
            
            // Guardar partida
            const partida = await Partida.guardar({
                usuario_id,
                puntuacion: parseInt(puntuacion),
                preguntas_correctas: parseInt(preguntas_correctas),
                preguntas_totales: parseInt(preguntas_totales),
                vidas_restantes: parseInt(vidas_restantes),
                duracion: parseInt(duracion)
            });
            
            res.json({
                success: true,
                message: 'Partida guardada exitosamente',
                data: partida
            });
            
        } catch (error) {
            console.error('Error al guardar partida:', error);
            res.status(500).json({
                success: false,
                message: 'Error al guardar partida',
                error: error.message
            });
        }
    }
    
    // Obtener historial de partidas del usuario
    static async obtenerHistorial(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const limite = parseInt(req.query.limite) || 10;
            
            const historial = await Partida.obtenerPorUsuario(usuario_id, limite);
            
            res.json({
                success: true,
                data: {
                    partidas: historial,
                    total: historial.length
                }
            });
            
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener historial',
                error: error.message
            });
        }
    }
    
    // Obtener ranking global
    static async obtenerRanking(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 10;
            const ranking = await Partida.obtenerRanking(limite);
            
            res.json({
                success: true,
                data: {
                    ranking,
                    total: ranking.length
                }
            });
            
        } catch (error) {
            console.error('Error al obtener ranking:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener ranking',
                error: error.message
            });
        }
    }
    
    // Obtener mejor puntuación del usuario
    static async obtenerMejorPuntuacion(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const mejorPuntuacion = await Partida.mejorPuntuacion(usuario_id);
            
            res.json({
                success: true,
                data: {
                    mejor_puntuacion: mejorPuntuacion
                }
            });
            
        } catch (error) {
            console.error('Error al obtener mejor puntuación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener mejor puntuación',
                error: error.message
            });
        }
    }
}

module.exports = GameController;