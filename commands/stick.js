const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/sticky.json");

function loadData() {
    if (!fs.existsSync(DB_PATH)) {
        // Ensure dir
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}

function saveData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "stick",
    description: "📌 MAKE A MESSAGE STICK TO THE BOTTOM",
    aliases: ["sticky", "stickymsg"],
    permissions: [PermissionsBitField.Flags.ManageMessages],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("🚫 You need `Manage Messages` permission.");
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "off" || sub === "stop" || sub === "delete") {
            const data = loadData();
            if (data[message.channel.id]) {
                delete data[message.channel.id];
                saveData(data);
                return message.reply("✅ **Sticky Message Removed.**");
            }
            return message.reply("⚠️ No sticky message active in this channel.");
        }

        const content = args.join(" ");
        if (!content) return message.reply("Usage: `!stick <message>` or `!stick off`");

        const data = loadData();
        data[message.channel.id] = {
            content: content,
            lastId: null // We will track the last message ID to delete it
        };
        saveData(data);

        // Send the initial message
        const embed = new EmbedBuilder()
            .setColor("#FFFF00")
            .setTitle("📌 STICKY MESSAGE")
            .setDescription(content)
            .setFooter({ text: "Please read above." });

        const sent = await message.channel.send({ embeds: [embed] });
        data[message.channel.id].lastId = sent.id;
        saveData(data);

        // Delete the command message to keep chat clean? Optional.
        message.delete().catch(() => { });
    }
};
