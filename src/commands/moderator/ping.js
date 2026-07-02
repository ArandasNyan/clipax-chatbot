module.exports = {
    name: 'ping',
    aliases: ['pong'],
    permission: 'moderator',
    description: 'Verifica se o bot está respondendo.',
    usage: '!ping',

    execute({ client, channel }) {
        const start = Date.now();
        client.say(channel, `Pong! (${Date.now() - start}ms)`);
    },
};
