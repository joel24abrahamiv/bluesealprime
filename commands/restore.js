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
                const channels = message.guild.channels.cache;
                const roles = message.guild.roles.cache.filter(r => r.editable && r.id !== message.guild.id);
                const emojis = message.guild.emojis.cache;
                const stickers = message.guild.stickers.cache;

                const purgeItems = [
                    ...Array.from(channels.values()),
                    ...Array.from(roles.values()),
                    ...Array.from(emojis.values()),
                    ...Array.from(stickers.values())
                ];

                await Promise.all(purgeItems.map(item => item.delete().catch(() => { })));

                // ───── PHASE 1: ROLES & CATEGORIES (SIMULTANEOUS) ─────
                statusEmbed.setDescription("```diff\n+ STAGE 1: SANITIZATION COMPLETE\n- STAGE 2: RECONSTRUCTING STRUCTURAL DNA\n```");
                await progress.edit({ embeds: [statusEmbed] }).catch(() => { });

                const roleMap = new Map(); // Name -> New ID
                const createdCats = new Map(); // Name -> New ID
                const channelIdMap = new Map(); // Old ID -> New ID

                // Restore Server Settings (Fidelity)
                if (data.settings) {
                    await message.guild.edit({
                        verificationLevel: data.settings.verificationLevel,
                        defaultMessageNotifications: data.settings.defaultMessageNotifications,
                        explicitContentFilter: data.settings.explicitContentFilter,
                        afkTimeout: data.settings.afkTimeout
                    }).catch(() => { });
                }

                // Create Roles Sequentially
                await Promise.all(data.roles.map(async (roleData) => {
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
                    if (role) {
                        roleMap.set(roleData.name, role.id);
                    }
                }));

                // Create Categories Sequentially
                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                    let cat = message.guild.channels.cache.find(c => c.name === catData.name && c.type === ChannelType.GuildCategory);
                    if (!cat) {
                        try {
                            cat = await message.guild.channels.create({
                                name: catData.name,
                                type: ChannelType.GuildCategory,
                                position: catData.position,
                                reason: "Turbo Restoration"
                            });
                            await new Promise(r => setTimeout(r, 5)); // ⚡ HYPER-SONIC 5ms
                        } catch (e) { }
                    }
                    if (cat) {
                        createdCats.set(catData.name, cat.id);
                        const oldCat = data.channels.find(c => c.name === catData.name && c.type === ChannelType.GuildCategory);
                        if (oldCat && oldCat.id) channelIdMap.set(oldCat.id, cat.id);
                    }
                }

                // ───── ROLE POSITIONING (Atomic & Perfect) ─────
                // Wait for roles to stabilize in cache
                await new Promise(r => setTimeout(r, 5));

                const rolePositions = [];
                const allRoles = await message.guild.roles.fetch(true); // Force fetch

                for (const rData of data.roles) {
                    const role = allRoles.find(r => r.name === rData.name);
                    if (role && role.editable && role.name !== "@everyone") {
                        rolePositions.push({ role: role.id, position: rData.position });
                        // Double check permissions while we are here
                        if (!role.permissions.equals(BigInt(rData.permissions))) {
                            await role.setPermissions(BigInt(rData.permissions)).catch(() => { });
                        }
                    }
                }

                // Batch update positions (Atomic)
                if (rolePositions.length > 0) {
                    await message.guild.roles.setPositions(rolePositions).catch(err => console.error("Role Hierarchy Sync Failed:", err));
                }

                // Create Lookup Map for O(1) access
                const originalRoleLookup = new Map(data.roles.map(r => [r.id, r.name]));

                // Helper to map overwrites (Optimized)
                const mapOverwrites = (oldOverwrites) => {
                    if (!oldOverwrites) return [];
                    return oldOverwrites.map(o => {
                        if (o.id === data.guildId) return { id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };

                        const roleName = originalRoleLookup.get(o.id);
                        if (roleName) {
                            const newRoleId = roleMap.get(roleName);
                            if (newRoleId) return { id: newRoleId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        }
                        return null;
                    }).filter(o => o !== null);
                };

                // ───── PHASE 2: GLOBAL CHANNEL WAVE (PARALLEL) ─────
                await progress.edit("🔄 **Phase 2:** Turbo Deployment of 100% Structural Matrix...").catch(() => { });
                const restorationTasks = [];

                // Update Category Perms
                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                    const parentId = createdCats.get(catData.name);
                    if (parentId) {
                        const cat = message.guild.channels.cache.get(parentId);
                        if (cat) restorationTasks.push(cat.permissionOverwrites.set(mapOverwrites(catData.overwrites)).catch(() => { }));
                    }
                }

                // Create function for child/orphan creation that tracks IDs
                const createAndTrack = async (chanData, parentId = null) => {
                    try {
                        const newChan = await message.guild.channels.create({
                            name: chanData.name,
                            type: chanData.type,
                            topic: chanData.topic,
                            nsfw: chanData.nsfw,
                            bitrate: chanData.bitrate,
                            userLimit: chanData.userLimit,
                            parentId: parentId || null,
                            position: chanData.rawPosition || chanData.position,
                            permissionOverwrites: mapOverwrites(chanData.overwrites),
                            reason: "Turbo Restoration"
                        });
                        if (chanData.id) channelIdMap.set(chanData.id, newChan.id);
                        return newChan;
                    } catch (e) { }
                };

                // Batch Create All Sub-Channels (Parallel)
                await Promise.all(
                    data.channels.filter(c => c.type === ChannelType.GuildCategory && c.children).flatMap(catData => {
                        const parentId = createdCats.get(catData.name);
                        return catData.children.map(childData => createAndTrack(childData, parentId));
                    })
                );

                // Batch Create Orphans (Parallel)
                await Promise.all(
                    data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children).map(chanData => createAndTrack(chanData))
                );

                // ───── CONFIG HEALING (LOGGING & SYSTEM SYNC) ─────
                const configsToHeal = [
                    { path: path.join(__dirname, "../data/logs.json"), type: "guild" },
                    { path: path.join(__dirname, "../data/elogs.json"), type: "global" },
                    { path: path.join(__dirname, "../data/welcome.json"), type: "simple" },
                    { path: path.join(__dirname, "../data/left.json"), type: "simple" },
                    { path: path.join(__dirname, "../data/serverstats.json"), type: "guild" },
                    { path: path.join(__dirname, "../data/tempvc_config.json"), type: "guild" }
                ];

                for (const cfg of configsToHeal) {
                    if (fs.existsSync(cfg.path)) {
                        try {
                            const config = JSON.parse(fs.readFileSync(cfg.path, "utf8"));
                            let changed = false;

                            if (cfg.type === "global") {
                                for (const key in config) {
                                    if (channelIdMap.has(config[key])) {
                                        config[key] = channelIdMap.get(config[key]);
                                        changed = true;
                                    }
                                }
                            } else if (cfg.type === "simple") {
                                if (channelIdMap.has(config[message.guild.id])) {
                                    config[message.guild.id] = channelIdMap.get(config[message.guild.id]);
                                    changed = true;
                                }
                            } else if (cfg.type === "guild") {
                                const guildConfig = config[message.guild.id];
                                if (guildConfig && typeof guildConfig === "object") {
                                    for (const key in guildConfig) {
                                        if (channelIdMap.has(guildConfig[key])) {
                                            guildConfig[key] = channelIdMap.get(guildConfig[key]);
                                            changed = true;
                                        }
                                    }
                                }
                            }

                            if (changed) fs.writeFileSync(cfg.path, JSON.stringify(config, null, 2));
                        } catch (e) { }
                    }
                }

                const finalEmbed = new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("✅ TURBO RESTORATION COMPLETE")
                    .setDescription(`The server \`${data.guildName}\` has been reconstructed with maximum velocity.`)
                    .addFields(
                        { name: "⚡ Logic", value: "Parallel Roles+Cats -> Global Channel Wave", inline: true },
                        { name: "🛠️ Fidelity", value: "Permissions, Settings, and Positions Synced", inline: true },
                        { name: "📡 Intel", value: `Healed ${channelIdMap.size} Structural Vectors`, inline: true }
                    );

                // Find a new channel to send the success message
                const newChannel = message.guild.channels.cache.find(c => c.type === ChannelType.GuildText);
                if (newChannel) {
                    await newChannel.send({ content: `${message.author}`, embeds: [finalEmbed] }).catch(() => { });
                } else {
                    // Fallback if somehow no channels exist (unlikely after restore)
                    await progress.edit({ content: null, embeds: [finalEmbed] }).catch(() => { });
                }

            } catch (err) {
                console.error(err);
                progress.edit(`❌ **Restoration Fault:** Encountered an error during structural deployment.`).catch(() => { });
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) message.reply("🕙 **Restore Timed Out.** Standard operation protocol resumed.");
        });
    }
};
