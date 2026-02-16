const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "devinfo",
    description: "View Bot Credits & Developer Data",
    aliases: ["dev", "credits"],

    async execute(message) {
        const clientUser = message.client.user;
        const MENTOR_ID = "1327564898460242015"; // sctipy

        const devEmbed = new EmbedBuilder()
            .setColor("#00EEFF") // Cyan
            .setTitle("🛡️ BLUESEALPRIME: THE ARCHITECTS")
            .setThumbnail(clientUser.displayAvatarURL())
            .setDescription(
                `### **[ CORE_DEVELOPER ]**\n` +
                `> 👤 **Lead Developer:** <@${BOT_OWNER_ID}>\n` +
                `> 🛠️ **System:** Node.js / Discord.js v14\n` +
                `> 🧩 **Architecture:** BlueSeal Sovereign v2.1\n\n` +
                `### **[ THE_ARCHITECT_GUIDE ]**\n` +
                `> 🧠 **Architect's Guide:** <@1327564898460242015>\n` +
                `> *"The visionary who taught me the foundations of BlueSealPrime. Respect to the mentor."*\n\n` +
                `### **[ OPERATIONAL_STRENGTH ]**\n` +
                `> 🚀 **Environment:** Quantum-Ready Cloud Node\n` +
                `> 🛡️ **Anti-Nuke:** Military-Grade Interrogation Protocols\n` +
                `> ⚡ **Heartbeat:** ${message.client.ws.ping}ms\n`
            )
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setFooter({ text: "BlueSealPrime • Priority Alpha • Infinite Support", iconURL: clientUser.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [devEmbed] });
    }
};
