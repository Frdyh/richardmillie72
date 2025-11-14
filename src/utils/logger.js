// src/utils/logger.js
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, '../../logs');
        this.ensureLogsDir();
    }

    ensureLogsDir() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        }) + '\n';
    }

    writeToFile(filename, content) {
        const filepath = path.join(this.logsDir, filename);
        fs.appendFileSync(filepath, content, 'utf8');
    }

    info(message, meta = {}) {
        const log = this.formatMessage('INFO', message, meta);
        console.log(`ℹ️  ${message}`, meta);
        this.writeToFile('app.log', log);
    }

    error(message, error, meta = {}) {
        const log = this.formatMessage('ERROR', message, {
            ...meta,
            error: error?.message,
            stack: error?.stack
        });
        console.error(`❌ ${message}`, error);
        this.writeToFile('error.log', log);
    }

    warn(message, meta = {}) {
        const log = this.formatMessage('WARN', message, meta);
        console.warn(`⚠️  ${message}`, meta);
        this.writeToFile('app.log', log);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            const log = this.formatMessage('DEBUG', message, meta);
            console.debug(`🔍 ${message}`, meta);
            this.writeToFile('debug.log', log);
        }
    }

    // Log de auditoría para acciones importantes
    audit(action, userId, details = {}) {
        const log = this.formatMessage('AUDIT', action, {
            userId,
            ...details
        });
        this.writeToFile('audit.log', log);
    }

    // Log de peticiones HTTP
    request(req, res) {
        const log = this.formatMessage('REQUEST', 'HTTP Request', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.usuario?.id,
            statusCode: res.statusCode,
            responseTime: res.get('X-Response-Time')
        });
        this.writeToFile('access.log', log);
    }
}

// Middleware para logging de requests
const requestLogger = (logger) => (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        res.set('X-Response-Time', `${duration}ms`);
        logger.request(req, res);
    });
    
    next();
};

module.exports = { Logger, requestLogger };