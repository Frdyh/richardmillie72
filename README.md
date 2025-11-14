# 🎮 MindRush - Aplicación de Trivia Educativa

Aplicación web de trivia educativa con sistema de usuarios, autenticación y registro de partidas.

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🚀 Configuración del Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

#### Crear el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración de la Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=mindrush
DB_PORT=3306

# Secret para JWT
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui_cambiar_en_produccion

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development
```

**⚠️ Importante:** Reemplaza `tu_contraseña_aqui` con tu contraseña de MySQL y `tu_secret_jwt_muy_seguro_aqui_cambiar_en_produccion` con un string aleatorio seguro.

#### Crear la base de datos y tablas

Ejecuta el script SQL `database.sql` en MySQL:

```bash
mysql -u root -p < database.sql
```

O ejecuta el contenido del archivo `database.sql` en tu cliente de MySQL (phpMyAdmin, MySQL Workbench, etc.).

### 3. Iniciar el servidor

#### Modo desarrollo (con nodemon):

```bash
npm run dev
```

#### Modo producción:

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
jukebox/
├── src/
│   ├── config/          # Configuración de la base de datos
│   ├── controllers/     # Controladores de la lógica de negocio
│   ├── middleware/      # Middlewares (autenticación, etc.)
│   ├── models/          # Modelos de datos
│   ├── public/          # Archivos estáticos (HTML, CSS, JS)
│   │   ├── css/
│   │   ├── views/
│   │   └── *.html
│   └── routes/          # Rutas de la API
├── data/                # Datos JSON (preguntas, etc.)
├── database.sql         # Script para crear la base de datos
├── server.js            # Archivo principal del servidor
└── package.json         # Dependencias del proyecto
```

## 🔧 Solución de Problemas

### El registro no guarda datos en la base de datos

1. **Verifica que MySQL esté corriendo:**
   ```bash
   # En Windows
   net start MySQL
   
   # En Linux/Mac
   sudo service mysql start
   ```

2. **Verifica las credenciales en el archivo `.env`:**
   - Asegúrate de que `DB_USER` y `DB_PASSWORD` sean correctos
   - Verifica que `DB_NAME` exista en MySQL

3. **Verifica que las tablas existan:**
   - Ejecuta el script `database.sql` si no lo has hecho
   - Verifica que la tabla `usuario` exista en la base de datos

4. **Revisa los logs del servidor:**
   - Los errores aparecerán en la consola donde corre el servidor
   - Revisa la consola del navegador (F12) para ver errores del frontend

5. **Verifica que el servidor esté conectado a la base de datos:**
   - Al iniciar el servidor, deberías ver: `✅ Conexión a MySQL exitosa`
   - Si ves un error, revisa la configuración en `.env`

### Error: "La tabla de usuarios no existe"

Ejecuta el script `database.sql` en MySQL para crear las tablas necesarias.

### Error: "No se pudo conectar a la base de datos"

1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que el puerto (por defecto 3306) esté disponible

## 📝 Notas

- El archivo `.env` no debe subirse a Git (ya está en `.gitignore`)
- En producción, usa un `JWT_SECRET` más seguro
- Asegúrate de tener respaldos de la base de datos

## 🎯 Funcionalidades

- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Sistema de partidas
- ✅ Preguntas y respuestas
- ✅ Estadísticas de usuario

## 📞 Soporte

Si tienes problemas, revisa los logs del servidor y la consola del navegador para más detalles sobre los errores.


