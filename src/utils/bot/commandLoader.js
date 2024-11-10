const fs = require('fs');
const path = require('path');

function loadCommands() {
    const commands = {};
    const commandCategories = fs.readdirSync(path.join(__dirname, '../../commands'));

    for (const category of commandCategories) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${category}`)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../../commands/${category}/${file}`));

            // Armazenar o comando pelo seu nome
            commands[command.name] = command;

            // Mapear os aliases para o comando principal, sem duplicar
            if (command.alias && command.alias.length) {
                command.alias.forEach(alias => {
                    commands[alias] = commands[command.name];
                });
            }
        }
    }

    return commands;
}

module.exports = { loadCommands };

