const fs = require('fs');
const path = require('path');
const log = require('../logger');

const commandsDir = path.join(__dirname, '../../commands');

/**
 * Estrutura esperada de um comando:
 * {
 *   name: string,                 // obrigatório, minúsculo
 *   aliases?: string[],           // opcional
 *   permission?: string,          // 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster'
 *   cooldown?: number,            // segundos, por usuário (default 0)
 *   description?: string,
 *   usage?: string,
 *   execute: (ctx) => any         // obrigatório
 * }
 */
function validateCommand(command, file) {
    if (!command || typeof command !== 'object') {
        log.warn(`Comando ignorado (exportação inválida): ${file}`);
        return false;
    }
    if (typeof command.name !== 'string' || !command.name) {
        log.warn(`Comando ignorado (sem 'name'): ${file}`);
        return false;
    }
    if (typeof command.execute !== 'function') {
        log.warn(`Comando ignorado (sem 'execute'): ${file}`);
        return false;
    }
    return true;
}

/**
 * Carrega recursivamente todos os comandos das subpastas de `src/commands`.
 * Retorna um mapa nome/alias -> comando.
 *
 * @returns {Object<string, object>}
 */
function loadCommands() {
    const commands = {};

    if (!fs.existsSync(commandsDir)) {
        log.warn(`Diretório de comandos não encontrado: ${commandsDir}`);
        return commands;
    }

    const register = (key, command, file) => {
        const normalized = key.toLowerCase();
        if (commands[normalized]) {
            log.warn(`Conflito de comando/alias "${normalized}" em ${file} (já registrado). Ignorando.`);
            return;
        }
        commands[normalized] = command;
    };

    const categories = fs.readdirSync(commandsDir, { withFileTypes: true }).filter((d) => d.isDirectory());

    for (const category of categories) {
        const categoryPath = path.join(commandsDir, category.name);
        const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(categoryPath, file);
            let command;
            try {
                command = require(filePath);
            } catch (error) {
                log.error(`Falha ao carregar comando ${file}:`, error.message);
                continue;
            }

            if (!validateCommand(command, file)) continue;

            // Metadados com defaults
            command.category = category.name;
            command.permission = command.permission || 'everyone';
            command.cooldown = Number.isFinite(command.cooldown) ? command.cooldown : 0;
            command.aliases = Array.isArray(command.aliases) ? command.aliases : [];

            register(command.name, command, file);
            for (const alias of command.aliases) {
                register(alias, command, file);
            }
        }
    }

    const unique = new Set(Object.values(commands));
    log.info(`Comandos carregados: ${unique.size} (${Object.keys(commands).length} nomes/aliases).`);
    return commands;
}

module.exports = { loadCommands };
