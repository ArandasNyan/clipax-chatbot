const config = require('../../../config');
const log = require('../logger');
const { hasPermission } = require('./permissions');

// Mapa de cooldowns: "comando:usuario" -> timestamp (ms) em que o cooldown expira.
const cooldowns = new Map();

const PERMISSION_LABELS = {
    subscriber: 'inscritos',
    vip: 'VIPs',
    moderator: 'moderadores',
    broadcaster: 'o streamer',
};

/**
 * Cria o handler de mensagens do chat, resolvendo comandos, permissões e cooldowns.
 *
 * @param {import('tmi.js').Client} client
 * @param {Object<string, object>} commands Mapa nome/alias -> comando.
 * @returns {(channel: string, tags: object, message: string, self: boolean) => void}
 */
function createMessageHandler(client, commands) {
    const prefix = config.settings.prefix;

    return async function onMessage(channel, tags, message, self) {
        if (self || typeof message !== 'string' || !message.startsWith(prefix)) return;

        const args = message.slice(prefix.length).trim().split(/\s+/);
        const commandName = (args.shift() || '').toLowerCase();
        if (!commandName) return;

        const command = commands[commandName];
        if (!command) return;

        // --- Permissão ---
        if (!hasPermission(tags, command.permission)) {
            const label = PERMISSION_LABELS[command.permission];
            if (label) {
                client.say(channel, `@${tags.username}, esse comando é restrito a ${label}.`);
            }
            return;
        }

        // --- Cooldown (por usuário, ignorado para moderadores/broadcaster) ---
        if (command.cooldown > 0 && !hasPermission(tags, 'moderator')) {
            const key = `${command.name}:${tags.username}`;
            const now = Date.now();
            const expiresAt = cooldowns.get(key) || 0;

            if (now < expiresAt) {
                const remaining = Math.ceil((expiresAt - now) / 1000);
                client.say(channel, `@${tags.username}, aguarde ${remaining}s para usar !${command.name} novamente.`);
                return;
            }
            cooldowns.set(key, now + command.cooldown * 1000);
        }

        // --- Execução ---
        try {
            await command.execute({ client, channel, tags, args, message, commands });
        } catch (error) {
            log.error(`Erro ao executar o comando "${command.name}":`, error.message);
            client.say(channel, `@${tags.username}, ocorreu um erro ao executar esse comando.`);
        }
    };
}

module.exports = { createMessageHandler };
