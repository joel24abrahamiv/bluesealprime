const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    if (commands.length >= 100) break; // Discord limit

    // Skip God Mode and Extra Owner commands for slash commands
    if (file.startsWith('god_') || file === 'eval.js' || file === 'exec.js') continue;

    const command = require(`./commands/${file}`);
    if (command.name && command.description) {
        // Build a simple slash command that takes an optional 'args' string
        const slashCommand = new SlashCommandBuilder()
            .setName(command.name.toLowerCase())
            .setDescription(command.description.substring(0, 100)); // Discord limit 100 chars

        // Add a generic 'input' option to capture arguments
        slashCommand.addStringOption(option =>
            option.setName('input')
                .setDescription('Command arguments (e.g. @user reason)')
                .setRequired(false)
        );

        commands.push(slashCommand.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // Extract Client ID from Token (First part of token is Base64 encoded ID)
        const clientId = Buffer.from(process.env.TOKEN.split('.')[0], 'base64').toString();
        console.log(`📡 Detected Client ID: ${clientId}`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
