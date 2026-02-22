const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
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

        const authContainer = V2.container([V2.text("🛰️ **Initializing Deep System Diagnostic...** Scanning command kernel.")], V2_BLUE);
        const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [authContainer] });

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
                errors.push(`\`${file}\`: Load Failure`);
            }
        }

        const errorLog = failed > 0
            ? `### **[ ERROR_LOG ]**\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n*+ ${errors.length - 5} more...*` : ''}`
            : `> 💎 **Status:** *All systems operational. Command hierarchy intact.*`;

        const diagContainer = V2.container([
            V2.section([
                V2.heading("🛡️ SYSTEM DIAGNOSTIC REPORT", 2),
                V2.text(
                    `### **[ KERNEL_INTEGRITY ]**\n` +
                    `> ✅ **Modules Passed:** \`${passed}\` / \`${commandFiles.length}\`\n` +
                    `> ❌ **Modules Failed:** \`${failed}\`\n\n` +
                    errorLog
                )
            ], V2.botAvatar(message)),
            V2.separator(),
            V2.text("*BlueSealPrime • Kernel Diagnostics Synced*")
        ], failed > 0 ? V2_RED : "#00FF7F");

        return statusMsg.edit({ content: null, components: [diagContainer] });
    }
};
