const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "delowner",
    description: "Remove a user from the Extra Owners list",
    aliases: ["untrust", "removetrust", "deltrust"],

    async execute(message, args) {
        // SECURITY: Only BOT OWNER can use this (Server Owner cannot remove Extra Owners)
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply("⛔ **ACCESS DENIED:** Only the Bot Owner (Global Architect) can remove Extra Owners.");
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply("⚠️ PLease specify a valid user to remove.");
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        let guildOwners = db[message.guild.id] || [];

        if (!guildOwners.includes(target.id)) {
            return message.reply("⚠️ This user is NOT an Extra Owner.");
        }

        guildOwners = guildOwners.filter(id => id !== target.id);
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🗑️ EXTRA OWNER REMOVED")
            .setDescription(`**Target:** ${target.tag} (\`${target.id}\`)\n**Status:** REVOKED\n\n> *This user no longer has Acting Owner privileges.*`)
            .setFooter({ text: "BlueSealPrime • Trust Revoked" });

        return message.channel.send({ embeds: [embed] });
    }
};
