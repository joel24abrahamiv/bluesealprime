const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "ediagnose",
    description: "Run a full system diagnostic on all modules.",
    aliases: ["ediag", "auditmodules"],

    async execute(message) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        const statusMsg = await message.reply("🛰️ **Initializing Deep System Diagnostic...** Scanning command kernel.");

        let passed = 0;
        let failed = 0;
        let errors = [];

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (!command.name || !command.execute) {
                    failed++;
                    errors.push(`\`${file}\`: Missing properties`);
                } else {
                    passed++;
                }
            } catch (error) {
                failed++;
                errors.push(`\`${file}\`: Critical Load Failure`);
            }
        }

        const diagEmbed = new EmbedBuilder()
            .setColor(failed > 0 ? "#FF0000" : "#00FF00")
            .setTitle("🛡️ SYSTEM DIAGNOSTIC REPORT")
            .setThumbnail(message.client.user.displayAvatarURL())
            .setDescription(
                `### **[ KERNEL_INTEGRITY ]**\n` +
                `> ✅ **Modules Passed:** \`${passed}\` / \`${commandFiles.length}\`\n` +
                `> ❌ **Modules Failed:** \`${failed}\`\n\n` +
                (failed > 0 ? `### **[ ERROR_LOG ]**\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n*+ ${errors.length - 5} more...*` : ''}` : `> 💎 **Status:** *All systems operational. Command hierarchy intact.*`)
            )
            .setFooter({ text: "BlueSealPrime • Kernel Diagnostics" })
            .setTimestamp();

        return statusMsg.edit({ content: null, embeds: [diagEmbed] });
    }
};
