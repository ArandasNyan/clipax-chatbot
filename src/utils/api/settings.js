const axios = require('axios');
const config = require('../../../config');

/**
 * @type {import('axios').AxiosInstance} - Endpoints de OAuth da API da Twitch
 *
 * Essa instância é utilizada para enviar requisições ao endpoint de OAuth da API da Twitch, com a configuração base da URL,
 * tempo limite e cabeçalhos para a compatibilidade com a Twitch
 *
 * @property {string} baseURL - URL base configurada para endpoints gerais da twitch
 * @property {number} timeout - Tempo máximo de espera de resposta 5000ms (5 segundos)
 * @property {Object} headers - Cabeçalho pré-configurado, 'Content-Type': 'application/x-www-form-urlencoded'
 *
 * @example
 * Exemplo de uso:
 * oauth.get('/path/endpoint')
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error));
 */
const oauth = axios.create({
    baseURL: config.api.twitch.oauth_uri, // URL base para OAuth
    timeout: 5000,  // Timeout de 5 segundos
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});

/**
 * @type {import('axios').AxiosInstance} - Endpoints padrão da API da Twitch
 *
 * Essa instância é utilizada para enviar requisições aos endpoints gerais da API da Twitch, com a configuração base da URL,
 * tempo limite e cabeçalhos para a compatibilidade com a Twitch
 *
 * @property {string} baseURL - URL base configurada para endpoints gerais da twitch
 * @property {number} timeout - Tempo máximo de espera de resposta 5000ms (5 segundos)
 * @property {Object} headers - Cabeçalho pré-configurado, 'Content-Type': 'application/json'
 *
 * @example
 * Exemplo de uso:
 * twitch.get('/path/endpoint')
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error));
 */
const twitch = axios.create({
    baseURL: config.api.twitch.base_uri, // URL base para os endpoints
    timeout: 5000,  // Timeout de 5 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * @type {import('axios').AxiosInstance} - Endpoints padrão da API do Discord
 *
 * Essa instância é utilizada para enviar requisições aos endpoints gerais da API do Discord, com a configuração base da URL,
 * tempo limite e cabeçalhos para a compatibilidade com a Twitch
 *
 * @property {string} baseURL - URL base configurada para endpoints gerais do Discord
 * @property {number} timeout - Tempo máximo de espera de resposta 5000ms (5 segundos)
 * @property {Object} headers - Cabeçalho pré-configurado, 'Content-Type': 'application/json'
 *
 * @example
 * Exemplo de uso:
 * discord.get('/path/endpoint')
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error));
 */
const discord = axios.create({
    baseURL: config.api.discord.base_uri, // URL base para os endpoints
    timeout: 5000,  // Timeout de 5 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Exportar as instâncias
module.exports = {
    oauth,
    twitch,
    discord
};
