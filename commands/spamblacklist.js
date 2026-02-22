const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, ERROR_COLOR } = require("../config");

module.exports = {
    name: "spamblacklist",
    description: "Manage the automatic spam blacklist.",
    aliases: ["spmbl", "spamlist", "sbl"],
    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
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
                    V2.text("You do not have permission to manage the Spam Blacklist.")
                ], ERROR_COLOR)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/spamblacklist.json");
        let spambl = {};
        if (fs.existsSync(DB_PATH)) {
            try { spambl = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand || (subCommand !== "remove" && subCommand !== "list")) {
            const container = V2.container([
                V2.section([
                    V2.heading("🤖 SPAM INTELLIGENCE REPO", 2),
                    V2.text("Manage auto-bans from the rate limiter.")
                ], "https://cdn-icons-png.flaticon.com/512/2622/2622112.png"),
                V2.separator(),
                V2.heading("🛠️ OPERATIONS", 3),
                V2.text(`> \`!spmbl list\` - **View Active Spammers**\n> \`!spmbl remove <ID>\` - **Pardon Spammer**`),
                V2.separator(),
                V2.text("*BlueSealPrime Automated Defense*")
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "list") {
            const keys = Object.keys(spambl);
            if (keys.length === 0) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("✅ REGISTRY CLEAN", 2), V2.text("No active spam bans.")], V2_BLUE)]
            });

            const listItems = keys.map((id, i) => {
                const entry = spambl[id];
                const exp = entry.expires ? `<t:${Math.floor(entry.expires / 1000)}:R>` : "Never";
                return `**${i + 1}.** \`${id}\` - Ends: ${exp}`;
            });

            const listString = listItems.join("\n");

            const container = V2.container([
                V2.heading(`🤖 SPAM BLACKLIST (${keys.length})`, 2),
                V2.text(listString.length > 2000 ? listString.substring(0, 2000) + "..." : listString),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "remove") {
            const targetId = args[1];
            if (!targetId) return message.reply("❌ Provide ID.");

            if (!spambl[targetId]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ NOT LISTED", 3), V2.text("User is not in the spam list.")], require("../config").WARN_COLOR)]
            });

            delete spambl[targetId];
            fs.writeFileSync(DB_PATH, JSON.stringify(spambl, null, 2));

            const container = V2.container([
                V2.heading("🔓 PARDON GRANTED", 2),
                V2.text(`**User ID:** \`${targetId}\`\n**Status:** Auto-Ban Revoked`),
                V2.separator(),
                V2.text("User removed from spam blacklist.")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }
    }
};
