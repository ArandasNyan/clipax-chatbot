const config = require('../../config');
const log = require('./logger');

/**
 * Valida que as variáveis de ambiente essenciais estão presentes antes de
 * iniciar o bot, evitando falhas obscuras em tempo de execução.
 *
 * @returns {string[]} Lista de campos ausentes (vazia se tudo estiver ok).
 */
function getMissingConfig() {
    const required = {
        SERVER_API_PORT: config.server.port,
        SERVER_API_REDIRECT_URI: config.server.redirect_uri,
        TWITCH_API_OAUTH_URI: config.api.twitch.oauth_uri,
        TWITCH_API_URI: config.api.twitch.base_uri,
        TWITCH_CLIENT_ID: config.api.twitch.auth.client_id,
        TWITCH_CLIENT_SECRET: config.api.twitch.auth.client_secret,
        TWITCH_CLIENT_USERNAME: config.api.twitch.user.username,
        TWITCH_CLIENT_OAUTH_TOKEN: config.api.twitch.auth.oauth_token,
        DISCORD_API_URI: config.api.discord.base_uri,
        DISCORD_CLIENT_OAUTH_TOKEN: config.api.discord.auth.oauth_token,
    };

    return Object.entries(required)
        .filter(([, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);
}

/**
 * Valida a configuração e encerra o processo se algo essencial estiver faltando.
 */
function assertConfig() {
    const missing = getMissingConfig();
    if (missing.length > 0) {
        log.error('Configuração inválida. Variáveis de ambiente ausentes:', missing);
        log.error('Copie o arquivo .env.example para .env e preencha os valores.');
        process.exit(1);
    }
    log.debug('Configuração validada com sucesso.');
}

module.exports = { assertConfig, getMissingConfig };
