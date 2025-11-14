// src/middleware/errorHandler.js
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

// Errores específicos
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Error de base de datos') {
        super(message, 500, false);
    }
}

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
    // Log del error
    console.error('❌ Error:', {
        message: err.message,
        statusCode: err.statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: err.timestamp,
        path: req.path,
        method: req.method
    });

    // Si el error ya fue enviado, no hacer nada
    if (res.headersSent) {
        return next(err);
    }

    // Errores de base de datos MySQL
    if (err.code) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un registro con esos datos',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                message: 'Error de configuración de base de datos',
                error: process.env.NODE_ENV === 'development' ? 'Tabla no existe' : undefined
            });
        }

        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Servicio temporalmente no disponible',
                error: process.env.NODE_ENV === 'development' ? 'No se puede conectar a la BD' : undefined
            });
        }
    }

    // Errores de aplicación
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // Errores inesperados
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Wrapper para funciones async
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    errorHandler,
    asyncHandler
};