const { updateAnnounceSettings, getAnnounceStatus } = require('../../functions/auto-announce');

module.exports = {
    name: 'announce',
    alias: ['anuncio'],

    execute(client, channel, tags, args) {
        if (args.length === 0) {
            client.say(channel, `Uso: !announce <edit|on|off|interval|status|add|delete> <mensagem/timer>. Exemplo: !announce edit Nova mensagem aqui`);
            return;
        }

        const subcommand = args[0].toLowerCase();
        const value = args.slice(1).join(' ');

        switch (subcommand) {
            case 'edit':
                if (!value) {
                    client.say(channel, 'Erro: Use `!announce edit <nova mensagem>`.');
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

            case 'interval':
                if (!value) {
                    client.say(channel, 'Erro: Use `!announce interval <minutos>`.');
                    return;
                }
                updateAnnounceSettings(channel, 'interval', value, client);
                client.say(channel, `Intervalo de anúncio definido para ${isNaN(value) == true ? `tempo ${value}.` : `${value} minuto(s)`}`);
                break;

            case 'status':
                const status = getAnnounceStatus(channel);
                const activeStatus = status.isActive ? 'ativo' : 'inativo';
                client.say(channel, `Status: ${activeStatus}, Mensagem: "${status.message}", Intervalo: ${status.interval} minutos.`);
                break;

            case 'delete':
                updateAnnounceSettings(channel, 'delete', null, client);
                client.say(channel, 'Configurações de anúncio removidas para este canal.');
                break;

            default:
                client.say(channel, `Comando inválido. Uso: !announce <edit|on|off|interval|status|delete>.`);
                break;
        }
    }
};
