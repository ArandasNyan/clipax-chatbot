const { twitch } = require('../../utils/api/settings')
const { loadTokens } = require('../oauth/token')
const config = require('../../../config')
const { fetchUserId } = require('../user/fetchUser')

/**
 * Deleta uma mensagem específica no chat de um canal da Twitch.
 *
 * Esta função utiliza a API da Twitch para excluir uma mensagem do chat com base no ID do broadcaster,
 * no ID do moderador e no ID da mensagem a ser deletada. É necessário um token de acesso válido para autorização.
 *
 * @async
 * @param {string} broadcaster_id - O nome de usuário ou ID do canal onde a mensagem será deletada.
 * @param {string} message_id - O ID da mensagem específica a ser deletada.
 * @param {string} moderator_id - O nome de usuário ou ID do moderador que está autorizando a exclusão.
 * @throws {Error} Se o token de acesso não estiver disponível ou ocorrer um erro ao tentar deletar a mensagem.
 * @returns {Promise<Object>} Os dados da resposta da API da Twitch, confirmando a exclusão da mensagem.
 *
 * @example
 * announce(broadcaster_id, message_id, moderator_id)
 *     .then((response) => {
 *         console.log("Mensagem apagada com sucesso:", response);
 *     })
 *     .catch((error) => {
 *         console.error("Erro ao apagar a mensagem:", error);
 *     });
 */
async function message_delete(broadcaster_id, message_id, moderator_id) {
    const tokenData = loadTokens();  // Carregar os tokens

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    // Obter o ID do broadcaster, moderator e user
    moderator_id = await fetchUserId(moderator_id);
    broadcaster_id = await fetchUserId(broadcaster_id)

    try {
        // Requisição DELETE para a Twitch API
        const response = await twitch.delete('/moderation/chat', {
            params: {
                broadcaster_id: broadcaster_id,
                moderator_id: moderator_id,
                message_id: message_id
            },
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-ID': config.api.twitch.auth.client_id,
            }
        });

        return response.data;
    } catch (error) {
        throw new Error("Erro ao deletar a mensagem: " + error);
    }
}


module.exports = {
    message_delete
}