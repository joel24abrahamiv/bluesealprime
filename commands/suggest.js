const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
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
        if (!args[0]) return message.reply("Usage: `!suggest <idea>` or `!suggest setup #channel`");

        const sub = args[0].toLowerCase();

        // SETUP
        if (sub === "setup" || sub === "set") {
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply("🚫 You need `Manage Guild` permission to setup.");
            }
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply("Please mention a valid channel.");

            const data = loadData();
            data[message.guild.id] = channel.id;
            saveData(data);

            return message.reply(`✅ **Suggestion Channel Set:** ${channel}`);
        }

        // SUBMIT SUGGESTION
        const data = loadData();
        const channelId = data[message.guild.id];

        if (!channelId) {
            return message.reply("⚠️ Suggestions are not set up! Ask an admin to run `!suggest setup #channel`.");
        }

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) return message.reply("⚠️ Suggestion channel not found. Please re-setup.");

        const content = args.join(" "); // Capture full content

        const embed = new EmbedBuilder()
            .setColor("#00AAFF")
            .setAuthor({ name: `New Suggestion from ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setDescription(content)
            .addFields({ name: "Status", value: "📊 Voting in progress..." })
            .setTimestamp()
            .setFooter({ text: "BlueSealPrime • Feedback System" });

        try {
            const sentMsg = await channel.send({ embeds: [embed] });
            await sentMsg.react("👍");
            await sentMsg.react("👎");

            await message.reply("✅ **Suggestion Sent!**");
        } catch (e) {
            console.error(e);
            message.reply("❌ Error sending suggestion.");
        }
    }
};
