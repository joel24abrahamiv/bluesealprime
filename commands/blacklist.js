const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "blacklist",
    description: "Globally blacklist a user from using the bot and joining servers.",
    aliases: ["bl"],
    async execute(message, args) {
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

        // Restricted to Bot Owner, Server Owner, and Extra Owners
        if (!isBotOwner && !isServerOwner && !isExtraOwner) {
            return message.reply("⚠️ **Access Denied:** You do not have permission to manage the Global Blacklist.");
        }

        const DB_PATH = path.join(__dirname, "../data/blacklist.json");

        let blacklist = [];
        if (fs.existsSync(DB_PATH)) {
            blacklist = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand || (subCommand !== "add" && subCommand !== "remove" && subCommand !== "list")) {
            const helpEmbed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("🚫 GLOBAL BLACKLIST SYSTEM")
                .setDescription("Control the global security list.")
                .addFields(
                    { name: "➕ Add", value: "`!blacklist add <UserID>`", inline: true },
                    { name: "➖ Remove", value: "`!blacklist remove <UserID>`", inline: true },
                    { name: "📋 List", value: "`!blacklist list`", inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Global Security" });

            return message.reply({ embeds: [helpEmbed] });
        }

        if (subCommand === "add") {
            const targetId = args[1];
            if (!targetId || isNaN(targetId)) return message.reply("❌ **Invalid ID:** Please provide a valid User ID.");

            if (blacklist.includes(targetId)) return message.reply("⚠️ **User is already blacklisted.**");

            blacklist.push(targetId);
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            return message.reply(`✅ **User ID \`${targetId}\` has been globally blacklisted.**`);
        }

        if (subCommand === "remove") {
            const targetId = args[1];
            if (!targetId) return message.reply("❌ **Invalid ID:** Please provide a valid User ID.");

            const index = blacklist.indexOf(targetId);
            if (index === -1) return message.reply("⚠️ **User is not in the blacklist.**");

            blacklist.splice(index, 1);
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            return message.reply(`✅ **User ID \`${targetId}\` has been removed from the blacklist.**`);
        }

        if (subCommand === "list") {
            if (blacklist.length === 0) return message.reply("✅ **The blacklist is currently empty.**");

            return message.reply(`📋 **Global Blacklist:**\n\`${blacklist.join(", ")}\``);
        }
    }
};
