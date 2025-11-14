const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

class AuthController {
    // Registro de nuevo usuario
    static async registro(req, res) {
        try {
            const { identificacion, nombres, apellidos, email, contrasena } = req.body;
            
            // Validar campos requeridos
            if (!identificacion || !nombres || !apellidos || !email || !contrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato del email no es válido'
                });
            }
            
            // Validar longitud de contraseña
            if (contrasena.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }
            
            // Verificar si el email ya existe
            const emailExistente = await Usuario.buscarPorEmail(email);
            if (emailExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }
            
            // Verificar si la identificación ya existe
            const identificacionExistente = await Usuario.buscarPorIdentificacion(identificacion);
            if (identificacionExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'La identificación ya está registrada'
                });
            }
            
            // Crear el usuario
            const nuevoUsuario = await Usuario.crear({
                identificacion,
                nombres,
                apellidos,
                email,
                contrasena
            });
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: nuevoUsuario
            });
            
        } catch (error) {
            console.error('Error en registro:', error);
            console.error('Stack trace:', error.stack);
            
            // Mensaje de error más específico
            let mensajeError = 'Error al registrar usuario';
            
            if (error.code === 'ER_NO_SUCH_TABLE') {
                mensajeError = 'La tabla de usuarios no existe en la base de datos';
            } else if (error.code === 'ER_DUP_ENTRY') {
                mensajeError = 'El email o identificación ya están registrados';
            } else if (error.code === 'ECONNREFUSED') {
                mensajeError = 'No se pudo conectar a la base de datos. Verifica la configuración.';
            } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                mensajeError = 'Error de autenticación en la base de datos';
            } else if (error.code === 'ER_BAD_DB_ERROR') {
                mensajeError = 'La base de datos no existe';
            } else if (error.message) {
                mensajeError = error.message;
            }
            
            res.status(500).json({
                success: false,
                message: mensajeError,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: process.env.NODE_ENV === 'development' ? error.code : undefined
            });
        }
    }
    
    // Login de usuario
    static async login(req, res) {
        try {
            const { email, contrasena } = req.body;
            
            // Validar campos
            if (!email || !contrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            
            // Buscar usuario
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Email o contraseña incorrectos'
                });
            }
            
            // Verificar contraseña
            const contrasenaValida = await Usuario.verificarContrasena(
                contrasena,
                usuario.contrasena
            );
            
            if (!contrasenaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Email o contraseña incorrectos'
                });
            }
            
            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    nombres: usuario.nombres
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Obtener estadísticas del usuario
            const estadisticas = await Usuario.obtenerEstadisticas(usuario.id);
            
            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    usuario: {
                        id: usuario.id,
                        identificacion: usuario.identificacion,
                        nombres: usuario.nombres,
                        apellidos: usuario.apellidos,
                        email: usuario.email
                    },
                    estadisticas: estadisticas || {
                        total_partidas: 0,
                        mejor_puntuacion: 0,
                        puntuacion_promedio: 0,
                        total_correctas: 0
                    }
                }
            });
            
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: error.message
            });
        }
    }
    
    // Obtener perfil del usuario autenticado
    static async perfil(req, res) {
        try {
            const usuario = await Usuario.buscarPorId(req.usuario.id);
            
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            const estadisticas = await Usuario.obtenerEstadisticas(usuario.id);
            
            res.json({
                success: true,
                data: {
                    usuario,
                    estadisticas
                }
            });
            
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;