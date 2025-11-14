// src/config/env.js
require('dotenv').config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
    console.error('⚠️  Crea un archivo .env con las variables requeridas');
    process.exit(1);
}

// Validar JWT_SECRET
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET debe tener al menos 32 caracteres para mayor seguridad');
}

const config = {
    // Servidor
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Base de datos
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
        waitForConnections: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // Seguridad
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15 * 60 * 1000 // 15 min
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    
    // Frontend
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    // Features flags
    features: {
        enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
        enablePasswordReset: process.env.ENABLE_PASSWORD_RESET === 'true',
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true'
    },
    
    // Juego
    game: {
        maxPreguntas: parseInt(process.env.MAX_PREGUNTAS) || 100,
        minPreguntas: parseInt(process.env.MIN_PREGUNTAS) || 5,
        defaultPreguntas: parseInt(process.env.DEFAULT_PREGUNTAS) || 10,
        tiempoLimite: parseInt(process.env.TIEMPO_LIMITE) || 30,
        vidasIniciales: parseInt(process.env.VIDAS_INICIALES) || 3,
        puntosCorrecta: parseInt(process.env.PUNTOS_CORRECTA) || 100,
        puntosIncorrecta: parseInt(process.env.PUNTOS_INCORRECTA) || 0
    }
};

// Validaciones adicionales
if (config.game.maxPreguntas < config.game.minPreguntas) {
    console.warn('⚠️  MAX_PREGUNTAS debe ser mayor que MIN_PREGUNTAS');
}

if (config.security.bcryptRounds < 10 || config.security.bcryptRounds > 15) {
    console.warn('⚠️  BCRYPT_ROUNDS recomendado: 10-15');
}

// Mostrar configuración en desarrollo
if (config.nodeEnv === 'development') {
    console.log('🔧 Configuración cargada:');
    console.log(`   - Entorno: ${config.nodeEnv}`);
    console.log(`   - Puerto: ${config.port}`);
    console.log(`   - Base de datos: ${config.database.database}`);
    console.log(`   - JWT expira en: ${config.jwt.expiresIn}`);
}

module.exports = config;