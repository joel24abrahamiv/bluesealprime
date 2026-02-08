const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

module.exports = {
    name: "backup",
    description: "Manage server backups",
    usage: "!backup create | !backup load <id>",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) return message.reply("🚫 Only Owner can use backups.");

        const sub = args[0];

        if (sub === "create") {
            const msg = await message.reply("💾 Creating backup...");

            const backupData = {
                id: Date.now().toString(),
                name: message.guild.name,
                createdAt: new Date(),
                roles: message.guild.roles.cache.filter(r => !r.managed && r.name !== "@everyone").map(r => ({
                    name: r.name,
                    color: r.hexColor,
                    permissions: r.permissions.bitfield.toString(),
                    position: r.position,
                    hoist: r.hoist,
                    mentionable: r.mentionable
                })),
                channels: message.guild.channels.cache.filter(c => !c.thread).map(c => ({
                    name: c.name,
                    type: c.type,
                    topic: c.topic,
                    parentId: c.parentId, // This won't work on restore unless we map IDs. 
                    // Restoration logic needs to handle categories first.
                    position: c.position,
                    permissionOverwrites: [] // Simplifying for now. Saving overwrites is complex.
                }))
            };

            const filePath = path.join(BACKUP_DIR, `${backupData.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

            msg.edit(`✅ **Backup Created!** ID: \`${backupData.id}\`\nRoles: ${backupData.roles.length} | Channels: ${backupData.channels.length}`);
        } else if (sub === "list") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));
            message.reply(`📂 **Available Backups:**\n${files.map(f => f.replace(".json", "")).join("\n") || "None"}`);
        } else {
            message.reply("Usage: `!backup create` or `!backup list`. Use `!restore` to load.");
        }
    }
};
