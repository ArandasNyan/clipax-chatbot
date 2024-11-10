module.exports = {
    name: 'ping',
    alias: ['pong'],

    async execute(client, channel, tags, args) {
        // Verificar se quem executa o comando é moderador ou broadcaster
        if (tags.mod || tags.badges?.broadcaster) {
            try {
                client.say(channel, `Pong!`);
            } catch (error) {
                client.say(channel, `EITA Q EITA, calma ai to resolvendo esse b.o do meu ping, o arandas é bobo e esqueceu de um detalhe aqui.`);
            }
        } else {
            return;
        }
        
    }
};
