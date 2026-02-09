const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, EMBED_COLOR } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

module.exports = {
    name: "backup",
    description: "Military-Grade Server Backup System",
    usage: "!backup create | !backup list | !backup delete <id>",
    aliases: ["bk"],
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Server or Bot Owner can manage archives.");
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "create") {
            const initEmbed = new EmbedBuilder()
                .setColor("#00FFFF") // Cyan Pulse
                .setTitle("📡 INITIALIZING SERVER SCAN")
                .setDescription("```diff\n+ Accessing Discord API Matrix\n+ Analyzing Structural DNA\n+ Serializing Sector Permissions\n```")
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934983938068/line-blue.gif")
                .setFooter({ text: "BlueSealPrime • Priority Alpha Archive" });

            const status = await message.channel.send({ embeds: [initEmbed] });

            try {
                // Generate a readable ID: ServerName_DDMM_HHMM
                const date = new Date();
                const timestamp = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
                const backupId = `${message.guild.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10)}_${timestamp}`;

                const backupData = {
                    id: backupId,
                    guildName: message.guild.name,
                    guildId: message.guild.id,
                    createdAt: date.toISOString(),
                    settings: {
                        verificationLevel: message.guild.verificationLevel,
                        defaultMessageNotifications: message.guild.defaultMessageNotifications,
                        explicitContentFilter: message.guild.explicitContentFilter,
                        afkChannelId: message.guild.afkChannelId,
                        afkTimeout: message.guild.afkTimeout,
                        systemChannelId: message.guild.systemChannelId,
                        rulesChannelId: message.guild.rulesChannelId,
                        publicUpdatesChannelId: message.guild.publicUpdatesChannelId,
                        preferredLocale: message.guild.preferredLocale,
                        features: message.guild.features
                    },
                    roles: message.guild.roles.cache
                        .filter(r => !r.managed && r.name !== "@everyone")
                        .sort((a, b) => b.position - a.position)
                        .map(r => ({
                            id: r.id,
                            name: r.name,
                            color: r.hexColor,
                            permissions: r.permissions.bitfield.toString(),
                            hoist: r.hoist,
                            mentionable: r.mentionable
                        })),
                    emojis: message.guild.emojis.cache.map(e => ({ name: e.name, url: e.url })),
                    stickers: message.guild.stickers.cache.map(s => ({ name: s.name, description: s.description, tags: s.tags })),
                    channels: []
                };

                // Map categories first (Sorted by position)
                const categories = message.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .sort((a, b) => a.position - b.position);

                categories.forEach(cat => {
                    const catData = {
                        name: cat.name,
                        type: cat.type,
                        position: cat.position,
                        overwrites: cat.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        })),
                        children: message.guild.channels.cache
                            .filter(c => c.parentId === cat.id)
                            .sort((a, b) => a.position - b.position)
                            .map(c => ({
                                name: c.name,
                                type: c.type,
                                topic: c.topic || null,
                                position: c.position,
                                bitrate: c.bitrate || null,
                                userLimit: c.userLimit || null,
                                nsfw: c.nsfw || false,
                                overwrites: c.permissionOverwrites.cache.map(o => ({
                                    id: o.id,
                                    type: o.type,
                                    allow: o.allow.bitfield.toString(),
                                    deny: o.deny.bitfield.toString()
                                }))
                            }))
                    };
                    backupData.channels.push(catData);
                });

                // Add orphaned channels (no category) - Sorted by position
                const orphans = message.guild.channels.cache
                    .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory && !c.thread)
                    .sort((a, b) => a.position - b.position);

                orphans.forEach(c => {
                    backupData.channels.push({
                        name: c.name,
                        type: c.type,
                        topic: c.topic || null,
                        position: c.position,
                        bitrate: c.bitrate || null,
                        userLimit: c.userLimit || null,
                        overwrites: c.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        }))
                    });
                });

                const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
                fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setColor("#FFD700") // Gold
                    .setTitle("💾 ARCHIVE SYNCHRONIZED")
                    .setThumbnail(message.guild.iconURL())
                    .setDescription(
                        `### **[ ARCHIVE_DATA_LOCKED ]**\n` +
                        `> **ID:** \`${backupId}\`\n` +
                        `> **Source:** \`${message.guild.name}\`\n` +
                        `> **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                        `**STRUCTURAL BREAKDOWN:**\n` +
                        `\`\`\`yaml\n` +
                        `Roles: ${backupData.roles.length}\n` +
                        `Emojis: ${backupData.emojis.length}\n` +
                        `Stickers: ${backupData.stickers.length}\n` +
                        `Sectors: ${backupData.channels.length}\n` +
                        `\`\`\``
                    )
                    .setFooter({ text: "Use !restore <ID> to deploy this archive matrix.", iconURL: message.client.user.displayAvatarURL() });

                await status.edit({ embeds: [successEmbed] });

            } catch (err) {
                console.error(err);
                status.edit(`❌ **Critical Failure:** Internal error during serialization.`);
            }

        } else if (sub === "list") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply("📁 **Archive Vault is Empty.** No backups found.");
            }

            const listEmbed = new EmbedBuilder()
                .setColor("#00FFFF")
                .setTitle("📂 CENTRAL ARCHIVE VAULT")
                .setDescription("```fix\n[ ACCESSING ENCRYPTED SNAPSHOTS ]\n```")
                .setTimestamp()
                .setFooter({ text: "BlueSealPrime • Archive Registry" });

            files.slice(0, 10).forEach(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, file), "utf8"));
                    const date = new Date(data.createdAt).toLocaleDateString();
                    listEmbed.addFields({
                        name: `📦 ${data.id}`,
                        value: `**Source:** ${data.guildName}\n**Date:** ${date} | **Roles:** ${data.roles.length} | **Channels:** ${data.channels.length}`,
                        inline: false
                    });
                } catch (e) { }
            });

            message.reply({ embeds: [listEmbed] });

        } else if (sub === "delete") {
            const targetId = args[1];
            if (!targetId) return message.reply("⚠️ Specify an archive ID to delete.");

            const targetPath = path.join(BACKUP_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply("❌ Archive ID not found in vault.");

            fs.unlinkSync(targetPath);
            message.reply(`🗑️ **Archive Purged:** Snapshot \`${targetId}\` has been deleted.`);

        } else {
            message.reply("💡 **Backup Manual:**\n`!backup create` - Save current server state\n`!backup list` - View all snapshots\n`!backup delete <ID>` - Remove a snapshot");
        }
    }
};
