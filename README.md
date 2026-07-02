# Clipax

Bot de **Twitch** (via [tmi.js](https://github.com/tmijs/tmi.js)) que cria clipes da live e os
publica automaticamente em um canal do **Discord**, com sistema de anúncios automáticos e
comandos de moderação.

## Funcionalidades

- **`!clip [nome]`** — cria um clipe da live atual e envia um embed para o Discord.
- **`!announce <edit|on|off|interval|status|delete>`** — gerencia o anúncio automático do canal (apenas moderadores).
- **`!ping`** — verifica se o bot está respondendo (apenas moderadores).
- **`!help [comando]`** — lista os comandos disponíveis conforme a permissão do usuário.
- Renovação automática do token OAuth da Twitch.
- Reconexão automática ao chat e encerramento gracioso (`SIGINT`/`SIGTERM`).

## Requisitos

- Node.js **18+**
- Um app registrado na Twitch: <https://dev.twitch.tv/console/apps>
- Um bot do Discord: <https://discord.com/developers/applications>

## Instalação

```bash
git clone https://github.com/arandasdev/clipax-chatbot.git
cd clipax-chatbot
npm install
cp .env.example .env   # preencha com suas credenciais
```

## Configuração

Todas as credenciais ficam no arquivo `.env` (que **não** é versionado). Use o
`.env.example` como referência. Os canais monitorados e o prefixo de comando ficam em
[`config.js`](./config.js), na seção `settings`.

## Uso

```bash
npm start      # inicia o bot
npm run dev    # inicia com reload automático (nodemon)
```

Na primeira execução, se não houver um token salvo, o bot abre o fluxo de autorização
OAuth da Twitch no navegador (ou imprime a URL no terminal). Após autorizar, o token é
salvo em `src/data/credentials/tokens.json` e renovado automaticamente.

## Scripts

| Script                 | Descrição                         |
| ---------------------- | --------------------------------- |
| `npm start`            | Inicia o bot                      |
| `npm run dev`          | Inicia com nodemon (reload)       |
| `npm run lint`         | Executa o ESLint                  |
| `npm run lint:fix`     | Corrige problemas do ESLint       |
| `npm run format`       | Formata o código com Prettier     |
| `npm run format:check` | Verifica a formatação sem alterar |

## Estrutura do projeto

```
index.js                     Ponto de entrada (OAuth, conexão, shutdown)
config.js                    Configuração central (env + settings)
src/
  api/                       Integrações com as APIs (Twitch, Discord)
    clip/                    Criação e envio de clipes
    moderators/              Ações de moderação (ban, timeout, delete, announce)
    oauth/                   Gestão de tokens OAuth
    streams/                 Verificação de live ativa
    users/                   Busca de usuários
  commands/                  Comandos do chat (por categoria)
  functions/                 Recursos automáticos (auto-announce)
  utils/                     Logger, validação, permissões, loaders
  data/                      Dados persistidos (config de anúncios, tokens)
```

## Criando um novo comando

Crie um arquivo em `src/commands/<categoria>/` exportando:

```js
module.exports = {
    name: 'exemplo',
    aliases: ['ex'],
    permission: 'everyone', // everyone | subscriber | vip | moderator | broadcaster
    cooldown: 5, // segundos, por usuário (ignorado para moderadores)
    description: 'Descrição curta do comando.',
    usage: '!exemplo <arg>',
    async execute({ client, channel, tags, args, message, commands }) {
        client.say(channel, `Olá, @${tags.username}!`);
    },
};
```

O comando é carregado automaticamente; permissão e cooldown são aplicados pelo handler central.

## Anúncio automático

O anúncio automático está desativado por padrão. Para ativá-lo, descomente as linhas
indicadas no evento `connected` em [`index.js`](./index.js).

## Licença

MIT
