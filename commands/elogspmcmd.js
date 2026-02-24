const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "elogspmcmd",
    description: "Global Administrator: Configure system-wide spam logs.",
    aliases: ["globalspmlog", "esplog"],

    async execute(message, args, commandName) {
        const { BOT_OWNER_ID } = require("../config");

        if (!message || !message.guild) return;

        // Global Auth Only
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply("⚠️ **SOVEREIGN_VIOLATION:** This command is restricted to the Primary Architect.");
        }

        const channelId = args[0] || message.mentions.channels.first()?.id;

        if (!channelId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🌐 GLOBAL SPAM CONFIGURATION", 2),
                    V2.text("Set the system-wide channel for cross-server spam activity tracking."),
                    V2.separator(),
                    V2.text(`**Usage:** \`!${commandName} <ChannelID>\``)
                ], V2_RED)]
            });
        }

        const SYS_PATH = path.join(__dirname, "../data/system.json");
        let systemData = {};
        if (fs.existsSync(SYS_PATH)) { try { systemData = JSON.parse(fs.readFileSync(SYS_PATH, "utf8")); } catch { } }

        systemData.GLOBAL_SPAM_LOG = channelId;
        fs.writeFileSync(SYS_PATH, JSON.stringify(systemData, null, 2));

        const successPanel = V2.container([
            V2.heading("🚀 GLOBAL LOGS SYNCHRONIZED", 2),
            V2.text(`Universal spam registry logs are now being mirrored to Sector \`${channelId}\`.`)
        ], V2_RED);

        return message.reply({ flags: V2.flag, components: [successPanel] });
    }
};
