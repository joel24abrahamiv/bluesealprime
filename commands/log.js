const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "log",
    description: "Setup or disable server logging channels.",
    aliases: ["logs", "logging", "logset"],
    permissions: [PermissionsBitField.Flags.ManageGuild],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
            }).catch(() => { });
        }

        try {
            const DB_PATH = path.join(__dirname, "../data/logs.json");
            const dataDir = path.join(__dirname, "../data");
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

            let data = {};
            if (fs.existsSync(DB_PATH)) { try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { } }

            const type = args[0]?.toLowerCase();
            const subCommand = args[1]?.toLowerCase();
            const validTypes = ["message", "mod", "verify", "whitelist", "security", "server", "role", "file", "voice", "member", "action", "channel", "invite", "ticket", "admin", "quark", "raid", "misuse", "blacklist", "spam"];

            if (!type || !validTypes.includes(type) || (subCommand !== "set" && subCommand !== "off")) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("📋 UNIVERSAL LOGGING SYSTEM", 2),
                        V2.text("Configure separate channels for specific server activities."),
                        V2.separator(),
                        V2.heading("📝 Usage", 3),
                        V2.text(
                            `> **Set:** \`!log <type> set #channel\`\n> **Off:** \`!log <type> off\`\n\n` +
                            `**Available Types:**\n> \`message\` \`mod\` \`server\` \`role\` \`file\` \`voice\`\n> \`member\` \`action\` \`channel\` \`invite\` \`ticket\` \`admin\`\n> \`quark\` \`raid\` \`verify\` \`whitelist\` \`security\` \`misuse\` \`blacklist\` \`spam\``
                        ),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Logging Module*")
                    ], V2_BLUE)]
                });
            }

            if (!data[message.guild.id]) data[message.guild.id] = {};

            if (subCommand === "set") {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
                if (!channel || channel.type !== 0)
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Invalid Channel:** Please mention a valid text channel.")], V2_RED)] });

                data[message.guild.id][type] = channel.id;
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading(`✅ ${type.toUpperCase()} LOGGING ENABLED`, 2),
                        V2.text(`${type.charAt(0).toUpperCase() + type.slice(1)} logs will now be sent to ${channel}.`)
                    ], V2_BLUE)]
                });
            }

            if (subCommand === "off") {
                if (data[message.guild.id]?.[type]) {
                    delete data[message.guild.id][type];
                    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔒 **${type.toUpperCase()} Logging** has been disabled.`)], V2_BLUE)] });
                }
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`⚠️ **${type.toUpperCase()} logging is already disabled.**`)], V2_BLUE)] });
            }

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "log", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            console.error(err);
            const errorPanel = V2.container([
                V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                V2.text(`### **Module Fault**\n> **Module:** \`log\`\n> **Error:** \`${err.message}\` `)
            ], V2_RED);
            return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
        }
    }
};