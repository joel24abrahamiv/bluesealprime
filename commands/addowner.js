const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "addowner",
    description: "Add a user to the Extra Owners list (Server/Bot Owner only)",
    aliases: ["trust", "addtrust"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** This protocol is restricted to the Lead Architect or Node Monarch.")], V2_RED)]
            });
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Fault:** Please specify a valid entity to elevate.")], V2_RED)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const guildOwners = db[message.guild.id] || [];
        const isAlreadyOwner = guildOwners.some(o => (typeof o === 'string' ? o : o.id) === target.id);

        if (isAlreadyOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Redundancy:** This entity already possesses delegated sovereign authority.")], V2_BLUE)]
            });
        }

        guildOwners.push({
            id: target.id,
            addedBy: message.author.id,
            addedAt: Date.now()
        });
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const container = V2.container([
            V2.section([
                V2.heading("👑 EXTRA OWNER APPOINTED", 2),
                V2.text(
                    `### **[ AUTHORITY_GRANTED ]**\n` +
                    `> **Entity:** ${target} (\`${target.id}\`)\n` +
                    `> **Status:** \`ACTING OWNER\`\n` +
                    `> **Promoter:** ${message.author}\n\n` +
                    `*This user now bypasses all restrictions and possesses administrative parity with the Server Owner within this node.*`
                )
            ], target.displayAvatarURL({ dynamic: true })),
            V2.separator(),
            V2.text("*BlueSealPrime • Trust Chain Initiated*")
        ], V2_BLUE);

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }
};
