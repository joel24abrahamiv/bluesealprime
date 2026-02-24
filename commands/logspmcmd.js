const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "logspmcmd",
    description: "Secure shortcut to configure spam blacklist logs for this server.",
    aliases: ["spmlog", "logspam"],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const { BOT_OWNER_ID } = require("../config");

        if (!message || !message.guild) return;

        // Auth Check
        const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner) return message.reply("⚠️ **Access Denied:** Sovereign authority required.");

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!channel || channel.type !== 0) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🛡️ SPAM LOG CONFIGURATION", 2),
                    V2.text("Set the channel where spam blacklist actions will be recorded."),
                    V2.separator(),
                    V2.text(`**Usage:** \`!${commandName} #channel\``)
                ], V2_BLUE)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/logs.json");
        let data = {};
        if (fs.existsSync(DB_PATH)) { try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { } }

        if (!data[message.guild.id]) data[message.guild.id] = {};
        data[message.guild.id].spam = channel.id;

        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

        const successPanel = V2.container([
            V2.heading("✅ SPAM REGISTRY LINKED", 2),
            V2.text(`Sovereign spam intercept logs have been routed to ${channel}.`)
        ], V2_BLUE);

        return message.reply({ flags: V2.flag, components: [successPanel] });
    }
};
