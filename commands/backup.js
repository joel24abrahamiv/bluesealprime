const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

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
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can manage archives.")], V2_RED)]
            });
        }

        const sub = args[0]?.toLowerCase();
        const botAvatar = V2.botAvatar(message);

        if (sub === "create") {
            const initContainer = V2.container([
                V2.section([
                    V2.heading("📡 INITIALIZING SERVER SCAN", 2),
                    V2.text("```diff\n+ Accessing Discord API Matrix\n+ Analyzing Structural DNA\n+ Serializing Sector Permissions\n```")
                ], botAvatar),
                V2.separator(),
                V2.text("*BlueSealPrime • Priority Alpha Archive*")
            ], "#00FFFF");

            const status = await message.channel.send({ content: null, flags: V2.flag, components: [initContainer] });

            try {
                // Generate a readable ID: ServerName_DDMM_HHMM
                const date = new Date();
                // Generate a 13-digit numeric ID based on timestamp + random padding
                const backupId = Date.now().toString() + Math.floor(Math.random() * 9).toString();

                const backupData = {
                    id: backupId,
                    guildName: message.guild.name,
                    guildId: message.guild.id,
                    createdBy: {
                        tag: message.author.tag,
                        id: message.author.id
                    },
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
                        features: message.guild.features,
                        iconURL: message.guild.iconURL({ extension: 'png', size: 1024 }),
                        bannerURL: message.guild.bannerURL({ size: 1024 })
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
                            mentionable: r.mentionable,
                            position: r.position
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
                                rawPosition: c.rawPosition,
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
                        rawPosition: c.rawPosition,
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

                const successContainer = V2.container([
                    V2.section([
                        V2.heading("📂 ARCHIVE STORED", 2),
                        V2.text(`### **[ SNAPSHOT_SECURED ]**\n> **Target Server:** ${message.guild.name}\n> **Authorization:** ${message.author}\n\n**🆔 SNAPSHOT IDENTIFIER**\n\`\`\`bash\n${backupId}\n\`\`\``)
                    ], message.guild.iconURL({ extension: 'png' }) || botAvatar),
                    V2.separator(),
                    V2.heading("📦 DATA MANIFEST", 3),
                    V2.text(`\`\`\`yaml\nRoles     : ${backupData.roles.length}\nChannels  : ${backupData.channels.length}\nEmojis    : ${backupData.emojis.length}\nStickers  : ${backupData.stickers.length}\n\`\`\``),
                    V2.separator(),
                    V2.text(`📅 **Time Stamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
                    V2.separator(),
                    V2.text(`*Use !restore <ID> to deploy this matrix.*`)
                ], V2_BLUE);

                await status.edit({ content: null, components: [successContainer] });

            } catch (err) {
                console.error(err);
                const errorContainer = V2.container([V2.text("❌ **Critical Failure:** Internal error during serialization.")], V2_RED);
                status.edit({ content: null, components: [errorContainer] });
            }

        } else if (sub === "list") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([V2.text("📁 **Archive Vault is Empty.** No backups found.")], V2_BLUE)]
                });
            }

            const listComponents = [
                V2.section([
                    V2.heading("📂 CENTRAL ARCHIVE VAULT", 2),
                    V2.text("```fix\n[ ACCESSING ENCRYPTED SNAPSHOTS ]\n```")
                ], botAvatar),
                V2.separator()
            ];

            files.slice(0, 5).forEach(file => {
                try {
                    const filePath = path.join(BACKUP_DIR, file);
                    const stats = fs.statSync(filePath);
                    const fileSize = (stats.size / 1024).toFixed(2); // KB
                    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    const createdTimestamp = Math.floor(new Date(data.createdAt).getTime() / 1000);
                    const creator = data.createdBy ? data.createdBy.tag : "Unknown Architect";

                    listComponents.push(
                        V2.heading(`🆔 ID: ${data.id}`, 3),
                        V2.text(
                            `> **🏛️ Server:** ${data.guildName}\n` +
                            `> **👑 Creator:** ${creator}\n` +
                            `> **📅 Created:** <t:${createdTimestamp}:F>\n` +
                            `> **📊 Stats:** \`${data.roles.length} Roles • ${data.channels.length} Channels\``
                        ),
                        V2.separator()
                    );
                } catch (e) { }
            });

            listComponents.push(V2.text("*BlueSealPrime • Archive Registry • Global*"));

            return message.reply({
                flags: V2.flag,
                components: [V2.container(listComponents, V2_BLUE)]
            });

        } else if (sub === "delete") {
            const targetId = args[1];
            if (!targetId) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify an archive ID to delete.")], V2_RED)] });

            const targetPath = path.join(BACKUP_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Archive ID not found in vault.")], V2_RED)] });

            fs.unlinkSync(targetPath);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(`🗑️ **Archive Purged:** Snapshot \`${targetId}\` has been deleted.`)], V2_RED)]
            });

        } else if (sub === "clear") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));
            if (files.length === 0) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **The Vault is already empty.**")], V2_BLUE)] });

            files.forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(` sweep **Vault Cleared:** Total of **${files.length}** archives have been permanently deleted.`)], V2_RED)]
            });

        } else {
            const helpContainer = V2.container([
                V2.section([
                    V2.heading("💡 BACKUP PROTOCOL MANUAL", 2),
                    V2.text(
                        "🔹 `!backup create` - Save current server state\n" +
                        "🔹 `!backup list` - View all snapshots\n" +
                        "🔹 `!backup delete <ID>` - Remove a snapshot\n" +
                        "🔹 `!backup clear` - Wipe the entire vault"
                    )
                ], botAvatar)
            ], V2_BLUE);
            return message.reply({ flags: V2.flag, components: [helpContainer] });
        }
    }
};
