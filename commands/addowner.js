const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "addowner",
    description: "Add a user to the Extra Owners list (Acting Owner)",
    aliases: ["trust", "addtrust"],

    async execute(message, args) {
        // SECURITY: Only BOT OWNER can use this (Server Owner cannot add Extra Owners)
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply("⛔ **ACCESS DENIED:** Only the Bot Owner (Global Architect) can appoint Extra Owners.");
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply("⚠️ PLease specify a valid user to add.");
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const guildOwners = db[message.guild.id] || [];

        const isAlreadyOwner = guildOwners.some(o => (typeof o === 'string' ? o : o.id) === target.id);
        if (isAlreadyOwner) {
            return message.reply("⚠️ This user is already an Extra Owner.");
        }

        guildOwners.push({
            id: target.id,
            addedBy: message.author.id,
            addedAt: Date.now()
        });
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("👑 EXTRA OWNER APPOINTED")
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `### **[ AUTHORITY_GRANTED ]**\n` +
                `> **Entity:** ${target} (\`${target.id}\`)\n` +
                `> **Status:** ACTING OWNER\n` +
                `> **Clearance:** Level 4 (Sovereign Bypass)\n\n` +
                `*This user now bypasses all restrictions and possesses administrative parity with the Server Owner. Accountability for their actions rests with the Architect.*`
            )
            .setFooter({ text: "BlueSealPrime • Trust Chain Initiated" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};
