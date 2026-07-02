const { createClip, getClip, sendClip } = require('../../api/clip/clip');
const config = require('../../../config');
const log = require('../../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A Twitch leva alguns segundos para processar um clipe recém-criado.
// Em vez de um atraso fixo, fazemos polling até o clipe ficar disponível.
const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 2000;

async function fetchClipWhenReady(clipId) {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL_MS);
        const response = await getClip(clipId);
        const clip = response?.data?.data?.[0];
        if (clip && clip.thumbnail_url) {
            return clip;
        }
    }
    return null;
}

module.exports = {
    name: 'clip',
    aliases: ['clipar', 'clipe'],
    permission: 'everyone',
    cooldown: 15,
    description: 'Cria um clipe da live atual e envia para o Discord.',
    usage: '!clip [nome do clipe]',

    async execute({ client, channel, tags, args }) {
        const broadcaster_id = channel.replace('#', '');
        const clipChannelId = config.settings.clips.daxlian_main_channel;
        const creatorTitle = args.join(' ').trim() || `O @${tags.username} acabou não dando um nome a esse clipe.`;

        let createResponse;
        try {
            createResponse = await createClip(broadcaster_id);
        } catch (error) {
            log.error('Erro ao criar o clipe:', error.message);
            client.say(channel, `@${tags.username}, não consegui criar o clipe. A live está ativa?`);
            return;
        }

        const clipId = createResponse?.data?.data?.[0]?.id;
        if (!clipId) {
            client.say(channel, `@${tags.username}, não consegui criar o clipe agora. Tente novamente em instantes.`);
            return;
        }

        client.say(channel, `Comecei a criar o seu clipe @${tags.username}!`);

        try {
            const clip = await fetchClipWhenReady(clipId);
            if (!clip) {
                client.say(
                    channel,
                    `@${tags.username}, o clipe foi criado mas ainda está processando. Veja no Twitch em instantes.`
                );
                return;
            }

            const clipInfo = {
                title: clip.title,
                description: `## ${creatorTitle}`,
                url: clip.url,
                broadcaster: {
                    name: clip.broadcaster_name,
                    url: `https://www.twitch.tv/${clip.broadcaster_name}`,
                },
                timestamp: clip.created_at,
                creator: {
                    name: tags['display-name'] || tags.username,
                    url: `https://www.twitch.tv/${tags['display-name'] || tags.username}`,
                },
                thumbnail_url: clip.thumbnail_url,
            };

            const discordResponse = await sendClip(clipInfo, clipChannelId);

            if (discordResponse && discordResponse.id != null) {
                client.say(channel, `@${tags.username}, clipe criado com sucesso e enviado para o Discord!`);
            } else {
                client.say(
                    channel,
                    `@${tags.username}, o clipe foi criado, mas houve um problema ao enviá-lo para o Discord.`
                );
            }
        } catch (error) {
            log.error('Erro ao processar o clipe:', error.message);
            client.say(channel, `@${tags.username}, houve um erro ao finalizar o clipe. Tente novamente mais tarde.`);
        }
    },
};
