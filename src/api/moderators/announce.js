const { twitch } = require('../../utils/api/settings')
const { loadTokens } = require('../oauth/token')
const config = require('../../../config')
const { fetchUserId } = require('../user/fetchUser')

/**
 * Envia um anúncio no chat de um canal específico na Twitch.
 *
 * Esta função utiliza a API da Twitch para enviar um anúncio no chat de um canal,
 * especificando o ID do moderador e do broadcaster. 
 * Necessita de um token de acesso válido para autorização.
 *
 * @async
 * @param {string} moderator_id - O nome de usuário ou ID do moderador que está enviando o anúncio.
 * @param {string} broadcaster_id - O nome de usuário ou ID do canal onde o anúncio será feito.
 * @param {string} message - Mensagem que deve ser anunciada nos chat
 * @param {string} [color='primary'] - Opcional, pode ser: "blue", "green", "orange", "purple" ou "primary"[default]
 * @throws {Error} Se o token de acesso não estiver disponível ou ocorrer um erro ao enviar o anúncio.
 * @returns {Promise<Object>} Os dados da resposta da API da Twitch contendo informações sobre o anúncio.
 * 
 * @example
 * announce(moderatorId, broadcasterId, message, color)
 *     .then((response) => {
 *         console.log("Anúncio enviado com sucesso:", response);
 *     })
 *     .catch((error) => {
 *         console.error("Erro ao enviar o anúncio:", error);
 *     });
 */
async function announce(moderator_id, broadcaster_id, message, color) {
    const tokenData = loadTokens();

    // Obter o ID do broadcaster e do moderator
    moderator_id = await fetchUserId(moderator_id);
    broadcaster_id = await fetchUserId(broadcaster_id);

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    try {
        const response = await twitch.post('/chat/announcements', 
            {
                message: message,  // Mensagem de anúncio a ser enviada no chat
                color: color == null ? 'primary' : color       // Cor do anúncio, opcional (pode ser "blue", "green", "orange", etc.)
            },
            {
                params: {
                    broadcaster_id: broadcaster_id, // ID do canal onde o anúncio será feito
                    moderator_id: moderator_id      // ID do moderador que autoriza o anúncio
                },
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`, // Token de acesso para autorização
                    'Client-ID': config.api.twitch.auth.client_id,           // ID do cliente registrado na API da Twitch
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error("Não foi possível enviar o anúncio: " + error);
    }
}

module.exports = {
    announce
}