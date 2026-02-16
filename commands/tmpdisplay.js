const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "tmpdisplay",
    description: "Preview the Owner Tag security response",
    usage: "!tmpdisplay",

    async execute(message) {
        const clientUser = message.client.user;

        const tagEmbed = new EmbedBuilder()
            .setColor("#00EEFF") // BlueSeal Cyan
            .setAuthor({ name: "🛡️ SECURITY ALERT: MASTER DETECTED", iconURL: clientUser.displayAvatarURL() })
            .setThumbnail("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setDescription(
                `### **[ PROTECTION_PROTOCOL ]**\n` +
                `> 👑 **Subject:** <@${BOT_OWNER_ID}>\n` +
                `> 🛡️ **Status:** Currently under Sovereign Protection.\n\n` +
                `### **[ INTERROGATION_LOG ]**\n` +
                `> 👤 **Tagged by:** ${message.author} (\`${message.author.id}\`)\n` +
                `> 📂 **Location:** ${message.channel}\n\n` +
                `*\"Every mention is logged in the Audit Kernel. The Architect is watching through my eyes.\"*`
            )
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setFooter({ text: "BlueSealPrime Sovereign Shield • Master Defense Matrix", iconURL: clientUser.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [tagEmbed] });
    }
};
