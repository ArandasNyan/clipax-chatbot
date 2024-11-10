const express = require('express');
const { getAuthorizationUrl, getTokenFromCode, loadTokens, scheduleTokenRefresh, saveTokens } = require('./src/api/oauth/token');
const { loadCommands } = require('./src/utils/bot/commandLoader');
const { startAutoAnnounce } = require('./src/functions/auto-announce')
const config = require('./config');
const tmi = require('tmi.js');

const app = express();
const PORT = config.server.port;
let client;

// Função para iniciar o bot
function startBot() {
    client = new tmi.Client({
        options: { debug: false },
        identity: {
            username: config.api.twitch.user.username,
            password: config.api.twitch.auth.oauth_token
        },
        channels: config.settings.channels  // Canais que o bot monitorará
    });

    client.connect()
        .then(() => { 
            console.log('Bot conectado ao chat!')
            // startAutoAnnounce(client);
        })
        .catch(err => console.error('Erro ao conectar o bot:', err));


    // Carregar os comandos
    const commands = loadCommands();

    // Executar os comandos quando uma mensagem for enviada no chat
    client.on('message', (channel, tags, message, self) => {
        if (self || !message.startsWith(config.settings.prefix)) return;

        const args = message.slice(config.settings.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Obter o comando com base no nome ou alias
        const command = commands[commandName];

        // Verifica se o comando existe
        if (!command) {
            return;
        }

        try {
            // Executar o comando encontrado
            command.execute(client, channel, tags, args, message);
        } catch (error) {
            console.error(`Erro ao executar o comando ${commandName}:`, error);
        }
    });
}

// Inicializa o processo de autenticação e troca de token
async function Initialize() {
    const tokenData = loadTokens();

    if (!tokenData || (tokenData.expires_at && tokenData.expires_at < Date.now())) {
        console.log('Token ausente ou expirado. Iniciando processo de autenticação...');

        // Define a rota de callback para capturar o código da Twitch
        app.get('/api/twitch/oauth/callback', async (req, res) => {
            const code = req.query.code;
            if (!code) {
                return res.status(400).send('Código de autorização não encontrado.');
            }

            // Trocar o código por um token de acesso
            try {
                const newTokenData = await getTokenFromCode(code);

                if (newTokenData && newTokenData.access_token) {
                    saveTokens(newTokenData);  // Salva os tokens no arquivo
                    startBot();
                    scheduleTokenRefresh();  // Agende a próxima renovação do token
                    res.send('Autenticação bem-sucedida! O bot está agora conectado.');
                } else {
                    res.status(500).send('Erro ao obter token. Token não encontrado na resposta.');
                }

            } catch (error) {
                console.error('Erro ao obter token:', error);
                if (!res.headersSent) {
                    res.status(500).send('Erro ao obter token.');
                }
            } finally {
                // Fechar o servidor após a autenticação inicial
                server.close();
            }
        });

        // Iniciar o servidor
        const server = app.listen(PORT, async () => {
            console.log(`Servidor operando.`);
            const authorizationUrl = getAuthorizationUrl();
            const open = (await import('open')).default;
            await open(authorizationUrl);
        });
    } else {
        console.log('Token válido encontrado. Iniciando o bot e agendando renovação...');

        // Se o token já é válido, inicia o bot diretamente
        startBot();

        // Agendar a renovação do token
        scheduleTokenRefresh();
    }
}

// Inicia o processo de autenticação e configuração do servidor
Initialize();