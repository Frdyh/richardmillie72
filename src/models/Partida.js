const { pool } = require('../config/database');

class Partida {
    // Guardar una nueva partida
    static async guardar(datos) {
        try {
            const { 
                usuario_id, 
                puntuacion, 
                preguntas_correctas,
                preguntas_totales,
                vidas_restantes, 
                duracion 
            } = datos;
            
            const query = `
                INSERT INTO partida 
                (usuario_id, puntuacion, preguntas_correctas, preguntas_totales, vidas_restantes, duracion)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await pool.execute(query, [
                usuario_id,
                puntuacion,
                preguntas_correctas,
                preguntas_totales,
                vidas_restantes,
                duracion
            ]);
            
            return {
                id: result.insertId,
                ...datos
            };
        } catch (error) {
            throw error;
        }
    }
    
    // Obtener historial de partidas de un usuario
    static async obtenerPorUsuario(usuarioId, limite = 10) {
        try {
            const query = `
                SELECT 
                    id,
                    puntuacion,
                    preguntas_correctas,
                    preguntas_totales,
                    vidas_restantes,
                    duracion,
                    DATE_FORMAT(fecha, '%d/%m/%Y %H:%i') as fecha_formateada,
                    fecha
                FROM partida
                WHERE usuario_id = ?
                ORDER BY fecha DESC
                LIMIT ?
            `;
            
            const [rows] = await pool.execute(query, [usuarioId, limite]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
    
    // Obtener la mejor puntuación de un usuario
    static async mejorPuntuacion(usuarioId) {
        try {
            const query = `
                SELECT MAX(puntuacion) as mejor_puntuacion
                FROM partida
                WHERE usuario_id = ?
            `;
            
            const [rows] = await pool.execute(query, [usuarioId]);
            return rows[0]?.mejor_puntuacion || 0;
        } catch (error) {
            throw error;
        }
    }
    
    // Obtener ranking global (top 10)
    static async obtenerRanking(limite = 10) {
        try {
            const query = `
                SELECT 
                    u.nombres,
                    u.apellidos,
                    MAX(p.puntuacion) as mejor_puntuacion,
                    COUNT(p.id) as total_partidas
                FROM usuario u
                INNER JOIN partida p ON u.id = p.usuario_id
                GROUP BY u.id, u.nombres, u.apellidos
                ORDER BY mejor_puntuacion DESC
                LIMIT ?
            `;
            
            const [rows] = await pool.execute(query, [limite]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Partida;