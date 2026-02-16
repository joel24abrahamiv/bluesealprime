const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "elog",
    description: "Setup global/universal logging channels (Owner Only).",
    aliases: ["elogs", "glog", "globallog"],
    async execute(message, args) {
        // 🔒 OWNER ONLY
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply("⚠️ **Access Denied:** Only the Bot Owner can configure global logging.");
        }

        // CHECK IF GOD MODE IS ENABLED
        /*
        if (!global.GOD_MODE) {
            return message.reply("⚠️ **GOD MODE REQUIRED:** Execute `!eval` to toggle system override.");
        }
        */

        const DB_PATH = path.join(__dirname, "../data/elogs.json");

        // Ensure data directory exists
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try {
                data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
            } catch (e) { }
        }

        const type = args[0]?.toLowerCase();
        const subCommand = args[1]?.toLowerCase();

        const validTypes = [
            "message", "mod", "verify", "whitelist", "security", "server",
            "role", "file", "voice", "member", "action", "channel",
            "invite", "ticket", "admin", "quark", "raid", "misuse", "antinuke"
        ];

        if (!type || !validTypes.includes(type) || (subCommand !== "set" && subCommand !== "off")) {
            const helpEmbed = new EmbedBuilder()
                .setColor("#FF00FF") // Magenta for Global
                .setTitle("🌍 UNIVERSAL LOGGING SYSTEM (GLOBAL)")
                .setDescription("Configure separate channels for **ALL** servers' activities.")
                .addFields(
                    { name: "📝 Messages", value: "`!elog message set #chan`", inline: true },
                    { name: "🛡️ Moderation", value: "`!elog mod set #chan`", inline: true },
                    { name: "⚙️ Server/Logic", value: "`!elog server set #chan`", inline: true },
                    { name: "🎭 Roles", value: "`!elog role set #chan`", inline: true },
                    { name: "📁 Files", value: "`!elog file set #chan`", inline: true },
                    { name: "🔊 Voice/VC", value: "`!elog voice set #chan`", inline: true },
                    { name: "👥 Members", value: "`!elog member set #chan`", inline: true },
                    { name: "⚡ Actions", value: "`!elog action set #chan`", inline: true },
                    { name: "📺 Channels", value: "`!elog channel set #chan`", inline: true },
                    { name: "🔗 Invites", value: "`!elog invite set #chan`", inline: true },
                    { name: "🎫 Tickets", value: "`!elog ticket set #chan`", inline: true },
                    { name: "👑 Admin Cmds", value: "`!elog admin set #chan`", inline: true },
                    { name: "⚛️ Quark", value: "`!elog quark set #chan`", inline: true },
                    { name: "🚨 Raid Alerts", value: "`!elog raid set #chan`", inline: true },
                    { name: "✅ Verification", value: "`!elog verify set #chan`", inline: true },
                    { name: "📜 Whitelist", value: "`!elog whitelist set #chan`", inline: true },
                    { name: "🛡️ Security", value: "`!elog security set #chan`", inline: true },
                    { name: "🚫 Misuse", value: "`!elog misuse set #chan`", inline: true },
                    { name: "🛡️ Anti-Nuke", value: "`!elog antinuke set #chan`", inline: true }
                )
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Global Intelligence", iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [helpEmbed] });
        }

        if (subCommand === "set") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channel || channel.type !== 0) {
                return message.reply("❌ **Invalid Channel:** Please mention a valid text channel.");
            }

            // Save simply as "type": "channelID"
            data[type] = channel.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor("#FF00FF")
                .setTitle(`🌍 GLOBAL ${type.toUpperCase()} LOGGING CONNECTED`)
                .setDescription(`All **${type}** events from ALL servers will now stream to ${channel}.`)
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Global Intelligence" });

            return message.reply({ embeds: [successEmbed] });
        }

        if (subCommand === "off") {
            if (data[type]) {
                delete data[type];
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                return message.reply(`🔒 **Global ${type.toUpperCase()} Logging** has been disabled.`);
            }
            return message.reply(`⚠️ **Global ${type.toUpperCase()} logging is already disabled.**`);
        }
    }
};
