const { createClip, getClip, sendClip } = require('../../api/clip/clip');
const config = require('../../../config');

module.exports = {
    name: 'clip',
    alias: ['clipar', 'clipe'],

    async execute(client, channel, tags, args, message) {
        const broadcaster_id = channel.replace('#', ''); // O nome do canal para o qual o clipe será criado
        const clipChannelId = config.settings.clips.daxlian_main_channel; // Canal de destino no Discord para clipes

        const messageParts = message.trim().split(/\s+/); // Divide a string em partes
        const creator_title = messageParts.slice(1).join(' ') || `O @${tags.username} acabou não dando um nome a esse clipe.`; // Junta todas as partes após o primeiro comando (!clipe)

        try {
            // Cria o clipe e obtém um ID inicial
            const create_clip = await createClip(broadcaster_id);
            client.say(channel, `Comecei a criar o seu clipe @${tags.username}!`);

            // Busca informações detalhadas do clipe
            setTimeout(async () => {
                const get_clip = await getClip(create_clip.data.data[0].id);
                const clip = get_clip.data.data[0];

                // Define as informações adicionais para o embed no Discord
                const clipInfo = {
                    title: clip.title,
                    description: `## ${creator_title}`,
                    url: clip.url,
                    broadcaster: {
                        name: clip.broadcaster_name,
                        url: `https://www.twitch.tv/${clip.broadcaster_name}`
                    },
                    timestamp: clip.created_at,
                    creator: {
                        name: tags['display-name'],
                        url: `https://www.twitch.tv/${tags['display-name']}`
                    },
                    thumbnail_url: clip.thumbnail_url
                };

                // Envia o clipe para o canal do Discord
                const discordResponse = await sendClip(clipInfo, clipChannelId);

                if (discordResponse && discordResponse.id != null) {
                    // Confirmação no chat da Twitch se o clipe foi enviado com sucesso
                    client.say(channel, `@${tags.username}, clipe criado com sucesso e enviado para o canal do Discord!`);
                } else {
                    // Mensagem de erro no chat da Twitch se o envio ao Discord falhou
                    client.say(channel, `@${tags.username}, o clipe foi criado, mas houve um problema ao enviá-lo para o canal do Discord.`);
                }
            }, 6000);
        } catch (error) {
            console.error('Erro ao processar o clipe:', error);
            client.say(channel, `@${tags.username}, houve um erro ao criar o clipe. Tente novamente mais tarde.`);
        }
    }
};
