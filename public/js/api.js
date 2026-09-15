/**
 * Módulo de Comunicación (Cliente API)
 * 
 * Se encarga de enviar las peticiones HTTP Fetch al backend de PHP (api.php)
 * y devolver los datos en formato JSON procesado.
 */
const TamagotchiApi = {
    endpoint: 'api.php',

    /**
     * Enviar petición genérica al endpoint
     */
    async request(action, method = 'POST') {
        try {
            const url = method === 'GET' ? `${this.endpoint}?action=${action}` : this.endpoint;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (method !== 'GET') {
                options.body = JSON.stringify({ action: action });
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error(`[TamagotchiApi] Fallo en la acción '${action}':`, error);
            throw error;
        }
    },

    /**
     * Consultar el estado actual de la mascota
     */
    async getStatus() {
        return this.request('status', 'GET');
    },

    /**
     * Alimentar a la mascota
     */
    async feed() {
        return this.request('feed', 'POST');
    },

    /**
     * Jugar con la mascota
     */
    async play() {
        return this.request('play', 'POST');
    },

    /**
     * Hacer avanzar un tick de tiempo (envejecer y gastar métricas)
     */
    async tick() {
        return this.request('tick', 'POST');
    },

    /**
     * Reiniciar o crear una nueva mascota desde el constructor de PHP
     */
    async reset() {
        return this.request('reset', 'POST');
    }
};

// Exponer globalmente para app.js
window.TamagotchiApi = TamagotchiApi;
