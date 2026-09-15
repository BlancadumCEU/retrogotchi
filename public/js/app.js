/**
 * Controlador de la Interfaz y Bucle del Juego (app.js)
 * 
 * Conecta los elementos visuales del DOM con la API de PHP,
 * gestiona la animación de fotogramas (a - b) a 600ms y el reloj de juego.
 */

// Estado local de la mascota en el cliente
let petState = {
    name: 'Tama',
    age: 0,
    hunger: 80,
    happiness: 80,
    stage: 'baby',
    mood: 'happy',
    isAlive: true,
    spritePrefix: 'assets/sprites/baby/happy'
};

// Control de fotograma de animación (0 = 'a', 1 = 'b')
let animationFrame = 0;

// Referencias a los elementos del DOM
const elements = {
    petSprite: document.getElementById('pet-sprite'),
    ageDisplay: document.getElementById('age-display'),
    stageDisplay: document.getElementById('stage-display'),
    moodDisplay: document.getElementById('mood-display'),
    hungerValue: document.getElementById('hunger-value'),
    hungerBar: document.getElementById('hunger-bar'),
    happinessValue: document.getElementById('happiness-value'),
    happinessBar: document.getElementById('happiness-bar'),
    statusMessage: document.getElementById('status-message'),
    btnFeed: document.getElementById('btn-feed'),
    btnPlay: document.getElementById('btn-play'),
    btnReset: document.getElementById('btn-reset'),
};

/**
 * Sonido retro de botón estilo Tamagotchi usando Web Audio API
 */
function playBuzzer(freq = 880, duration = 0.08) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Silencioso si el navegador bloquea audio antes de interacción
    }
}

/**
 * Actualiza la imagen del sprite según la etapa, ánimo y el fotograma actual (a o b)
 */
function renderSprite() {
    if (!elements.petSprite) return;

    const frameSuffix = animationFrame === 0 ? '_a.svg' : '_b.svg';
    const spritePath = `${petState.spritePrefix}${frameSuffix}`;
    elements.petSprite.src = spritePath;
}

/**
 * Actualiza todos los textos, barras e indicadores de la interfaz
 */
function updateUI(data) {
    if (data) {
        petState = { ...petState, ...data };
    }

    // Actualizar métricas
    if (elements.ageDisplay) elements.ageDisplay.textContent = petState.age;
    if (elements.hungerValue) elements.hungerValue.textContent = `${petState.hunger}%`;
    if (elements.hungerBar) elements.hungerBar.style.width = `${petState.hunger}%`;
    if (elements.happinessValue) elements.happinessValue.textContent = `${petState.happiness}%`;
    if (elements.happinessBar) elements.happinessBar.style.width = `${petState.happiness}%`;

    // Traducción amigable de etapas
    const stageLabels = { baby: 'BEBÉ', teen: 'ADOLESCENTE', adult: 'ADULTO' };
    if (elements.stageDisplay) {
        elements.stageDisplay.textContent = stageLabels[petState.stage] || petState.stage.toUpperCase();
    }

    // Traducción de humor y mensajes
    const moodLabels = { happy: 'FELIZ', meh: 'MEH...', sick: 'ENFERMO' };
    if (elements.moodDisplay) {
        elements.moodDisplay.textContent = moodLabels[petState.mood] || petState.mood.toUpperCase();
    }

    if (!petState.isAlive) {
        if (elements.statusMessage) elements.statusMessage.textContent = '💀 Ha fallecido... Pulsa Reiniciar';
        if (elements.btnFeed) elements.btnFeed.disabled = true;
        if (elements.btnPlay) elements.btnPlay.disabled = true;
    } else {
        if (elements.statusMessage) {
            if (petState.mood === 'sick') {
                elements.statusMessage.textContent = '⚠️ ¡Está enfermo! Dale cuidados';
            } else if (petState.mood === 'meh') {
                elements.statusMessage.textContent = '😐 Quiere jugar o comer';
            } else {
                elements.statusMessage.textContent = '✨ ¡Está sano y contento!';
            }
        }
        if (elements.btnFeed) elements.btnFeed.disabled = false;
        if (elements.btnPlay) elements.btnPlay.disabled = false;
    }

    renderSprite();
}

/**
 * Alternar el fotograma de animación (a - b)
 */
function toggleAnimationFrame() {
    animationFrame = animationFrame === 0 ? 1 : 0;
    renderSprite();
}

/**
 * Iniciar la aplicación y eventos
 */
async function init() {
    try {
        // Cargar estado inicial desde el servidor PHP
        const initialState = await TamagotchiApi.getStatus();
        updateUI(initialState);
    } catch (err) {
        console.warn('No se pudo conectar a api.php, cargando valores iniciales locales.');
        updateUI(petState);
    }

    // 1. Bucle de animación rápida (600ms) para alternar fotogramas a y b
    setInterval(toggleAnimationFrame, 600);

    // 2. Bucle principal de juego (Tick cada 3 segundos hacia el backend)
    setInterval(async () => {
        if (petState.isAlive) {
            try {
                const updated = await TamagotchiApi.tick();
                updateUI(updated);
            } catch (error) {
                console.error('Error al sincronizar tick con PHP:', error);
            }
        }
    }, 3000);

    // Eventos de botones
    if (elements.btnFeed) {
        elements.btnFeed.addEventListener('click', async () => {
            playBuzzer(740, 0.06);
            try {
                const updated = await TamagotchiApi.feed();
                updateUI(updated);
            } catch (e) {
                console.error('Error al alimentar:', e);
            }
        });
    }

    if (elements.btnPlay) {
        elements.btnPlay.addEventListener('click', async () => {
            playBuzzer(988, 0.06);
            try {
                const updated = await TamagotchiApi.play();
                updateUI(updated);
            } catch (e) {
                console.error('Error al jugar:', e);
            }
        });
    }

    if (elements.btnReset) {
        elements.btnReset.addEventListener('click', async () => {
            playBuzzer(520, 0.12);
            if (confirm('¿Quieres reiniciar tu Tamagotchi e iniciar una nueva mascota?')) {
                try {
                    const freshState = await TamagotchiApi.reset();
                    updateUI(freshState);
                } catch (e) {
                    console.error('Error al reiniciar:', e);
                }
            }
        });
    }
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
