const { twitch } = require('../../utils/api/settings'); // Importa a instância configurada do axios
const { loadTokens } = require('../oauth/token'); // Função para carregar o token
const config = require('../../../config');

/**
 * Busca o ID do usuário na API da Twitch.
 * Esta função utiliza a API da Twitch para buscar o ID do usuário com base em seu nome de usuário.
 * Requer um token de acesso válido carregado por meio de `loadTokens`.
 *
 * @async
 * @param {string} username - O nome do usuário na Twitch.
 * @returns {Promise<string|null>} Retorna uma `Promise` que informa o ID do usuário (string) se encontrado, ou `null` se o usuário não for encontrado ou ocorrer um erro.
 *
 * @example
 * // Exemplo de uso:
 * fetchUserId(username)
 *   .then(userId => {
 *     if (userId) {
 *       console.log('ID do usuário encontrado:', userId);
 *     } else {
 *       console.log('Usuário não encontrado.');
 *     }
 *   })
 *   .catch(error => console.error('Erro:', error));
 */
async function fetchUserId(username) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        console.error('Token de acesso não encontrado.');
        return null;
    }

    try {
        const response = await twitch.get('/users', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-Id': config.api.twitch.auth.client_id
            },
            params: {
                login: username
            }
        });

        if (response.data && response.data.data.length > 0) {
            return response.data.data[0].id; // Retorna o ID do primeiro usuário encontrado
        } else {
            console.log(`Usuário ${username} não encontrado.`);
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar o ID do usuário:', error.response?.data || error.message);
        return null;
    }
}

module.exports = { fetchUserId };
