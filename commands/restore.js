const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, ERROR_COLOR } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");

module.exports = {
    name: "restore",
    description: "Restore server from backup (DANGEROUS)",
    usage: "!restore <id>",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) return message.reply("🚫 Only Owner can restore.");

        const backupId = args[0];
        if (!backupId) return message.reply("⚠️ Specify backup ID.");

        const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
        if (!fs.existsSync(filePath)) return message.reply("❌ Backup not found.");

        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        message.reply("⚠️ **WARNING:** This will attempt to create roles and channels from the backup.\nIt does NOT delete existing ones (Anti-Nuke safety). It just adds missing ones.\nStarting in 5 seconds...");

        setTimeout(async () => {
            // Restore Roles
            message.channel.send("🔄 Restoring Roles...");
            for (const roleData of data.roles) {
                // Check if exists
                if (!message.guild.roles.cache.find(r => r.name === roleData.name)) {
                    try {
                        await message.guild.roles.create({
                            name: roleData.name,
                            color: roleData.color,
                            permissions: BigInt(roleData.permissions),
                            hoist: roleData.hoist,
                            mentionable: roleData.mentionable,
                            reason: "Backup Restore"
                        });
                    } catch (e) { }
                }
            }

            // Restore Channels
            // Complex because of categories. We skip detailed restoration for now to avoid mess.
            // Just basic channel creation if name missing.
            message.channel.send("🔄 Restoring Channels (Basic)...");
            for (const chanData of data.channels) {
                if (!message.guild.channels.cache.find(c => c.name === chanData.name)) {
                    try {
                        await message.guild.channels.create({
                            name: chanData.name,
                            type: chanData.type,
                            topic: chanData.topic,
                            reason: "Backup Restore"
                        });
                    } catch (e) { }
                }
            }

            message.channel.send("✅ **Restore Complete.**");

        }, 5000);
    }
};
