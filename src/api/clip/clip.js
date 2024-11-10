const { twitch, discord } = require('../../utils/api/settings')
const { loadTokens } = require('../oauth/token')
const config = require('../../../config')
const { fetchUserId } = require('../users/fetchUser')

/**
 * Essa função tem o objetivo de criar um clipe a partir de informações obtidas no comando !clip
 * 
 * @async
 * @param {string} broadcaster_id Nome do broadcaster para buscar o id
 * @returns {Promise<Object>} Um objeto com dados do clipe criado: id e edit_url
 * @throws {Error} Lança um erro se o token de acesso não estiver disponível ou se ocorrer um erro na criação do clipe.
 *
 * @example
 * createClip(broadcaster_id)
 *   .then(clipData => console.log('Clip criado:', clipData))
 *   .catch(error => console.error('Erro ao criar o clipe:', error));
 */
async function createClip(broadcaster_id) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    broadcaster_id = await fetchUserId(broadcaster_id)

    try {
        const response = await twitch.post('/clips', null, {
            params: {
                broadcaster_id: broadcaster_id  // O ID do broadcaster para o qual o clip será criado
            },
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-ID': config.api.twitch.auth.client_id,
            }
        });

        return response;
    } catch (error) {
        throw new Error("Erro ao criar um clipe: " + error);
    }
}

/**
 * Essa função tem o objeto de buscar dados mais profundo de um clipe.
 * 
 * @async
 * @param {string} id Id do clipe para buscar o clipe
 * @returns {Promise<Object>} Um objeto com dados do clipe
 * @throws {Error} Lança um erro se o token de acesso não estiver disponível ou se ocorrer um erro na criação do clipe.
 *
 * @example
 * getClipe(id)
 *   .then(clipData => console.log('Clip criado:', clipData))
 *   .catch(error => console.error('Erro ao criar o clipe:', error));
 */
async function getClip(id) {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.access_token) {
        throw new Error('Token de acesso não disponível.');
    }

    try {
        const response = await twitch.get('/clips', {
            params: {
                id: id  // Passando o clip_id como parâmetro da API da Twitch
            },
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Client-ID': config.api.twitch.auth.client_id,
            }
        });

        return response;
    } catch (error) {
        throw new Error("Não foi possível encontrar o clipe: " + error);
    }
}

/**
 * @typedef {Object} Clip
 * @property {string} title - O título do clipe.
 * @property {string} description - A descrição do clipe dada pelo criador, via chat.
 * @property {string} url - Url do clipe criado
 * @property {Object} broadcaster - Informações do broadcaster.
 * @property {string} broadcaster.name - Nome do broadcaster.
 * @property {string} broadcaster.url - URL do canal do broadcaster.
 * @property {timestamp} timestamp - Data e hora do clipe.
 * @property {Object} creator - Informações do criador do clipe.
 * @property {string} creator.name - Nome do criador do clipe.
 * @property {string} creator.url - URL do perfil do criador.
 * @property {string} thumbnail_url - URL da imagem em miniatura do clipe.
 */

/**
 * Envia um clipe para um canal do Discord como uma mensagem embutida (embed).
 *
 * @async
 * @function sendClip
 * @param {Clip} clip - Objeto contendo as informações do clipe.
 * @param {string} clip_channel_id - Id do canal de clipes do Discord.
 * @returns {Promise<Object>} Os dados da mensagem enviada ao canal do Discord.
 * @throws {Error} Lança um erro se ocorrer um problema ao enviar o clipe para o Discord.
 *
 * @example
 * sendClip(clip, channel_id)
 *   .then(response => console.log('Clip enviado ao Discord:', response))
 *   .catch(error => console.error('Erro ao enviar o clipe:', error));
 */
async function sendClip(clip, clip_channel_id) {
    try {
        const payload = {
            "title": clip.title,
            "description": clip.description,
            "url": clip.broadcaster.url,
            "color": 9255659,
            "timestamp": clip.timestamp,
            "footer": {
                "text": "Clipax",
                "icon_url": "https://cdn.discordapp.com/avatars/1223408919347597454/6513f196447d8ec955e7e6b559020f44.webp?size=160"
            },
            "author": {
                "name": `✦･ﾟ Clip by @${clip.creator.name} ⋆｡˚`,
                "url": clip.creator.url
            },
            "image": {
                "url": clip.thumbnail_url
            }
        };

        const response = await discord.post(`/v10/channels/${clip_channel_id}/messages`,
            {
                "content": "",
                "embeds": [payload], // O Discord espera um array de embeds
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "style": 5,
                                "label": "Ver clipe",
                                "url": clip.url
                            }
                        ]
                    }
                ],
                "tts": false
            },
            {
                headers: {
                    "Authorization": `Bot ${config.api.discord.auth.oauth_token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error("Não foi possível enviar o clipe: " + error);
    }
}

module.exports = {
    createClip,
    getClip,
    sendClip
}