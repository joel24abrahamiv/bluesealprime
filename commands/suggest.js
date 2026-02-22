const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/suggestions.json");

function loadData() {
    if (!fs.existsSync(DB_PATH)) {
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        return {};
    }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}

function saveData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "suggest",
    description: "💡 SUBMIT OR SETUP SUGGESTIONS",
    aliases: ["suggestion", "idea"],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        if (!args[0]) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.heading("ℹ️ SUGGESTION SYSTEM", 3), V2.text("Usage: `!suggest <idea>`\nSetup: `!suggest setup #channel`")], V2_RED)]
        });

        const sub = args[0].toLowerCase();

        // SETUP
        if (sub === "setup" || sub === "set") {
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.heading("🚫 PERMISSION DENIED", 3), V2.text("You need `Manage Guild` permission.")], V2_RED)]
                });
            }
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ INVALID CHANNEL", 3), V2.text("Please mention a valid channel.")], V2_RED)]
            });

            const data = loadData();
            data[message.guild.id] = channel.id;
            saveData(data);

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ SYSTEM CONFIGURED", 2),
                    V2.text(`**Suggestion Channel Set:** ${channel}`)
                ], V2_RED)]
            });
        }

        // SUBMIT SUGGESTION
        const data = loadData();
        const channelId = data[message.guild.id];

        if (!channelId) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ SYSTEM OFFLINE", 3), V2.text("Suggestions are not set up! Ask an admin to run `!suggest setup #channel`.")], V2_RED)]
            });
        }

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.heading("⚠️ ERROR", 3), V2.text("Suggestion channel not found. Please re-setup.")], V2_RED)]
        });

        const content = args.join(" ");

        // Convert Suggestion Embed to V2 Container
        const suggestionContainer = V2.container([
            V2.section([
                V2.heading("💡 NEW SUGGESTION", 2),
                V2.text(content)
            ], message.author.displayAvatarURL()),
            V2.separator(),
            V2.heading("📊 STATUS", 3),
            V2.text("Voting in progress..."),
            V2.separator(),
            V2.text(`*Submitted by ${message.author.tag} • BlueSealPrime Feedback*`)
        ], V2_BLUE);

        try {
            const sentMsg = await channel.send({ content: null, flags: V2.flag, components: [suggestionContainer] });
            await sentMsg.react("👍");
            await sentMsg.react("👎");

            await message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("✅ SUGGESTION SENT", 2), V2.text("Your idea has been submitted for review.")], V2_RED)]
            });
        } catch (e) {
            console.error(e);
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("❌ ERROR", 3), V2.text("Error sending suggestion.")], "#0099ff")]
            });
        }
    }
};
