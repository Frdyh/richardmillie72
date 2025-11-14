// src/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiter para login/registro (prevenir fuerza bruta)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        success: false,
        message: 'Demasiados intentos. Intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Identificar por IP y email
    keyGenerator: (req) => {
        return req.body?.email || req.ip;
    }
});

// Rate limiter general para API
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 peticiones por minuto
    message: {
        success: false,
        message: 'Demasiadas peticiones. Intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter para juego (evitar trampas)
const gameLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // máximo 10 partidas guardadas por minuto
    message: {
        success: false,
        message: 'Espera un momento antes de guardar otra partida'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Configuración de Helmet para seguridad HTTP
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Sanitización de datos de entrada
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        // Eliminar campos potencialmente peligrosos
        delete req.body.__proto__;
        delete req.body.constructor;
        
        // Sanitizar strings
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Eliminar caracteres peligrosos
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
        });
    }
    next();
};

// Middleware para prevenir SQL injection básico
const preventSQLInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
        /(;|\-\-|\/\*|\*\/)/g,
        /('|(\\'))/g
    ];
    
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        return false;
    };
    
    // Verificar body
    if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
            if (checkValue(value)) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos'
                });
            }
        }
    }
    
    // Verificar query params
    if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
            if (checkValue(value)) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetros de consulta inválidos'
                });
            }
        }
    }
    
    next();
};

// CORS configuración más estricta
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        // Permitir requests sin origin (mobile apps, Postman, etc)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = {
    authLimiter,
    apiLimiter,
    gameLimiter,
    helmetConfig,
    sanitizeInput,
    preventSQLInjection,
    corsOptions
};