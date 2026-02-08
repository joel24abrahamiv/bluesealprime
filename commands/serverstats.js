const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "serverstats.json");

function loadData() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}

function saveData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "serverstats",
    description: "Setup server statistic counters",
    usage: "!serverstats setup | !serverstats delete",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 You need Administrator permissions.");
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "setup") {
            const tempMsg = await message.reply("📊 **Setting up Server Stats...** (This may take a moment)");

            try {
                // Create Category
                const category = await message.guild.channels.create({
                    name: "📊 Server Stats 📊",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.Connect], // Deny connect so people don't join
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });

                // Create Channels
                const totalMembers = await message.guild.channels.create({
                    name: `Total Members: ${message.guild.memberCount}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                const botCount = message.guild.members.cache.filter(m => m.user.bot).size;
                const bots = await message.guild.channels.create({
                    name: `Bots: ${botCount}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                // Save to DB
                const data = loadData();
                data[message.guild.id] = {
                    categoryId: category.id,
                    totalId: totalMembers.id,
                    botsId: bots.id
                };
                saveData(data);

                return tempMsg.edit("✅ **Server Stats Created!**\nChannels will update every 10 minutes.");
            } catch (e) {
                console.error(e);
                return tempMsg.edit("❌ Failed to create channels. Check my permissions.");
            }
        }

        if (sub === "delete") {
            const data = loadData();
            if (!data[message.guild.id]) return message.reply("⚠️ No stats setup found.");

            const config = data[message.guild.id];

            // Delete channels
            try {
                const cat = message.guild.channels.cache.get(config.categoryId);
                const tot = message.guild.channels.cache.get(config.totalId);
                const bots = message.guild.channels.cache.get(config.botsId);

                if (tot) await tot.delete();
                if (bots) await bots.delete();
                if (cat) await cat.delete();
            } catch (e) { }

            delete data[message.guild.id];
            saveData(data);
            return message.reply("🗑️ **Server Stats removed.**");
        }

        return message.reply("Usage: `!serverstats setup` or `!serverstats delete`");
    }
};
