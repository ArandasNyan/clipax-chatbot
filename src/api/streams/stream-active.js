// streams/isActive.js
const { twitch } = require('../../utils/api/settings');
const { loadTokens } = require('../oauth/token');
const config = require('../../../config');
const { fetchUserId } = require('../users/fetchUser');

/**
 * Verifica se uma transmissão ao vivo está ativa para um canal específico na Twitch.
 *
 * Esta função usa a API da Twitch para verificar se o canal está atualmente transmitindo.
 *
 * @async
 * @param {string} channelId - O nome de usuário para verificar a transmissão.
 * @returns {Promise<boolean>} Retorna true se a transmissão estiver ativa, caso contrário, false.
 * @throws {Error} Se o token de acesso não estiver disponível ou ocorrer um erro na requisição.
 *
 * @example
 * isStreamActive(channelId)
 *     .then((isActive) => {
 *         if (isActive) {
 *             console.log("A transmissão está ativa!");
 *         } else {
 *             console.log("A transmissão está offline.");
 *         }
 *     })
 *     .catch((error) => {
 *         console.error("Erro ao verificar o status da transmissão: ", error);
 *     });
 */
async function isStreamActive(channelId) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    // Obter o ID do canal
    channelId = await fetchUserId(channelId);

    try {
        const response = await twitch.get('/streams', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-Id': config.api.twitch.auth.client_id
            },
            params: {
                user_id: channelId
            }
        });

        // Verifica se há dados na resposta; se sim, o canal está ao vivo
        return response.data.data.length > 0;
    } catch (error) {
        throw new Error("Erro ao verificar o status da transmissão: " + error);
    }
}

module.exports = {
    isStreamActive
};
