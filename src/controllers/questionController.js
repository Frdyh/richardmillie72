const fs = require('fs').promises;
const path = require('path');

class QuestionController {
    static preguntas = null;
    
    // Cargar preguntas desde el archivo JSON
    static async cargarPreguntas() {
        try {
            if (QuestionController.preguntas) {
                return QuestionController.preguntas;
            }
            
            const rutaArchivo = path.join(__dirname, '../../data/base-preguntas.json');
            const contenido = await fs.readFile(rutaArchivo, 'utf-8');
            QuestionController.preguntas = JSON.parse(contenido);
            
            console.log(`✅ ${QuestionController.preguntas.length} preguntas cargadas exitosamente`);
            return QuestionController.preguntas;
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
            throw new Error('No se pudieron cargar las preguntas');
        }
    }
    
    // Obtener preguntas aleatorias para una partida
    static async obtenerPreguntasAleatorias(req, res) {
        try {
            const cantidad = parseInt(req.query.cantidad) || 10;
            
            if (cantidad < 1 || cantidad > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe estar entre 1 y 100'
                });
            }
            
            const todasLasPreguntas = await QuestionController.cargarPreguntas();
            
            // Seleccionar preguntas aleatorias
            const preguntasSeleccionadas = [];
            const indices = new Set();
            
            while (preguntasSeleccionadas.length < cantidad && preguntasSeleccionadas.length < todasLasPreguntas.length) {
                const indiceAleatorio = Math.floor(Math.random() * todasLasPreguntas.length);
                
                if (!indices.has(indiceAleatorio)) {
                    indices.add(indiceAleatorio);
                    const pregunta = todasLasPreguntas[indiceAleatorio];
                    
                    // Mezclar las opciones de respuesta
                    const opciones = [
                        { texto: pregunta.respuesta, esCorrecta: true },
                        { texto: pregunta.incorrecta1, esCorrecta: false },
                        { texto: pregunta.incorrecta2, esCorrecta: false },
                        { texto: pregunta.incorrecta3, esCorrecta: false }
                    ];
                    
                    // Mezclar aleatoriamente
                    for (let i = opciones.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
                    }
                    
                    preguntasSeleccionadas.push({
                        id: indiceAleatorio,
                        categoria: pregunta.categoria,
                        pregunta: pregunta.pregunta,
                        opciones: opciones.map((op, idx) => ({
                            id: idx,
                            texto: op.texto,
                            esCorrecta: op.esCorrecta
                        })),
                        imagen: pregunta.imagen || null,
                        objectFit: pregunta.objectFit || 'cover'
                    });
                }
            }
            
            res.json({
                success: true,
                data: {
                    preguntas: preguntasSeleccionadas,
                    total: preguntasSeleccionadas.length
                }
            });
            
        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cargar preguntas',
                error: error.message
            });
        }
    }
    
    // Obtener categorías disponibles
    static async obtenerCategorias(req, res) {
        try {
            const todasLasPreguntas = await QuestionController.cargarPreguntas();
            const categorias = [...new Set(todasLasPreguntas.map(p => p.categoria))];
            
            res.json({
                success: true,
                data: {
                    categorias,
                    total: categorias.length
                }
            });
            
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cargar categorías',
                error: error.message
            });
        }
    }
}

module.exports = QuestionController;