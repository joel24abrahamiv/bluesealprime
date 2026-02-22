const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, ERROR_COLOR, WARN_COLOR } = require("../config");

module.exports = {
    name: "blacklist",
    description: "Globally blacklist a user from using the bot and joining servers.",
    aliases: ["bl"],
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
                    V2.text("You do not have permission to manage the Global Blacklist.")
                ], ERROR_COLOR)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/blacklist.json");

        // Load & Migrate
        let blacklist = {};
        if (fs.existsSync(DB_PATH)) {
            try {
                const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
                if (Array.isArray(data)) {
                    // MIGRATION: Convert Array to Object
                    data.forEach(id => blacklist[id] = { reason: "Legacy Ban", expires: null, timestamp: Date.now() });
                    fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));
                    console.log("🔄 Migrated Blacklist to V2 Schema");
                } else {
                    blacklist = data;
                }
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
            if (!targetId) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("❌ MISSING TARGET", 3), V2.text("Please provide a User ID or Mention.")], ERROR_COLOR)]
            });

            // Extract ID from mention if present
            const mentionMatch = targetId.match(/^<@!?(\d{17,20})>$/);
            if (mentionMatch) targetId = mentionMatch[1];

            if (!/^\d{17,20}$/.test(targetId)) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("❌ INVALID ID", 3), V2.text("Please provide a valid User ID (17-20 digits).")], ERROR_COLOR)]
            });

            if (blacklist[targetId]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ ALREADY LISTED", 3), V2.text("User is already in the blacklist.")], WARN_COLOR)]
            });

            // Parse Duration (optional)
            let days = 0;
            let reasonStartIndex = 2; // Default: args[0]=add, args[1]=ID, args[2]=Reason OR Days

            // Check if args[2] is a number (days)
            if (args[2] && !isNaN(args[2])) {
                days = parseInt(args[2]);
                reasonStartIndex = 3;
            }

            const reason = args.slice(reasonStartIndex).join(" ") || "Manual Ban";
            const expires = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : null;
            const expiryText = days > 0 ? `${days} Days` : "Permanent";
            const expiryDate = expires ? `<t:${Math.floor(expires / 1000)}:R>` : "Never";

            try {
                const dmContainer = V2.container([
                    V2.section(
                        [
                            V2.heading("🚫 SECURITY ALERT", 2),
                            V2.text(`You have been **globally blacklisted** from BlueSealPrime services.`)
                        ],
                        "https://cdn-icons-png.flaticon.com/512/3524/3524812.png"
                    ),
                    V2.separator(),
                    V2.heading("📋 ACCESS REVOKED", 3),
                    V2.text(`> **Reason:** ${reason}\n> **Duration:** ${expiryText}`),
                    V2.separator(),
                    V2.text(`*BlueSealPrime Global Security*`)
                ], V2_RED);

                const user = await message.client.users.fetch(targetId).catch(() => null);
                if (user) await user.send({ content: null, flags: V2.flag, components: [dmContainer] }).catch(() => { });
            } catch (e) { }

            blacklist[targetId] = {
                reason: reason,
                expires: expires,
                timestamp: Date.now()
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🚫 SECURITY ACTION: BLOCK", 2),
                        V2.text(`**Target:** <@${targetId}>\n**ID:** \`${targetId}\`\n**Status:** Globally Blacklisted`)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/3524/3524812.png" // Shield
                ),
                V2.separator(),
                V2.heading("📝 DETAILS", 3),
                V2.text(`> **Duration:** ${expiryText} (${expiryDate})\n> **Reason:** ${reason}`),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "remove") {
            const targetId = args[1];
            if (!targetId) return message.reply("❌ Provide ID.");

            if (!blacklist[targetId]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ NOT LISTED", 3), V2.text("User is not in the blacklist.")], WARN_COLOR)]
            });

            delete blacklist[targetId];
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            const container = V2.container([
                V2.heading("🔓 SECURITY ACTION: UNBLOCK", 2),
                V2.text(`**User ID:** \`${targetId}\`\n**Status:** Access Restored`),
                V2.separator(),
                V2.text("The target has been removed from the blacklist.")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "list") {
            const keys = Object.keys(blacklist);
            if (keys.length === 0) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("📋 BLACKLIST EMPTY", 2), V2.text("No users are currently blacklisted.")], V2_BLUE)]
            });

            // Simple pagination or truncation
            const listItems = keys.map((id, i) => {
                const entry = blacklist[id];
                const exp = entry.expires ? `<t:${Math.floor(entry.expires / 1000)}:R>` : "Never";
                return `**${i + 1}.** \`${id}\` (${entry.reason}) - Exp: ${exp}`;
            });

            const listString = listItems.join("\n");

            const container = V2.container([
                V2.heading(`🚫 GLOBAL BLACKLIST (${keys.length})`, 2),
                V2.text(listString.length > 2000 ? listString.substring(0, 2000) + "..." : listString),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }
    }
};
