// Verificar si ya hay sesión activa y si es válida
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar si el token es válido
        try {
            const response = await fetch('/api/auth/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // El token es válido, redirigir al menú
                window.location.href = '/menu.html';
            } else {
                // El token no es válido, limpiarlo
                console.log('Token inválido, limpiando sesión...');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('estadisticas');
                mostrarMensajeSesionExpirada();
            }
        } catch (error) {
            // Error al verificar el token, limpiarlo
            console.error('Error al verificar token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('estadisticas');
            mostrarMensajeSesionExpirada();
        }
    }
});

// Función para mostrar mensaje de sesión expirada
function mostrarMensajeSesionExpirada() {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = 'Tu sesión ha expirado. Puedes crear una nueva cuenta o iniciar sesión.';
        alert.className = 'alert alert-error show';
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, 5000);
    }
}

// Botón para limpiar sesión manualmente
document.addEventListener('DOMContentLoaded', () => {
    const limpiarSesionBtn = document.getElementById('limpiarSesion');
    if (limpiarSesionBtn) {
        limpiarSesionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Deseas limpiar la sesión actual? Esto cerrará tu sesión si hay una activa.')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('estadisticas');
                mostrarAlerta('Sesión limpiada correctamente. Puedes crear una nueva cuenta.', 'success');
                // Recargar la página después de limpiar
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        });
    }
});

// Manejo del formulario de registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identificacion = document.getElementById('identificacion').value.trim();
    const nombres = document.getElementById('nombres').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const email = document.getElementById('email').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const registerBtn = document.getElementById('registerBtn');
    
    // Validaciones
    if (!identificacion || !nombres || !apellidos || !email || !contrasena) {
        mostrarAlerta('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (contrasena.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarAlerta('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Deshabilitar botón
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creando cuenta...';
    
    try {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identificacion,
                nombres,
                apellidos,
                email,
                contrasena
            })
        });
        
        const data = await response.json();
        
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            mostrarAlerta('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            const mensajeError = data.message || data.error || 'Error al crear la cuenta';
            console.error('Error del servidor:', mensajeError);
            mostrarAlerta(mensajeError, 'error');
            registerBtn.disabled = false;
            registerBtn.textContent = 'Crear Cuenta';
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        mostrarAlerta('Error de conexión. Verifica que el servidor esté corriendo y que la base de datos esté configurada correctamente.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Crear Cuenta';
    }
});

// Función para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const alert = document.getElementById('alert');
    alert.textContent = mensaje;
    alert.className = `alert alert-${tipo} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}