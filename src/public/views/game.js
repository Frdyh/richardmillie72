// Estado del juego
let gameState = {
    preguntas: [],
    indicePreguntaActual: 0,
    puntuacion: 0,
    vidas: 3,
    vidasIniciales: 3,
    preguntasCorrectas: 0,
    tiempoInicio: null,
    tiempoRestante: 30,
    tiempoLimite: 30,
    intervaloTemporizador: null,
    respondiendo: false
};

// Verificar autenticación
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    iniciarJuego();
});

// Iniciar el juego
async function iniciarJuego() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No hay token de autenticación. Serás redirigido al login.');
            window.location.href = '/login.html';
            return;
        }
        
        console.log('Cargando preguntas...');
        const response = await fetch('/api/questions/aleatorias?cantidad=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
            // Si la respuesta no es OK, intentar obtener el mensaje de error
            const errorData = await response.json().catch(() => ({}));
            console.error('Error en la respuesta:', errorData);
            
            if (response.status === 401) {
                alert('Tu sesión ha expirado. Serás redirigido al login.');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('estadisticas');
                window.location.href = '/login.html';
            } else {
                alert('Error al cargar preguntas: ' + (errorData.message || 'Error desconocido'));
                window.location.href = '/menu.html';
            }
            return;
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success && data.data && data.data.preguntas) {
            if (data.data.preguntas.length === 0) {
                alert('No hay preguntas disponibles. Por favor, contacta al administrador.');
                window.location.href = '/menu.html';
                return;
            }
            
            gameState.preguntas = data.data.preguntas;
            gameState.tiempoInicio = Date.now();
            
            console.log(`✅ ${gameState.preguntas.length} preguntas cargadas`);
            
            // Ocultar pantalla de carga y mostrar juego
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            
            // Inicializar vidas
            renderizarVidas();
            
            // Mostrar primera pregunta
            mostrarPregunta();
        } else {
            console.error('Respuesta inválida:', data);
            alert('Error al cargar preguntas: ' + (data.message || 'Formato de respuesta inválido'));
            window.location.href = '/menu.html';
        }
    } catch (error) {
        console.error('Error al iniciar juego:', error);
        alert('Error de conexión al cargar el juego: ' + error.message);
        window.location.href = '/menu.html';
    }
}

// Mostrar pregunta actual
function mostrarPregunta() {
    if (gameState.indicePreguntaActual >= gameState.preguntas.length) {
        finalizarJuego();
        return;
    }
    
    const pregunta = gameState.preguntas[gameState.indicePreguntaActual];
    
    // Actualizar información de la pregunta
    document.getElementById('currentQuestion').textContent = gameState.indicePreguntaActual + 1;
    document.getElementById('totalQuestions').textContent = gameState.preguntas.length;
    document.getElementById('score').textContent = gameState.puntuacion;
    document.getElementById('category').textContent = pregunta.categoria;
    document.getElementById('questionText').textContent = pregunta.pregunta;
    
    // Mostrar imagen si existe
    const imgElement = document.getElementById('questionImage');
    if (pregunta.imagen) {
        imgElement.src = pregunta.imagen;
        imgElement.style.objectFit = pregunta.objectFit || 'cover';
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }
    
    // Renderizar opciones
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    pregunta.opciones.forEach((opcion, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = opcion.texto;
        button.dataset.correcta = opcion.esCorrecta;
        button.addEventListener('click', () => seleccionarRespuesta(button, opcion.esCorrecta));
        optionsContainer.appendChild(button);
    });
    
    // Reiniciar temporizador
    gameState.tiempoRestante = gameState.tiempoLimite;
    gameState.respondiendo = false;
    iniciarTemporizador();
}

// Iniciar temporizador
function iniciarTemporizador() {
    if (gameState.intervaloTemporizador) {
        clearInterval(gameState.intervaloTemporizador);
    }
    
    actualizarTemporizador();
    
    gameState.intervaloTemporizador = setInterval(() => {
        gameState.tiempoRestante--;
        actualizarTemporizador();
        
        if (gameState.tiempoRestante <= 0) {
            clearInterval(gameState.intervaloTemporizador);
            if (!gameState.respondiendo) {
                tiempoAgotado();
            }
        }
    }, 1000);
}

