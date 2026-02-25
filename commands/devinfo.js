const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "devinfo",
    description: "View Bot Credits & Developer Data",
    aliases: ["dev", "credits"],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED } = require("../config");
        const V2 = require("../utils/v2Utils");
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "devinfo", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            const clientUser = message.client.user;
            const devEmbed = new EmbedBuilder()
                .setColor("#00EEFF")
                .setTitle("🛡️ BLUESEALPRIME: THE ARCHITECTS")
                .setThumbnail(clientUser.displayAvatarURL())
                .setDescription(
                    `**[ CORE_DEVELOPER ]**\n` +
                    `> 👤 **Lead Developer:** <@${BOT_OWNER_ID}>\n` +
                    `> 🛠️ **System:** Node.js / Discord.js v14\n` +
                    `> 🧩 **Architecture:** BlueSeal Sovereign v2.1\n\n` +
                    `**[ THE_ARCHITECT_GUIDE ]**\n` +
                    `> 🧠 **Architect's Guide:** <@1327564898460242015>\n` +
                    `> *"The visionary who taught me the foundations of BlueSealPrime. Respect to the mentor."*\n\n` +
                    `**[ OPERATIONAL_STRENGTH ]**\n` +
                    `> 🚀 **Environment:** Quantum-Ready Cloud Node\n` +
                    `> 🛡️ **Anti-Nuke:** Military-Grade Interrogation Protocols\n` +
                    `> ⚡ **Heartbeat:** ${message.client.ws.ping}ms`
                )
                .setFooter({ text: "BlueSealPrime • Priority Alpha • Infinite Support", iconURL: clientUser.displayAvatarURL() })
                .setTimestamp();

            return message.reply({ embeds: [devEmbed] });
        } catch (err) {
            console.error(err);
            return message.reply({ content: `❌ **SYSTEM_ERROR:** ${err.message}`, flags: V2.flag }).catch(() => { });
        }
    }
};