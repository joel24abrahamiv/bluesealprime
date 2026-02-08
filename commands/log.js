const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "log",
    description: "Setup or disable server logging.",
    aliases: ["logs", "logging", "logset"],
    permissions: [PermissionsBitField.Flags.ManageGuild],
    async execute(message, args) {
        const DB_PATH = path.join(__dirname, "../data/logs.json");

        // Ensure data directory exists
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        }

        const type = args[0]?.toLowerCase(); // e.g., message, mod, server
        const subCommand = args[1]?.toLowerCase(); // set or off

        const validTypes = [
            "message", "mod", "verify", "whitelist", "security", "server",
            "role", "file", "voice", "member", "action", "channel",
            "invite", "ticket", "admin", "quark", "raid", "misuse"
        ];

        if (!type || !validTypes.includes(type) || (subCommand !== "set" && subCommand !== "off")) {
            const helpEmbed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("📋 UNIVERSAL LOGGING SYSTEM")
                .setDescription("Configure separate channels for specific server activities.")
                .addFields(
                    { name: "📝 Messages", value: "`!log message set #chan`", inline: true },
                    { name: "🛡️ Moderation", value: "`!log mod set #chan`", inline: true },
                    { name: "⚙️ Server/Logic", value: "`!log server set #chan`", inline: true },
                    { name: "🎭 Roles", value: "`!log role set #chan`", inline: true },
                    { name: "📁 Files", value: "`!log file set #chan`", inline: true },
                    { name: "🔊 Voice/VC", value: "`!log voice set #chan`", inline: true },
                    { name: "👥 Members", value: "`!log member set #chan`", inline: true },
                    { name: "⚡ Actions", value: "`!log action set #chan`", inline: true },
                    { name: "📺 Channels", value: "`!log channel set #chan`", inline: true },
                    { name: "🔗 Invites", value: "`!log invite set #chan`", inline: true },
                    { name: "🎫 Tickets", value: "`!log ticket set #chan`", inline: true },
                    { name: "👑 Admin Cmds", value: "`!log admin set #chan`", inline: true },
                    { name: "⚛️ Quark", value: "`!log quark set #chan`", inline: true },
                    { name: "🚨 Raid Alerts", value: "`!log raid set #chan`", inline: true },
                    { name: "✅ Verification", value: "`!log verify set #chan`", inline: true },
                    { name: "📜 Whitelist", value: "`!log whitelist set #chan`", inline: true },
                    { name: "🛡️ Security", value: "`!log security set #chan`", inline: true },
                    { name: "🚫 Misuse of Power", value: "`!log misuse set #chan`", inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Security Systems", iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [helpEmbed] });
        }

        if (!data[message.guild.id]) data[message.guild.id] = {};

        if (subCommand === "set") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channel || channel.type !== 0) {
                return message.reply("❌ **Invalid Channel:** Please mention a valid text channel.");
            }

            data[message.guild.id][type] = channel.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor("#00FFFF")
                .setTitle(`✅ ${type.toUpperCase()} LOGGING ENABLED`)
                .setDescription(`${type.charAt(0).toUpperCase() + type.slice(1)} logs will now be sent to ${channel}.`)
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Security Systems" });

            return message.reply({ embeds: [successEmbed] });
        }

        if (subCommand === "off") {
            if (data[message.guild.id] && data[message.guild.id][type]) {
                delete data[message.guild.id][type];
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                return message.reply(`🔒 **${type.toUpperCase()} Logging** has been disabled.`);
            }
            return message.reply(`⚠️ **${type.toUpperCase()} logging is already disabled.**`);
        }
    }
};
