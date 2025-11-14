const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mindrush',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Función para verificar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        console.log(`   Base de datos: ${process.env.DB_NAME || 'mindrush'}`);
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        console.error('   Código de error:', error.code);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   ⚠️  La base de datos no existe. Ejecuta el script database.sql para crearla.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   ⚠️  Error de autenticación. Verifica las credenciales en el archivo .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   ⚠️  No se pudo conectar al servidor MySQL. Asegúrate de que MySQL esté corriendo.');
        }
        return false;
    }
}

module.exports = { pool, testConnection };