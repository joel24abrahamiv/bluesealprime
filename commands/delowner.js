const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "delowner",
    description: "Remove a user from the Extra Owners list (Server/Bot Owner only)",
    aliases: ["untrust", "removetrust", "deltrust"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** Revocation protocols are restricted to the Lead Architect or Node Monarch.")], V2_RED)]
            });
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Fault:** Please specify a valid entity to revoke.")], V2_RED)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        let guildOwners = db[message.guild.id] || [];
        const index = guildOwners.findIndex(o => (typeof o === 'string' ? o : o.id) === target.id);

        if (index === -1) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid State:** This entity does not hold delegated sovereign authority.")], V2_BLUE)]
            });
        }

        guildOwners.splice(index, 1);
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const container = V2.container([
            V2.section([
                V2.heading("🗑️ EXTRA OWNER REVOKED", 2),
                V2.text(
                    `### **[ AUTHORITY_TERMINATED ]**\n` +
                    `> **Target:** ${target.tag} (\`${target.id}\`)\n` +
                    `> **Status:** \`REVOKED\`\n` +
                    `> **Revoked By:** ${message.author}\n\n` +
                    `> *Action: All sovereign acting privileges have been purged from the node registry.*`
                )
            ], target.displayAvatarURL({ dynamic: true })),
            V2.separator(),
            V2.text("*BlueSealPrime • Trust Revocation Complete*")
        ], V2_RED);

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }
};
