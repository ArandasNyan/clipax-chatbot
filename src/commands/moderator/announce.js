const { updateAnnounceSettings, getAnnounceStatus } = require('../../functions/auto-announce');

const USAGE = 'Uso: !announce <edit|on|off|interval|status|delete> <mensagem/minutos>';

module.exports = {
    name: 'announce',
    aliases: ['anuncio'],
    permission: 'moderator',
    description: 'Gerencia o anúncio automático do canal.',
    usage: `${USAGE}. Ex.: !announce edit Nova mensagem aqui`,

    execute({ client, channel, args }) {
        if (args.length === 0) {
            client.say(channel, `${USAGE}. Ex.: !announce edit Nova mensagem aqui`);
            return;
        }

        const subcommand = args[0].toLowerCase();
        const value = args.slice(1).join(' ');

        switch (subcommand) {
            case 'edit':
                if (!value) {
                    client.say(channel, 'Erro: use `!announce edit <nova mensagem>`.');
                    return;
                }
                updateAnnounceSettings(channel, 'edit', value, client);
                client.say(channel, `Mensagem de anúncio atualizada para: "${value}"`);
                break;

            case 'on':
                updateAnnounceSettings(channel, 'on', null, client);
                client.say(channel, 'Anúncio automático ativado.');
                break;

            case 'off':
                updateAnnounceSettings(channel, 'off', null, client);
                client.say(channel, 'Anúncio automático desativado.');
                break;

            case 'interval': {
                const minutes = parseInt(value, 10);
                if (isNaN(minutes) || minutes <= 0) {
                    client.say(channel, 'Erro: use `!announce interval <minutos>` (número maior que zero).');
                    return;
                }
                updateAnnounceSettings(channel, 'interval', String(minutes), client);
                client.say(channel, `Intervalo de anúncio definido para ${minutes} minuto(s).`);
                break;
            }

            case 'status': {
                const status = getAnnounceStatus(channel);
                const activeStatus = status.isActive ? 'ativo' : 'inativo';
                client.say(
                    channel,
                    `Status: ${activeStatus} | Mensagem: "${status.message}" | Intervalo: ${status.interval} minutos.`
                );
                break;
            }

            case 'delete':
                updateAnnounceSettings(channel, 'delete', null, client);
                client.say(channel, 'Configurações de anúncio removidas para este canal.');
                break;

            default:
                client.say(channel, `Comando inválido. ${USAGE}.`);
                break;
        }
    },
};
