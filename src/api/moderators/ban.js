const { twitch } = require('../../utils/api/settings')
const { loadTokens } = require('../oauth/token')
const config = require('../../../config')
const { fetchUserId } = require('../users/fetchUser')

/**
 * Bane permanentemente um usuário do chat de um canal da Twitch.
 *
 * Esta função usa a API da Twitch para banir um usuário específico do chat,
 * especificando o ID do broadcaster, do moderador, do usuário e um motivo opcional.
 * É necessário um token de acesso válido para autorização.
 *
 * @async
 * @param {string} broadcaster_id - O nome de usuário ou ID do canal onde o banimento será aplicado.
 * @param {string} moderator_id - O nome de usuário ou ID do moderador que está aplicando o banimento.
 * @param {string} user_id - O nome de usuário ou ID do usuário que será banido.
 * @param {string} [reason] - (Opcional) Motivo do banimento.
 * @throws {Error} Se o token de acesso não estiver disponível ou ocorrer um erro ao aplicar o banimento.
 * @returns {Promise<Object>} Os dados da resposta da API da Twitch, confirmando o banimento.
 * 
 * @example
 * announce(broadcaster_id, moderator_id, user_id, reason)
 *     .then((response) => {
 *         console.log("Usuario banido com sucesso:", response);
 *     })
 *     .catch((error) => {
 *         console.error("Erro ao banir o usuário: ", error);
 *     });
 */
async function ban(broadcaster_id, moderator_id, user_id, reason) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    // Obter o ID do broadcaster, moderator e user
    moderator_id = await fetchUserId(moderator_id);
    broadcaster_id = await fetchUserId(broadcaster_id);
    user_id = await fetchUserId(user_id);

    try {
        const response = await twitch.post('/moderation/bans',
            {
                data: {
                    user_id: user_id,
                    reason: reason || undefined
                }
            },
            {
                params: {
                    broadcaster_id: broadcaster_id,
                    moderator_id: moderator_id
                },
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Client-ID': config.api.twitch.auth.client_id,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error("Erro ao banir o usuário: " + error);
    }
}

module.exports = {
    ban
}