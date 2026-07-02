const express = require('express');
const tmi = require('tmi.js');
const config = require('./config');
const log = require('./src/utils/logger');
const { assertConfig } = require('./src/utils/validateConfig');
const {
    getAuthorizationUrl,
    getTokenFromCode,
    loadTokens,
    scheduleTokenRefresh,
    saveTokens,
} = require('./src/api/oauth/token');
const { loadCommands } = require('./src/utils/bot/commandLoader');
const { createMessageHandler } = require('./src/utils/bot/commandHandler');

const app = express();
const PORT = config.server.port;

let client;

/** Cria o client tmi.js e registra os handlers de chat e de conexão. */
function startBot() {
    client = new tmi.Client({
        options: { debug: false },
        connection: { reconnect: true, secure: true },
        identity: {
            username: config.api.twitch.user.username,
            password: config.api.twitch.auth.oauth_token,
        },
        channels: config.settings.channels,
    });

    const commands = loadCommands();
    client.on('message', createMessageHandler(client, commands));

    client.on('connected', (address, port) => {
        log.info(`Bot conectado ao chat (${address}:${port}).`);
        // Para ativar o anúncio automático, descomente as duas linhas abaixo:
        // const { startAutoAnnounce } = require('./src/functions/auto-announce');
        // startAutoAnnounce(client);
    });
    client.on('disconnected', (reason) => log.warn(`Desconectado do chat: ${reason}`));
    client.on('reconnect', () => log.info('Reconectando ao chat...'));

    client.connect().catch((err) => log.error('Erro ao conectar o bot:', err.message));

    return client;
}

/** Fecha a conexão do bot de forma limpa. */
async function shutdown(signal) {
    log.info(`Recebido ${signal}, encerrando...`);
    try {
        if (client) await client.disconnect();
    } catch (error) {
        log.warn('Erro ao desconectar:', error.message);
    } finally {
        process.exit(0);
    }
}

/** Inicia o fluxo de OAuth quando não há token válido salvo. */
function startOAuthServer() {
    app.get('/api/twitch/oauth/callback', async (req, res) => {
        const code = req.query.code;
        if (!code) {
            return res.status(400).send('Código de autorização não encontrado.');
        }

        try {
            const newTokenData = await getTokenFromCode(code);
            if (newTokenData && newTokenData.access_token) {
                saveTokens(newTokenData);
                startBot();
                scheduleTokenRefresh();
                res.send('Autenticação bem-sucedida! O bot está agora conectado.');
            } else {
                res.status(500).send('Erro ao obter token. Token não encontrado na resposta.');
            }
        } catch (error) {
            log.error('Erro ao obter token:', error.message);
            if (!res.headersSent) {
                res.status(500).send('Erro ao obter token.');
            }
        } finally {
            server.close();
        }
    });

    const server = app.listen(PORT, async () => {
        log.info(`Servidor de autenticação ativo na porta ${PORT}.`);
        const authorizationUrl = getAuthorizationUrl();
        try {
            const open = (await import('open')).default;
            await open(authorizationUrl);
        } catch {
            log.info(`Abra a URL para autorizar o bot:\n${authorizationUrl}`);
        }
    });
}

/** Ponto de entrada: valida config, inicia OAuth ou conecta direto. */
function initialize() {
    assertConfig();

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => log.error('Unhandled rejection:', reason));

    const tokenData = loadTokens();

    if (!tokenData || (tokenData.expires_at && tokenData.expires_at < Date.now())) {
        log.info('Token ausente ou expirado. Iniciando processo de autenticação...');
        startOAuthServer();
    } else {
        log.info('Token válido encontrado. Iniciando o bot e agendando renovação...');
        startBot();
        scheduleTokenRefresh();
    }
}

initialize();
