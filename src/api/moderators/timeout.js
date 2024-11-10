const { twitch } = require('../../utils/api/settings')
const { loadTokens } = require('../oauth/token')
const config = require('../../../config')
const { fetchUserId } = require('../users/fetchUser')

/**
 * Aplica um timeout a um usuário no chat de um canal da Twitch.
 *
 * Esta função usa a API da Twitch para aplicar um timeout a um usuário específico, 
 * especificando o ID do broadcaster, do moderador, do usuário, a duração do timeout, 
 * e uma razão opcional. Requer um token de acesso válido para autorização.
 *
 * @async
 * @param {string} broadcaster_id - O nome de usuário ou ID do canal onde o timeout será aplicado.
 * @param {string} moderator_id - O nome de usuário ou ID do moderador que está aplicando o timeout.
 * @param {string} user_id - O nome de usuário ou ID do usuário que receberá o timeout.
 * @param {number} duration - Duração do timeout em segundos.
 * @param {string} [reason] - (Opcional) Motivo do timeout.
 * @throws {Error} Se o token de acesso não estiver disponível ou ocorrer um erro ao aplicar o timeout.
 * @returns {Promise<Object>} Os dados da resposta da API da Twitch, confirmando o timeout.
 * 
 * @example
 * announce(broadcaster_id, moderator_id, user_id, duration, reason)
 *     .then((response) => {
 *         console.log("Usuario silenciado com sucesso:", response);
 *     })
 *     .catch((error) => {
 *         console.error("Erro ao silenciar o usuário: ", error);
 *     });
 */
async function timeout(broadcaster_id, moderator_id, user_id, duration, reason) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    // Obter o ID do broadcaster, moderator e user
    moderator_id = await fetchUserId(moderator_id);
    broadcaster_id = await fetchUserId(broadcaster_id)
    user_id = await fetchUserId(user_id);

    try {
        const response = await twitch.post('/moderation/bans', {
            data: {
                user_id: user_id,
                duration: duration, // Tempo em segundos
                reason: reason || undefined
            }
        }, {
            params: {
                broadcaster_id: broadcaster_id,
                moderator_id: moderator_id
            },
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-ID': config.api.twitch.auth.client_id,
            }
        });

        return response.data;
    } catch (error) {
        throw new Error("Error ao enviar um timeout: " + error);
    }
}

module.exports = {
    timeout
}