const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "elog",
    description: "Setup global/universal logging channels (Owner Only).",
    aliases: ["elogs", "glog", "globallog"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Access Denied:** Restricted to the Lead Architect.")], V2_RED)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/elogs.json");
        if (!fs.existsSync(path.join(__dirname, "../data"))) fs.mkdirSync(path.join(__dirname, "../data"));

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const type = args[0]?.toLowerCase();
        const subCommand = args[1]?.toLowerCase();

        const validTypes = [
            "message", "mod", "verify", "whitelist", "security", "server",
            "role", "file", "voice", "member", "action", "channel",
            "invite", "ticket", "admin", "quark", "raid", "misuse", "antinuke"
        ];

        if (!type || !validTypes.includes(type) || (subCommand !== "set" && subCommand !== "off")) {
            const sections = [
                V2.section([
                    V2.heading("🌍 UNIVERSAL LOGGING OS", 2),
                    V2.text("Configure central intelligence streams for all network nodes.")
                ], "https://cdn-icons-png.flaticon.com/512/3039/3039535.png"),
                V2.separator(),
                V2.text(
                    "> `!elog mod set #chan` | `!elog message set #chan`\n" +
                    "> `!elog antinuke set #chan` | `!elog raid set #chan`\n" +
                    "> `!elog admin set #chan` | `!elog security set #chan`"
                ),
                V2.separator(),
                V2.text("*BlueSealPrime • Global Intelligence Agency*")
            ];

            return message.reply({ content: null, flags: V2.flag, components: [V2.container(sections, "#FF00FF")] });
        }

        if (subCommand === "set") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channel || channel.type !== 0) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("❌ **Invalid Target:** Please mention a valid text channel.")], V2_RED)]
                });
            }

            data[type] = channel.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const successContainer = V2.container([
                V2.section([
                    V2.heading(`🌍 GLOBAL ${type.toUpperCase()} FEED CONNECTED`, 2),
                    V2.text(`Intel from all shards for **${type}** operations will now stream to ${channel}.`)
                ], "https://cdn-icons-png.flaticon.com/512/190/190411.png")
            ], "#FF00FF");

            return message.reply({ content: null, flags: V2.flag, components: [successContainer] });
        }

        if (subCommand === "off") {
            if (data[type]) {
                delete data[type];
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text(`🔒 **Global ${type.toUpperCase()} Feed** disconnected.`)], V2_RED)]
                });
            }
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text(`ℹ️ **Status:** Global ${type.toUpperCase()} feed is already offline.`)], V2_BLUE)]
            });
        }
    }
};
