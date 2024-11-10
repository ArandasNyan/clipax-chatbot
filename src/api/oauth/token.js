const fs = require('fs');
const qs = require('qs');
const path = require('path');
const config = require('../../../config');
const { oauth } = require('../../utils/api/settings');  // Importa a instância configurada para OAuth

const tokenFilePath = path.resolve(__dirname, '../../data/credentials/tokens.json');

const scopes = [
    'analytics:read:extensions',
    'analytics:read:games',
    'bits:read',
    'channel:edit:commercial',
    'channel:manage:broadcast',
    'channel:manage:moderators',
    'channel:manage:polls',
    'channel:manage:predictions',
    'channel:manage:raids',
    'channel:manage:redemptions',
    'channel:manage:schedule',
    'channel:manage:videos',
    'channel:read:editors',
    'channel:read:goals',
    'channel:read:hype_train',
    'channel:read:polls',
    'channel:read:predictions',
    'channel:read:redemptions',
    'channel:read:stream_key',
    'channel:read:subscriptions',
    'clips:edit',
    'moderation:read',
    'moderator:manage:announcements',
    'moderator:manage:automod',
    'moderator:manage:banned_users',
    'moderator:manage:blocked_terms',
    'moderator:manage:chat_messages',
    'moderator:manage:chat_settings',
    'moderator:manage:shield_mode',
    'moderator:read:automod_settings',
    'moderator:read:blocked_terms',
    'moderator:read:chat_settings',
    'user:edit',
    'user:edit:follows',
    'user:manage:blocked_users',
    'user:manage:chat_color',
    'user:manage:whispers',
    'user:read:blocked_users',
    'user:read:broadcast',
    'user:read:email',
    'user:read:follows',
    'user:read:subscriptions'
].join(" ");

/**
 * Gera a URL de autorização da Twitch.
 * @returns {string} A URL de autorização da Twitch.
 */
function getAuthorizationUrl() {
    return `https://id.twitch.tv/oauth2/authorize?client_id=${config.api.twitch.auth.client_id}&redirect_uri=${config.server.redirect_uri}&response_type=code&scope=${scopes}`;
}

/**
 * Salva tokens em um arquivo JSON.
 * @param {Object} tokenData - Os dados dos tokens para salvar.
 */
function saveTokens(tokenData) {
    const data = {
        ...tokenData,
        expires_at: Date.now() + (tokenData.expires_in * 1000)
    };
    fs.writeFileSync(tokenFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Carrega tokens do arquivo JSON.
 * @returns {Object|null} Os dados do token, ou `null` se o arquivo não existir.
 */
function loadTokens() {
    if (fs.existsSync(tokenFilePath)) {
        const data = fs.readFileSync(tokenFilePath, 'utf-8');
        if (data) { // Verifique se o arquivo não está vazio
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Erro ao parsear JSON do arquivo de token:', error);
                return null; // Retorne null em caso de erro de JSON
            }
        }
    }
    return null;
}

/**
 * Troca o código de autorização por tokens de acesso e salva os tokens.
 * @async
 * @param {string} code - Código de autorização recebido da Twitch.
 * @returns {Promise<Object>} Os dados dos tokens recebidos.
 */
async function getTokenFromCode(code) {
    try {
        const response = await oauth.post('/oauth2/token',
            qs.stringify({
                client_id: config.api.twitch.auth.client_id,
                client_secret: config.api.twitch.auth.client_secret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: config.server.redirect_uri
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        saveTokens(response.data);
        console.log('Tokens salvos com sucesso.');
        return response.data;
    } catch (error) {
        console.error('Erro ao trocar o código por tokens:', error.message);
    }
}

/**
 * Renova o token de acesso usando o token de renovação e salva o novo token.
 * @async
 * @returns {Promise<string|null>} O novo token de acesso, ou `null` se houver um erro.
 * @throws {Error} Se o token de renovação não estiver disponível.
 */
async function refreshAccessToken() {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.refresh_token) {
        throw new Error('Refresh token não disponível');
    }

    try {
        const response = await oauth.post('/oauth2/token', null, {
            params: {
                client_id: config.api.twitch.auth.client_id,
                client_secret: config.api.twitch.auth.client_secret,
                refresh_token: tokenData.refresh_token,
                grant_type: 'refresh_token'
            }
        });

        saveTokens(response.data);
        console.log('Token renovado com sucesso.');
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao renovar o token de acesso:', error.message);
    }
}

/**
 * Agenda a renovação do token de acesso, configurando um `setTimeout` para renová-lo automaticamente 5 minutos antes de expirar.
 */
function scheduleTokenRefresh() {
    const tokenData = loadTokens();

    if (!tokenData || !tokenData.expires_at) {
        console.log('Nenhum token encontrado ou dados de expiração ausentes.');
        return;
    }

    const timeUntilExpiration = tokenData.expires_at - Date.now();
    const timeToSchedule = timeUntilExpiration - (5 * 60 * 1000);  // Renova 5 minutos antes de expirar

    if (timeToSchedule <= 0) {
        console.log('Token próximo de expirar, renovando agora...');
        refreshAccessToken().then(scheduleTokenRefresh);
    } else {
        setTimeout(() => {
            refreshAccessToken().then(scheduleTokenRefresh);
        }, timeToSchedule);
    }
}

module.exports = {
    loadTokens,
    saveTokens,
    getAuthorizationUrl,
    getTokenFromCode,
    refreshAccessToken,
    scheduleTokenRefresh
};
