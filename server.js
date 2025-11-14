const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const questionRoutes = require('./src/routes/questionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/questions', questionRoutes);

// Ruta raíz redirige al login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
async function iniciarServidor() {
    try {
        // Verificar conexión a la base de datos
        const conexionExitosa = await testConnection();
        
        if (!conexionExitosa) {
            console.error('❌ No se pudo conectar a la base de datos');
            process.exit(1);
        }
        
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║         🎮 MINDRUSH SERVER 🎮          ║
╠════════════════════════════════════════╣
║  Puerto: ${PORT}                          ║
║  Entorno: ${process.env.NODE_ENV}                  ║
║  URL: http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();  