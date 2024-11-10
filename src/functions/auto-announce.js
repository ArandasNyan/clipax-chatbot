const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { isStreamActive } = require('../api/streams/stream-active');

const configFilePath = path.resolve(__dirname, '../data/announcement/announceConfig.json');
let autoAnnounceTimers = {};
let announceConfig = loadAnnounceConfig();

// Carrega a configuração de todos os canais
function loadAnnounceConfig() {
    if (fs.existsSync(configFilePath)) {
        return JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    } else {
        return {}; // Retorna um objeto vazio se não houver configuração salva
    }
}

// Salva as configurações no arquivo JSON
function saveAnnounceConfig() {
    fs.writeFileSync(configFilePath, JSON.stringify(announceConfig, null, 2), 'utf-8');
}

// Inicia o Auto Announce para todos os canais configurados
function startAutoAnnounce(client) {
    Object.keys(announceConfig).forEach(channel => {
        if (announceConfig[channel].isActive) {
            initializeAnnounceForChannel(channel, client);
        }
    });
}

// Inicia o Auto Announce para um canal específico
function initializeAnnounceForChannel(channel, client) {
    if (autoAnnounceTimers[channel]) {
        clearInterval(autoAnnounceTimers[channel]);
    }

    autoAnnounceTimers[channel] = setInterval(async () => {
        const channelConfig = announceConfig[channel];
        if (!channelConfig || !channelConfig.isActive) return;

        try {
            const isActive = await isStreamActive(channel.replace('#', ''));
            if (isActive) {
                client.say(channel, channelConfig.message);
            }
        } catch (error) {
            console.error(`Erro ao verificar o status de live para o canal ${channel}:`, error.message);
        }
    }, announceConfig[channel].interval);
}

// Atualiza as configurações do anúncio para o canal
function updateAnnounceSettings(channel, option, value, client) {
    if (!announceConfig[channel]) {
        announceConfig[channel] = {
            isActive: false,
            message: "Não esqueçam de cliparem os melhores momentos da live! Use !clipe <nome do seu clipe>.",
            interval: 10 * 60 * 1000 // Intervalo padrão de 10 minutos
        };
    }

    switch (option) {
        case 'edit':
            announceConfig[channel].message = value;
            console.log(`Mensagem de anúncio para o canal ${channel} atualizada para: "${value}"`);
            break;
        case 'on':
            announceConfig[channel].isActive = true;
            initializeAnnounceForChannel(channel, client);
            console.log(`Auto Announce ativado para o canal ${channel}.`);
            break;
        case 'off':
            announceConfig[channel].isActive = false;
            if (autoAnnounceTimers[channel]) {
                clearInterval(autoAnnounceTimers[channel]);
            }
            console.log(`Auto Announce desativado para o canal ${channel}.`);
            break;
        case 'interval':
            const intervalMinutes = parseInt(value, 10);
            if (!isNaN(intervalMinutes) && intervalMinutes > 0) {
                announceConfig[channel].interval = intervalMinutes * 60 * 1000;
                console.log(`Intervalo de anúncio para o canal ${channel} atualizado para ${intervalMinutes} minutos.`);
            }
            break;
        case 'delete':
            if (autoAnnounceTimers[channel]) {
                clearInterval(autoAnnounceTimers[channel]);
            }
            delete announceConfig[channel];
            console.log(`Configurações de anúncio para o canal ${channel} removidas.`);
            break;
        default:
            console.log('Opção inválida.');
            return;
    }

    saveAnnounceConfig();
}

// Função para retornar o status atual de um canal
function getAnnounceStatus(channel) {
    const channelConfig = announceConfig[channel] || {};
    return {
        isActive: channelConfig.isActive || false,
        message: channelConfig.message || "Nenhuma mensagem definida.",
        interval: (channelConfig.interval || 600000) / 60000 // Em minutos
    };
}

module.exports = { startAutoAnnounce, updateAnnounceSettings, getAnnounceStatus };
