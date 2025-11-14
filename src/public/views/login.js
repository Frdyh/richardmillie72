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
        alert.textContent = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
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
                mostrarAlerta('Sesión limpiada correctamente. Puedes iniciar sesión nuevamente.', 'success');
                // Recargar la página después de limpiar
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        });
    }
});

// Manejo del formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const loginBtn = document.getElementById('loginBtn');
    const alert = document.getElementById('alert');
    
    // Validaciones básicas
    if (!email || !contrasena) {
        mostrarAlerta('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Deshabilitar botón
    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, contrasena })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
            localStorage.setItem('estadisticas', JSON.stringify(data.data.estadisticas));
            
            mostrarAlerta('¡Bienvenido! Redirigiendo...', 'success');
            
            // Redirigir al menú principal
            setTimeout(() => {
                window.location.href = '/menu.html';
            }, 1000);
        } else {
            mostrarAlerta(data.message || 'Error al iniciar sesión', 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión. Intenta nuevamente', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
    }
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const alert = document.getElementById('alert');
    alert.textContent = mensaje;
    alert.className = `alert alert-${tipo} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}