const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "devinfo",
    description: "View Bot Credits & Developer Data",
    aliases: ["dev", "credits"],

    async execute(message) {
        const clientUser = message.client.user;
        const devEmbed = new EmbedBuilder()
            .setColor("#FFD700") // Gold
            .setTitle("👑 DEVELOPER INFORMATION")
            .setThumbnail(clientUser.displayAvatarURL())
            .setDescription(
                `### **[ CORE_DEVELOPER ]**\n` +
                `> 👤 **Lead Developer:** <@${BOT_OWNER_ID}>\n` +
                `> 🛠️ **Language:** \`Node.js / Discord.js @Latest\`\n` +
                `> 🧩 **Framework:** \`BlueSeal Architecture v2.0\`\n\n` +
                `### **[ SYSTEM_STATUS ]**\n` +
                `> 🚀 **Host:** \`Hyper-Performance Cloud\`\n` +
                `> 🛡️ **Encryption:** \`AES-256 Global Standard\`\n` +
                `> ⚡ **Latency:** \`${message.client.ws.ping}ms\`\n\n` +
                `**Developed by <@${BOT_OWNER_ID}> to ensure your server remains safe and organized.**`
            )
            .setFooter({ text: "BlueSealPrime • Priority Alpha Origin", iconURL: clientUser.displayAvatarURL() });

        return message.reply({ embeds: [devEmbed] });
    }
};
