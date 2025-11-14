const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
    // Crear un nuevo usuario
    static async crear(datos) {
        try {
            const { identificacion, nombres, apellidos, email, contrasena } = datos;
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const contrasenaHash = await bcrypt.hash(contrasena, salt);
            
            const query = `
                INSERT INTO usuario (identificacion, nombres, apellidos, email, contrasena)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const [result] = await pool.execute(query, [
                identificacion,
                nombres,
                apellidos,
                email,
                contrasenaHash
            ]);
            
            return {
                id: result.insertId,
                identificacion,
                nombres,
                apellidos,
                email
            };
        } catch (error) {
            throw error;
        }
    }
    
    // Buscar usuario por email
    static async buscarPorEmail(email) {
        try {
            const query = 'SELECT * FROM usuario WHERE email = ?';
            const [rows] = await pool.execute(query, [email]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    // Buscar usuario por identificación
    static async buscarPorIdentificacion(identificacion) {
        try {
            const query = 'SELECT * FROM usuario WHERE identificacion = ?';
            const [rows] = await pool.execute(query, [identificacion]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    // Buscar usuario por ID
    static async buscarPorId(id) {
        try {
            const query = 'SELECT id, identificacion, nombres, apellidos, email, fecha_registro FROM usuario WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    // Verificar contraseña
    static async verificarContrasena(contrasenaPlana, contrasenaHash) {
        return await bcrypt.compare(contrasenaPlana, contrasenaHash);
    }
    
    // Obtener estadísticas del usuario
    static async obtenerEstadisticas(usuarioId) {
        try {
            const query = `
                SELECT 
                    u.nombres,
                    u.apellidos,
                    COUNT(p.id) as total_partidas,
                    COALESCE(MAX(p.puntuacion), 0) as mejor_puntuacion,
                    COALESCE(AVG(p.puntuacion), 0) as puntuacion_promedio,
                    COALESCE(SUM(p.preguntas_correctas), 0) as total_correctas
                FROM usuario u
                LEFT JOIN partida p ON u.id = p.usuario_id
                WHERE u.id = ?
                GROUP BY u.id, u.nombres, u.apellidos
            `;
            
            const [rows] = await pool.execute(query, [usuarioId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Usuario;