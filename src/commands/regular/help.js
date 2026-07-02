const { hasPermission } = require('../../utils/bot/permissions');

module.exports = {
    name: 'help',
    aliases: ['comandos', 'ajuda'],
    permission: 'everyone',
    cooldown: 10,
    description: 'Lista os comandos disponíveis ou detalha um comando específico.',
    usage: '!help [comando]',

    execute({ client, channel, tags, args, commands }) {
        // Comandos únicos (sem duplicar aliases) que o usuário tem permissão de usar.
        const unique = [...new Set(Object.values(commands))];

        // !help <comando>
        if (args.length > 0) {
            const query = args[0].toLowerCase();
            const command = commands[query];
            if (!command) {
                client.say(channel, `@${tags.username}, comando "${query}" não encontrado.`);
                return;
            }
            const parts = [`!${command.name}`];
            if (command.description) parts.push(`— ${command.description}`);
            if (command.usage) parts.push(`(${command.usage})`);
            client.say(channel, parts.join(' '));
            return;
        }

        const available = unique
            .filter((cmd) => hasPermission(tags, cmd.permission))
            .map((cmd) => `!${cmd.name}`)
            .sort();

        client.say(channel, `@${tags.username}, comandos disponíveis: ${available.join(', ')}`);
    },
};
