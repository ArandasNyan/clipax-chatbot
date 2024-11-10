require('dotenv').config();

/**
 * Configurações do servidor.
 * @typedef {Object} ServerConfig
 * @property {string} uri - URI base do servidor.
 * @property {string} redirect_uri - URI de redirecionamento do servidor.
 * @property {string|number} port - Porta em que o servidor deve rodar.
 */

/** 
 * @type {ServerConfig} 
 * @description Dados necessários para callbacks, redirects e mais.
 */
const server = {
    uri: process.env.SERVER_API_URI,
    redirect_uri: process.env.SERVER_API_REDIRECT_URI,
    port: process.env.SERVER_API_PORT,
};

/**
 * Configurações de autenticação para um serviço.
 * @typedef {Object} AuthConfig
 * @property {string} client_id - ID do cliente registrado.
 * @property {string} client_secret - Segredo do cliente para autenticação.
 * @property {string} oauth_token - Token OAuth para autenticação de acesso.
 */

/**
 * Configurações de usuário para um serviço.
 * @typedef {Object} UserConfig
 * @property {string} username - Nome de usuário do cliente.
 */

/**
 * Configurações para a API da Twitch.
 * @typedef {Object} TwitchConfig
 * @property {string} oauth_uri - URI de OAuth da API da Twitch.
 * @property {string} default_uri - URI padrão da API da Twitch.
 * @property {AuthConfig} auth - Configurações de autenticação para a Twitch.
 * @property {UserConfig} user - Informações de usuário do cliente da Twitch.
 */

/**
 * Configurações para a API do Discord.
 * @typedef {Object} DiscordConfig
 * @property {string} base_uri - URI base da API do Discord.
 * @property {AuthConfig} auth - Configurações de autenticação para o Discord.
 * @property {UserConfig} user - Informações de usuário do cliente do Discord.
 */

/**
 * Configurações gerais da API.
 * @typedef {Object} ApiConfig
 * @property {TwitchConfig} twitch - Configurações específicas para a API da Twitch.
 * @property {DiscordConfig} discord - Configurações específicas para a API do Discord.
 */

/** 
 * @type {ApiConfig} 
 * @description Configurações de Api: Facilitará conexões precisas com apis externas.
 */
const api = {
    twitch: {
        oauth_uri: process.env.TWITCH_API_OAUTH_URI,
        base_uri: process.env.TWITCH_API_URI,
        auth: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            oauth_token: process.env.TWITCH_CLIENT_OAUTH_TOKEN,
        },
        user: {
            username: process.env.TWITCH_CLIENT_USERNAME,
        },
    },
    discord: {
        base_uri: process.env.DISCORD_API_URI,
        auth: {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            oauth_token: process.env.DISCORD_CLIENT_OAUTH_TOKEN,
        },
        user: {
            username: process.env.DISCORD_CLIENT_USERNAME,
        },
    },
};

/**
 * Configurações de canais para clipes.
 * @typedef {Object} ClipsConfig
 * @property {string} main_channel_id - ID do canal principal para clipes.
 * @property {string} test_channel_id - ID do canal de teste para clipes.
 */

/**
 * Configurações gerais da aplicação.
 * @typedef {Object} SettingsConfig
 * @property {string} prefix - Prefixo para comandos de bot.
 * @property {Array<string>} channels - Lista de canais monitorados pelo bot.
 * @property {ClipsConfig} clips - Configurações específicas para canais de clipes.
 */

/** 
 * @type {SettingsConfig} 
 * @description Configurações gerais: Dados necessários para funcionamento correto.
 */
const settings = {
    prefix: "!",
    channels: [
        'arandas_izimirunelian', 'arandas013', 'daxlian'
    ],
    clips: {
        main_channel_id: '1203529131195764776',
        test_channel_id: '1182492120611827803',
        daxlian_main_channel: '957751483951104077'
    },
};

/**
 * Configurações principais da aplicação.
 * @type {Object}
 * @property {ServerConfig} server - Configurações do servidor.
 * @property {ApiConfig} api - Configurações de API para cada serviço integrado.
 * @property {SettingsConfig} settings - Configurações gerais da aplicação.
 */
module.exports = {
    server,
    api,
    settings,
};
