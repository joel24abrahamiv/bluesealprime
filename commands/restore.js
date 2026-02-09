const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR, EMBED_COLOR } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");

module.exports = {
    name: "restore",
    description: "Military-Grade Server Restoration (Sequential)",
    usage: "!restore <id>",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Server or Bot Owner can initiate a restoration.");
        }

        const backupId = args[0];
        if (!backupId) return message.reply("⚠️ **Missing Parameter:** Please provide an archive ID. Use `!backup list` to see available snapshots.");

        const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
        if (!fs.existsSync(filePath)) return message.reply("❌ **Archive Fault:** The specified ID does not exist in the central vault.");

        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const confirmEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("☢️ CRITICAL AUTHORIZATION: NUCLEAR RESTORE")
            .setDescription(
                `### **[ WARNING: TOTAL SANITIZATION ]**\n` +
                `This operation will **DELETE EVERYTHING** in this server before reconstruction.\n\n` +
                `**SEQUENCE:**\n` +
                `> 1️⃣ **Protocol 0:** Instant Purge of all Channels & Roles\n` +
                `> 2️⃣ **Gestation:** Rebuilding Server DNA from Archive\n` +
                `> 3️⃣ **Finalization:** 1:1 Matrix Alignment\n\n` +
                `**TARGET ARCHIVE:** \`${data.id}\`\n\n` +
                `**Type \`NUCLEAR CONFIRM\` to initiate the sequence.**`
            )
            .setFooter({ text: "BlueSealPrime • Zero Day Synchronization", iconURL: message.client.user.displayAvatarURL() });

        const filter = m => m.author.id === message.author.id;
        message.channel.send({ embeds: [confirmEmbed] });

        const collector = message.channel.createMessageCollector({ filter, time: 20000, max: 1 });

        collector.on("collect", async m => {
            if (m.content.toUpperCase() !== "NUCLEAR CONFIRM") return message.reply("❌ **Operation Aborted.** Standard restore protocols require `NUCLEAR CONFIRM` for zero-day synchronization.");

            const statusEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("☣️ NUCLEAR RESTORATION: INITIALIZING")
                .setDescription("```diff\n- STAGE 1: PURGING ALL EXISTING SECTORS\n- STAGE 2: RECONSTRUCTING FROM ARCHIVE\n```")
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934983938068/line-blue.gif")
                .setFooter({ text: "BlueSealPrime • Total Sanitization Protocol" });

            const progress = await message.channel.send({ embeds: [statusEmbed] });

            try {
                // ───── PHASE 0: TOTAL PURGE (NUCLEAR) ─────
                const channels = message.guild.channels.cache.filter(c => c.id !== message.channel.id);
                const roles = message.guild.roles.cache.filter(r => r.editable && r.id !== message.guild.id);
                const emojis = message.guild.emojis.cache;
                const stickers = message.guild.stickers.cache;

                const purgeItems = [
                    ...Array.from(channels.values()),
                    ...Array.from(roles.values()),
                    ...Array.from(emojis.values()),
                    ...Array.from(stickers.values())
                ];

                await Promise.allSettled(purgeItems.map(item => item.delete().catch(() => { })));

                // ───── PHASE 1: ROLES & CATEGORIES (SIMULTANEOUS) ─────
                statusEmbed.setDescription("```diff\n+ STAGE 1: SANITIZATION COMPLETE\n- STAGE 2: RECONSTRUCTING STRUCTURAL DNA\n```");
                await progress.edit({ embeds: [statusEmbed] });

                const roleMap = new Map(); // Name -> New ID
                const createdCats = new Map(); // Name -> New ID

                // Restore Server Settings (Fidelity)
                if (data.settings) {
                    await message.guild.edit({
                        verificationLevel: data.settings.verificationLevel,
                        defaultMessageNotifications: data.settings.defaultMessageNotifications,
                        explicitContentFilter: data.settings.explicitContentFilter,
                        afkTimeout: data.settings.afkTimeout
                    }).catch(() => { });
                }

                // Create Roles Parallel
                const rolePromises = data.roles.map(async (roleData) => {
                    let role = message.guild.roles.cache.find(r => r.name === roleData.name);
                    if (!role) {
                        try {
                            role = await message.guild.roles.create({
                                name: roleData.name,
                                color: roleData.color,
                                permissions: BigInt(roleData.permissions),
                                hoist: roleData.hoist,
                                mentionable: roleData.mentionable,
                                reason: "Turbo Restoration"
                            });
                        } catch (e) { }
                    }
                    if (role) roleMap.set(roleData.name, role.id);
                });

                // Create Categories Parallel
                const catPromises = data.channels.filter(c => c.type === ChannelType.GuildCategory).map(async (catData) => {
                    let cat = message.guild.channels.cache.find(c => c.name === catData.name && c.type === ChannelType.GuildCategory);
                    if (!cat) {
                        try {
                            cat = await message.guild.channels.create({
                                name: catData.name,
                                type: ChannelType.GuildCategory,
                                position: catData.position,
                                reason: "Turbo Restoration"
                            });
                        } catch (e) { }
                    }
                    if (cat) createdCats.set(catData.name, cat.id);
                });

                await Promise.all([...rolePromises, ...catPromises]);

                // Helper to map overwrites
                const mapOverwrites = (oldOverwrites) => {
                    if (!oldOverwrites) return [];
                    return oldOverwrites.map(o => {
                        if (o.id === data.guildId) return { id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        const originalRole = data.roles.find(r => r.id === o.id);
                        if (originalRole) {
                            const newRoleId = roleMap.get(originalRole.name);
                            if (newRoleId) return { id: newRoleId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        }
                        return null;
                    }).filter(o => o !== null);
                };

                // ───── PHASE 2: GLOBAL CHANNEL WAVE (PARALLEL) ─────
                await progress.edit("🔄 **Phase 2:** Turbo Deployment of 100% Structural Matrix...");
                const restorationTasks = [];

                // Update Category Perms
                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                    const parentId = createdCats.get(catData.name);
                    if (parentId) {
                        const cat = message.guild.channels.cache.get(parentId);
                        if (cat) restorationTasks.push(cat.permissionOverwrites.set(mapOverwrites(catData.overwrites)).catch(() => { }));
                    }
                }

                // Batch Create All Sub-Channels
                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                    const parentId = createdCats.get(catData.name);
                    if (catData.children) {
                        for (const childData of catData.children) {
                            restorationTasks.push(message.guild.channels.create({
                                name: childData.name,
                                type: childData.type,
                                topic: childData.topic,
                                nsfw: childData.nsfw,
                                bitrate: childData.bitrate,
                                userLimit: childData.userLimit,
                                parentId: parentId || null,
                                position: childData.position,
                                permissionOverwrites: mapOverwrites(childData.overwrites),
                                reason: "Turbo Restoration"
                            }).catch(() => { }));
                        }
                    }
                }

                // Batch Create Orphans
                for (const chanData of data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children)) {
                    restorationTasks.push(message.guild.channels.create({
                        name: chanData.name,
                        type: chanData.type,
                        topic: chanData.topic,
                        bitrate: chanData.bitrate,
                        userLimit: chanData.userLimit,
                        position: chanData.position,
                        permissionOverwrites: mapOverwrites(chanData.overwrites),
                        reason: "Turbo Restoration"
                    }).catch(() => { }));
                }

                await Promise.allSettled(restorationTasks);

                const finalEmbed = new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("✅ TURBO RESTORATION COMPLETE")
                    .setDescription(`The server \`${data.guildName}\` has been reconstructed with maximum velocity.`)
                    .addFields(
                        { name: "⚡ Logic", value: "Parallel Roles+Cats -> Global Channel Wave", inline: true },
                        { name: "🛠️ Fidelity", value: "Permissions, Settings, and Positions Synced", inline: true }
                    );

                await progress.edit({ content: null, embeds: [finalEmbed] });

            } catch (err) {
                console.error(err);
                progress.edit(`❌ **Restoration Fault:** Encountered an error during structural deployment.`);
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) message.reply("🕙 **Restore Timed Out.** Standard operation protocol resumed.");
        });
    }
};
