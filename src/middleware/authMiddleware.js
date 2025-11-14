const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    try {
        // Obtener token del header o cookies
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }
        
        // Verificar que JWT_SECRET esté configurado
        if (!process.env.JWT_SECRET) {
            console.error('⚠️  JWT_SECRET no está configurado en el archivo .env');
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }
        
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar información del usuario al request
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            nombres: decoded.nombres
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error al verificar token'
        });
    }
};

module.exports = { verificarToken };