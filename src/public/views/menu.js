// Verificar autenticación
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    // Verificar si el token es válido
    try {
        const response = await fetch('/api/auth/perfil', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            // Token inválido o expirado
            console.error('Token inválido o expirado');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('estadisticas');
            alert('Tu sesión ha expirado. Serás redirigido al login.');
            window.location.href = '/login.html';
            return;
        }
        
        // Token válido, cargar datos del usuario
        cargarDatosUsuario();
    } catch (error) {
        console.error('Error al verificar token:', error);
        // Si hay error (servidor no disponible, etc.), intentar cargar datos del localStorage
        // pero permitir que el usuario pueda usar la aplicación con datos locales
        cargarDatosUsuario();
    }
});

// Cargar datos del usuario
function cargarDatosUsuario() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const estadisticas = JSON.parse(localStorage.getItem('estadisticas') || '{}');
        
        // Mostrar nombre del usuario
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = usuario.nombres || 'Jugador';
        }
        
        // Mostrar estadísticas
        const totalPartidasElement = document.getElementById('totalPartidas');
        const mejorPuntuacionElement = document.getElementById('mejorPuntuacion');
        const promedioElement = document.getElementById('promedio');
        const totalCorrectasElement = document.getElementById('totalCorrectas');
        
        if (totalPartidasElement) {
            totalPartidasElement.textContent = estadisticas.total_partidas || 0;
        }
        if (mejorPuntuacionElement) {
            mejorPuntuacionElement.textContent = estadisticas.mejor_puntuacion || 0;
        }
        if (promedioElement) {
            promedioElement.textContent = Math.round(estadisticas.puntuacion_promedio || 0);
        }
        if (totalCorrectasElement) {
            totalCorrectasElement.textContent = estadisticas.total_correctas || 0;
        }
        
        // Registrar eventos de botones después de cargar los datos
        registrarEventosBotones();
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        registrarEventosBotones();
    }
}

// Registrar eventos de los botones
function registrarEventosBotones() {
    // Botón de jugar
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = '/game.html';
        });
    }
    
    // Botón de historial
    const historialBtn = document.getElementById('historialBtn');
    if (historialBtn) {
        historialBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const modal = document.getElementById('historialModal');
            const content = document.getElementById('historialContent');
            
            if (!modal || !content) {
                console.error('Elementos del modal de historial no encontrados');
                return;
            }
            
            content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando historial...</p></div>';
            modal.style.display = 'block';
            
            try {
                const response = await fetch('/api/game/historial?limite=10', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.partidas && data.data.partidas.length > 0) {
                    content.innerHTML = data.data.partidas.map((partida, index) => `
                        <div style="background: var(--dark-card); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid var(--primary-color);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--primary-light); font-size: 1.5em; font-weight: 700;">
                                        ${partida.puntuacion || 0} pts
                                    </div>
                                    <div style="color: var(--text-secondary); font-size: 0.9em; margin-top: 5px;">
                                        ${partida.preguntas_correctas || 0}/${partida.preguntas_totales || 0} correctas
                                    </div>
                                    <div style="color: var(--text-secondary); font-size: 0.85em; margin-top: 3px;">
                                        ⏱️ ${partida.duracion || 0}s | ❤️ ${partida.vidas_restantes || 0} vidas
                                    </div>
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.85em; text-align: right;">
                                    ${partida.fecha_formateada || 'Fecha no disponible'}
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    content.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay partidas registradas aún. ¡Comienza a jugar!</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                content.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 20px;">Error al cargar el historial. Verifica tu conexión.</p>';
            }
        });
    }
    
    // Botón de ranking
    const rankingBtn = document.getElementById('rankingBtn');
    if (rankingBtn) {
        rankingBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const modal = document.getElementById('rankingModal');
            const content = document.getElementById('rankingContent');
            
            if (!modal || !content) {
                console.error('Elementos del modal de ranking no encontrados');
                return;
            }
            
            content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando ranking...</p></div>';
            modal.style.display = 'block';
            
            try {
                const response = await fetch('/api/game/ranking?limite=10', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.ranking && data.data.ranking.length > 0) {
                    content.innerHTML = data.data.ranking.map((jugador, index) => {
                        const medallas = ['🥇', '🥈', '🥉'];
                        const medalla = medallas[index] || `${index + 1}º`;
                        
                        return `
                            <div style="background: var(--dark-card); padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="font-size: 1.5em;">${medalla}</div>
                                    <div>
                                        <div style="color: var(--text-primary); font-weight: 600;">
                                            ${jugador.nombres || ''} ${jugador.apellidos || ''}
                                        </div>
                                        <div style="color: var(--text-secondary); font-size: 0.85em;">
                                            ${jugador.total_partidas || 0} partidas jugadas
                                        </div>
                                    </div>
                                </div>
                                <div style="color: var(--primary-light); font-size: 1.5em; font-weight: 700;">
                                    ${jugador.mejor_puntuacion || 0} pts
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    content.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay datos de ranking aún</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                content.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 20px;">Error al cargar el ranking. Verifica tu conexión.</p>';
            }
        });
    }
    
    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('estadisticas');
                window.location.href = '/login.html';
            }
        });
    }
}