// Actualizar visualización del temporizador
function actualizarTemporizador() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = gameState.tiempoRestante;
    
    // Cambiar color según el tiempo restante
    timerElement.className = 'info-value timer';
    if (gameState.tiempoRestante <= 5) {
        timerElement.classList.add('danger');
    } else if (gameState.tiempoRestante <= 10) {
        timerElement.classList.add('warning');
    }
}

// Seleccionar respuesta
function seleccionarRespuesta(button, esCorrecta) {
    if (gameState.respondiendo) return;
    
    gameState.respondiendo = true;
    clearInterval(gameState.intervaloTemporizador);
    
    // Deshabilitar todos los botones
    const botones = document.querySelectorAll('.option-btn');
    botones.forEach(btn => {
        btn.disabled = true;
        
        // Resaltar respuesta correcta
        if (btn.dataset.correcta === 'true') {
            btn.classList.add('correct');
        }
    });
    
    // Si la respuesta es correcta
    if (esCorrecta) {
        gameState.preguntasCorrectas++;
        gameState.puntuacion += 100;
        document.getElementById('score').textContent = gameState.puntuacion;
    } else {
        // Si es incorrecta, perder una vida y resaltar en rojo
        button.classList.add('incorrect');
        gameState.vidas--;
        renderizarVidas();
        
        // Si se acabaron las vidas, terminar juego
        if (gameState.vidas <= 0) {
            setTimeout(() => finalizarJuego(), 1500);
            return;
        }
    }
    
    // Pasar a la siguiente pregunta después de 1.5 segundos
    setTimeout(() => {
        gameState.indicePreguntaActual++;
        mostrarPregunta();
    }, 1500);
}

// Tiempo agotado
function tiempoAgotado() {
    gameState.respondiendo = true;
    gameState.vidas--;
    renderizarVidas();
    
    // Resaltar respuesta correcta
    const botones = document.querySelectorAll('.option-btn');
    botones.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.correcta === 'true') {
            btn.classList.add('correct');
        }
    });
    
    // Si se acabaron las vidas, terminar juego
    if (gameState.vidas <= 0) {
        setTimeout(() => finalizarJuego(), 1500);
        return;
    }
    
    // Pasar a la siguiente pregunta
    setTimeout(() => {
        gameState.indicePreguntaActual++;
        mostrarPregunta();
    }, 1500);
}

// Renderizar vidas
function renderizarVidas() {
    const container = document.getElementById('livesContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < gameState.vidasIniciales; i++) {
        const vida = document.createElement('div');
        vida.className = 'life';
        vida.textContent = '❤';
        
        if (i >= gameState.vidas) {
            vida.classList.add('lost');
        }
        
        container.appendChild(vida);
    }
}

// Finalizar juego
async function finalizarJuego() {
    clearInterval(gameState.intervaloTemporizador);
    
    const tiempoTotal = Math.floor((Date.now() - gameState.tiempoInicio) / 1000);
    
    // Guardar partida en el servidor
    try {
        const token = localStorage.getItem('token');
        await fetch('/api/game/guardar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                puntuacion: gameState.puntuacion,
                preguntas_correctas: gameState.preguntasCorrectas,
                preguntas_totales: gameState.indicePreguntaActual,
                vidas_restantes: gameState.vidas,
                duracion: tiempoTotal
            })
        });
    } catch (error) {
        console.error('Error al guardar partida:', error);
    }
    
    // Mostrar pantalla de resultado
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    
    // Mostrar estadísticas
    document.getElementById('finalScore').textContent = gameState.puntuacion;
    document.getElementById('correctAnswers').textContent = gameState.preguntasCorrectas;
    document.getElementById('totalAnswered').textContent = gameState.indicePreguntaActual;
    document.getElementById('timeElapsed').textContent = tiempoTotal;
    document.getElementById('livesLeft').textContent = gameState.vidas;
    
    // Mensaje según el resultado
    const resultTitle = document.getElementById('resultTitle');
    if (gameState.vidas > 0) {
        resultTitle.textContent = '¡Felicitaciones! 🎉';
    } else {
        resultTitle.textContent = 'Juego Terminado 😔';
    }
}

// Botón de abandonar
document.getElementById('quitBtn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres abandonar la partida?')) {
        clearInterval(gameState.intervaloTemporizador);
        window.location.href = '/menu.html';
    }
});

// Botón de jugar de nuevo
document.getElementById('playAgainBtn').addEventListener('click', () => {
    window.location.reload();
});

// Botón de volver al menú
document.getElementById('backToMenuBtn').addEventListener('click', () => {
    window.location.href = '/menu.html';
});