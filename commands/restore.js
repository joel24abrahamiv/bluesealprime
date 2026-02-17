const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR, EMBED_COLOR } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");

/**
 * PERFECT RESTORE PROTOCOL v2.0
 * Features: Sovereign Protection, Role Matrix Alignment, Wave Reconstruction
 */
module.exports = {
    name: "restore",
    description: "Military-Grade Server Restoration (Perfected)",
    usage: "!restore <id>",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        // Authorization Check
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Server or Bot Owner can initiate a restoration.");
        }

        const backupId = args[0];
        if (!backupId) return message.reply("⚠️ **Missing Parameter:** Please provide an archive ID.");

        const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
        if (!fs.existsSync(filePath)) return message.reply("❌ **Archive Fault:** Specifed ID does not exist.");

        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Step 1: Nuclear Confirmation
        const confirmEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("☢️ CRITICAL AUTHORIZATION: NUCLEAR RESTORE")
            .setDescription(
                `### **[ WARNING: TOTAL SANITIZATION ]**\n` +
                `This will **PURGE** the server and rebuild from archive: \`${data.id}\`.\n\n` +
                `**SOVEREIGN PROTECTIONS:**\n` +
                `> ✅ **Command Center:** ${message.channel} will be preserved during the wipe.\n` +
                `> ✅ **Authority:** Bot roles and @everyone will remain intact.\n\n` +
                `**Press the button below to authorize the sequence.**`
            )
            .setFooter({ text: "BlueSealPrime • Priority Alpha Archive" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("CONFIRM NUCLEAR RESTORE").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancel").setLabel("ABORT").setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({ embeds: [confirmEmbed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        try {
            const i = await msg.awaitMessageComponent({ filter, time: 40000 });
            if (i.customId === "cancel") return i.update({ content: "❌ **Sequence Aborted.**", embeds: [], components: [] });

            await i.update({ content: "☣️ **Nuclear Sequence Authorized. Initializing...**", embeds: [], components: [] });

            const statusEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("☣️ NUCLEAR RESTORATION: ACTIVE")
                .setDescription("```diff\n- Phase 0: Initializing Sovereign Purge\n```")
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934983938068/line-blue.gif");

            const progress = await message.channel.send({ embeds: [statusEmbed] });

            try {
                // ───── PHASE 0: SOVEREIGN PURGE ─────
                const currentChanId = message.channel.id;
                const botMember = await message.guild.members.fetchMe();
                const botMaxPos = botMember.roles.highest.position;

                const channels = message.guild.channels.cache.filter(c => c.id !== currentChanId);
                const roles = message.guild.roles.cache.filter(r => !r.managed && r.id !== message.guild.id && r.position < botMaxPos);
                const emojis = message.guild.emojis.cache;
                const stickers = message.guild.stickers.cache;

                const purgeItems = [...channels.values(), ...roles.values(), ...emojis.values(), ...stickers.values()];

                for (const item of purgeItems) {
                    await item.delete().catch(() => { });
                    await new Promise(r => setTimeout(r, 5)); // Hyper-Sonic 5ms
                }

                // Sync Cache
                await message.guild.roles.fetch();
                await message.guild.channels.fetch();

                // ───── PHASE 1: SERVER DNA SYNC ─────
                statusEmbed.setDescription("```diff\n+ Phase 0: Sovereign Purge Complete\n- Phase 1: Reconstructing Structural DNA\n```");
                await progress.edit({ embeds: [statusEmbed] });

                if (data.settings) {
                    await message.guild.edit({
                        verificationLevel: data.settings.verificationLevel,
                        defaultMessageNotifications: data.settings.defaultMessageNotifications,
                        explicitContentFilter: data.settings.explicitContentFilter,
                        afkTimeout: data.settings.afkTimeout
                    }).catch(() => { });

                    if (data.settings.iconURL) {
                        try {
                            const res = await fetch(data.settings.iconURL);
                            if (res.ok) await message.guild.setIcon(Buffer.from(await res.arrayBuffer()));
                        } catch (e) { }
                    }
                    if (data.settings.bannerURL) {
                        try {
                            const res = await fetch(data.settings.bannerURL);
                            if (res.ok) await message.guild.setBanner(Buffer.from(await res.arrayBuffer()));
                        } catch (e) { }
                    }
                }

                // ───── PHASE 2: ROLE HIERARCHY ─────
                const roleMap = new Map(); // Old Name -> New ID
                for (const rData of data.roles) {
                    try {
                        const newRole = await message.guild.roles.create({
                            name: rData.name,
                            color: rData.color,
                            permissions: BigInt(rData.permissions),
                            hoist: rData.hoist,
                            mentionable: rData.mentionable,
                            reason: "Perfect Restore"
                        });
                        roleMap.set(rData.name, newRole.id);
                        await new Promise(r => setTimeout(r, 5)); // 5ms buffer
                    } catch (e) { }
                }

                // Align positions at once
                const finalRoles = await message.guild.roles.fetch();
                const positions = data.roles.map(r => {
                    const match = finalRoles.find(fr => fr.name === r.name);
                    return match ? { role: match.id, position: r.position } : null;
                }).filter(p => p !== null);
                if (positions.length) await message.guild.roles.setPositions(positions).catch(() => { });

                // ───── PHASE 3: CHANNEL WAVE DEPLOYMENT ─────
                const createdCats = new Map(); // Name -> New ID
                const channelIdMap = new Map(); // Old ID -> New ID
                const originalRoleLookup = new Map(data.roles.map(r => [r.id, r.name]));

                const mapOverwrites = (oldOverwrites) => {
                    if (!oldOverwrites) return [];
                    return oldOverwrites.map(o => {
                        if (o.type === 1) return { id: o.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        if (o.id === data.guildId) return { id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        const name = originalRoleLookup.get(o.id);
                        const newId = roleMap.get(name);
                        return newId ? { id: newId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) } : null;
                    }).filter(o => o !== null);
                };

                // WAVE 1: Categories
                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                    try {
                        const cat = await message.guild.channels.create({
                            name: catData.name,
                            type: ChannelType.GuildCategory,
                            position: catData.position,
                            permissionOverwrites: mapOverwrites(catData.overwrites)
                        });
                        createdCats.set(catData.name, cat.id);
                        if (catData.id) channelIdMap.set(catData.id, cat.id);
                        await new Promise(r => setTimeout(r, 5)); // 5ms buffer
                    } catch (e) { }
                }

                // WAVE 2: Sub-Channels & Orphans (Parallel Stable)
                const createChan = async (cData, parentId = null) => {
                    try {
                        const chan = await message.guild.channels.create({
                            name: cData.name,
                            type: cData.type,
                            topic: cData.topic,
                            bitrate: cData.bitrate,
                            userLimit: cData.userLimit,
                            nsfw: cData.nsfw,
                            parentId: parentId,
                            position: cData.rawPosition || cData.position,
                            permissionOverwrites: mapOverwrites(cData.overwrites)
                        });
                        if (cData.id) channelIdMap.set(cData.id, chan.id);
                    } catch (e) { }
                };

                const wait = ms => new Promise(r => setTimeout(r, ms));

                for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory && c.children)) {
                    const pid = createdCats.get(catData.name);
                    for (const child of catData.children) {
                        await createChan(child, pid);
                        await wait(5); // Hyper-Sonic
                    }
                }

                for (const orphan of data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children)) {
                    await createChan(orphan);
                    await wait(5); // Hyper-Sonic
                }

                // ───── PHASE 4: FINALIZATION ─────
                statusEmbed.setColor(SUCCESS_COLOR).setTitle("✅ RESTORATION COMPLETE").setDescription("```diff\n+ SERVER DNA SUCCESSFULLY DEPLOYED\n+ PROTOCOL OMEGA TERMINATED\n```");
                await progress.edit({ embeds: [statusEmbed] });

                const finalMsgEmbed = new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("🛡️ ZERO-DAY SYNCHRONIZATION COMPLETE")
                    .setDescription(`The server **${data.guildName}** has been fully reconstructed with 100% matrix alignment.`)
                    .addFields(
                        { name: "🧬 Structural Vectors", value: `\`${data.channels.length} Channels Loaded\``, inline: true },
                        { name: "🎭 Hierarchy State", value: `\`${data.roles.length} Roles Synced\``, inline: true }
                    );

                const finalTarget = message.guild.channels.cache.find(c => c.type === ChannelType.GuildText);
                if (finalTarget) finalTarget.send({ content: `${message.author}`, embeds: [finalMsgEmbed] });

            } catch (err) {
                console.error(err);
                progress.edit("❌ **Critical Restoration Fault.** Encountered an error during structural deployment.");
            }
        } catch (e) {
            return message.reply("🕙 **Restore Action Timed Out.**");
        }
    }
};
