const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, ERROR_COLOR, WARN_COLOR } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "blacklist",
    description: "Globally blacklist a user from using the bot and joining servers.",
    aliases: ["bl"],

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
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            const ownersDbPath = path.join(__dirname, "../data/owners.json");
            let extraOwners = [];
            if (fs.existsSync(ownersDbPath)) {
                try {
                    const db = JSON.parse(fs.readFileSync(ownersDbPath, "utf8"));
                    extraOwners = db[message.guild.id] || [];
                } catch (e) { }
            }
            const isExtraOwner = extraOwners.includes(message.author.id);

            if (!isBotOwner && !isServerOwner && !isExtraOwner) {
                return message.reply({
                    components: [V2.container([
                        V2.heading("🚫 ACCESS DENIED", 3),
                        V2.text("You do not have permission to manage the Global Blacklist.")
                    ], ERROR_COLOR)]
                });
            }

            const DB_PATH = path.join(__dirname, "../data/blacklist.json");
            let blacklist = {};
            if (fs.existsSync(DB_PATH)) {
                try {
                    blacklist = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
                } catch (e) { }
            }

            const subCommand = args[0]?.toLowerCase();

            if (!subCommand || (subCommand !== "add" && subCommand !== "remove" && subCommand !== "list")) {
                const container = V2.container([
                    V2.section([
                        V2.heading("🚫 GLOBAL BLACKLIST CONTROL", 2),
                        V2.text("Manage the global security blocklist.")
                    ], "https://cdn-icons-png.flaticon.com/512/3524/3524812.png"),
                    V2.separator(),
                    V2.heading("🛠️ OPERATIONS", 3),
                    V2.text(`> \`!blacklist add <ID> [days] [reason]\` - **Block User**\n> \`!blacklist remove <ID>\` - **Unblock User**\n> \`!blacklist list\` - **View Registry**`),
                    V2.separator(),
                    V2.text("*BlueSealPrime Global Security Network*")
                ], V2_BLUE);
                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            if (subCommand === "add") {
                let targetId = args[1];
                if (!targetId) return message.reply("❌ Provide Target ID.");
                const mentionMatch = targetId.match(/^<@!?(\d{17,20})>$/);
                if (mentionMatch) targetId = mentionMatch[1];

                if (blacklist[targetId]) return message.reply("⚠️ User already blacklisted.");

                let days = 0;
                let reasonStartIndex = 2;
                if (args[2] && !isNaN(args[2])) {
                    days = parseInt(args[2]);
                    reasonStartIndex = 3;
                }

                const reason = args.slice(reasonStartIndex).join(" ") || "Manual Ban";
                const expires = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : null;
                const expiryText = days > 0 ? `${days} Days` : "Permanent";

                blacklist[targetId] = { reason, expires, timestamp: Date.now() };
                fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

                // Logging
                const logsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/logs.json"), "utf8") || "{}");
                const sysData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/system.json"), "utf8") || "{}");
                const logChanId = logsData[message.guild.id]?.blacklist;
                const globalLogId = sysData.GLOBAL_SPAM_LOG;

                const logEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("🛡️ BLACKLIST_ADD")
                    .addFields(
                        { name: "👤 USER", value: `<@${targetId}> (\`${targetId}\`)`, inline: true },
                        { name: "👮 ADMIN", value: `${message.author.tag}`, inline: true },
                        { name: "📝 REASON", value: reason, inline: false }
                    ).setTimestamp();

                [logChanId, globalLogId].forEach(async id => {
                    if (id) {
                        const chan = message.client.channels.cache.get(id) || await message.client.channels.fetch(id).catch(() => null);
                        if (chan) chan.send({ embeds: [logEmbed] }).catch(() => { });
                    }
                });

                return message.reply(`✅ Successfully blacklisted <@${targetId}> (${expiryText}).`);
            }

            if (subCommand === "remove") {
                const targetId = args[1];
                if (!targetId || !blacklist[targetId]) return message.reply("❌ Invalid or missing ID.");

                delete blacklist[targetId];
                fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));
                return message.reply(`✅ Removed <@${targetId}> from blacklist.`);
            }

            if (subCommand === "list") {
                const keys = Object.keys(blacklist);
                if (keys.length === 0) return message.reply("📋 Blacklist is empty.");
                const listText = keys.map((id, i) => `**${i + 1}.** \`${id}\` - ${blacklist[id].reason}`).join("\n");
                return message.reply({ embeds: [new EmbedBuilder().setTitle("🚫 Blacklist Registry").setDescription(listText.slice(0, 4000)).setColor(V2_BLUE)] });
            }

        } catch (err) {
            console.error(err);
            return message.reply(`❌ Error: ${err.message}`);
        }
    }
};