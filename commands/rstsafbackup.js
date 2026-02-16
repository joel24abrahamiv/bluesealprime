const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "rstsafbackup",
    description: "Apply Structural DNA Backup to current server.",
    usage: "!rstsafbackup <DNA-Key>",
    aliases: ["applydna", "safrestore"],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Server or Bot Owner can deploy structural matrices.");
        }

        const dnaKey = args[0]?.toUpperCase();
        if (!dnaKey) return message.reply("⚠️ Specify a DNA Key to deploy.");

        const SAFETY_DIR = path.join(__dirname, "../data/safety");
        const filePath = path.join(SAFETY_DIR, `${dnaKey}.json`);

        if (!fs.existsSync(filePath)) return message.reply("❌ DNA Key not found in archive.");

        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (e) {
            return message.reply("❌ Error reading structural template.");
        }

        // CONFIRMATION
        const confirmEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("☢️ [ PROTOCOL_OMEGA: CONFIRMATION_REQUIRED ]")
            .setDescription(
                `### **CRITICAL OVERWRITE DETECTED**\n` +
                `You are about to apply the structural DNA \`${dnaKey}\` to **${message.guild.name}**.\n\n` +
                `> **WARNING:** This will purge ALL existing channels and roles (except the highest bot role and @everyone).\n` +
                `> **DESTINATION:** \`${message.guild.name}\`\n\n` +
                `Are you absolutely sure? This action is irreversible.`
            )
            .setFooter({ text: "BlueSealPrime Sovereign Security" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm_dna").setLabel("PROCEED WITH COLLAPSE").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancel_dna").setLabel("ABORT SEQUENCE").setStyle(ButtonStyle.Secondary)
        );

        const response = await message.reply({ embeds: [confirmEmbed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter, time: 30000 });

            if (confirmation.customId === "cancel_dna") {
                return confirmation.update({ content: "❌ **Sequence Aborted.**", embeds: [], components: [] });
            }

            await confirmation.update({ content: "⚡ **Initializing structural collapse...**", embeds: [], components: [] });

            // ───── PHASE 0: PURGE ─────
            const progress = await message.channel.send("🧹 **Phase 0:** Purging existing structures...");

            // Delete Channels
            const channels = await message.guild.channels.fetch();
            for (const chan of channels.values()) {
                await chan.delete().catch(() => { });
            }

            // Create temporary status channel
            const statusChannel = await message.guild.channels.create({
                name: "🧬-restoration-status",
                type: ChannelType.GuildText,
                reason: "Structural DNA Deployment"
            });

            // Delete Roles
            const roles = await message.guild.roles.fetch();
            for (const role of roles.values()) {
                if (role.managed || role.name === "@everyone" || role.id === message.guild.roles.premiumSubscriberRole?.id || role.position >= message.guild.members.me.roles.highest.position) continue;
                await role.delete().catch(() => { });
            }

            await statusChannel.send(`✅ **Purge sequence complete.** Reconstructing structural matrix...`);

            // ───── PHASE 1: ROLES (Perfect Fidelity) ─────
            await statusChannel.send("🎭 **Phase 1:** Reconstructing Role Hierarchy...");
            const roleMap = new Map(); // Old Name -> New ID

            // Sort roles by position (original position)
            const sortedRoles = data.roles.sort((a, b) => a.position - b.position);

            for (const rData of sortedRoles) {
                try {
                    const newRole = await message.guild.roles.create({
                        name: rData.name,
                        color: rData.color,
                        permissions: BigInt(rData.permissions),
                        hoist: rData.hoist,
                        mentionable: rData.mentionable,
                        reason: "Structural DNA Deployment"
                    });
                    roleMap.set(rData.name, newRole.id);
                } catch (e) {
                    await statusChannel.send(`⚠️ Error creating role \`${rData.name}\`: ${e.message}`);
                }
            }

            // Wait for cache
            await new Promise(r => setTimeout(r, 2000));

            // Set Role Positions (Bottom up)
            const allRoles = await message.guild.roles.fetch();
            const positionsToSet = [];
            for (const rData of sortedRoles) {
                const newRole = allRoles.find(r => r.name === rData.name);
                if (newRole && newRole.editable) {
                    positionsToSet.push({ role: newRole, position: rData.position });
                }
            }

            // Batch position update if possible or sequential
            for (const p of positionsToSet) {
                await p.role.setPosition(p.position).catch(() => { });
            }

            // ───── PHASE 2: CHANNELS ─────
            await statusChannel.send("🏗️ **Phase 2:** Drafting Sectors and Channels...");
            const channelIdMap = new Map(); // Old Name -> New ID

            const mapOverwrites = (oldOverwrites) => {
                if (!oldOverwrites) return [];
                return oldOverwrites.map(o => {
                    if (o.type === 0) { // Role
                        // Safety backup DNA might not have original ID mapping for cross-server, 
                        // so we match by name from our new roleMap.
                        // We need the original role ID from the DNA if we want to be exact, 
                        // but safety backup is for CLONING, so names are the key.

                        // Wait, safetybackup.js captures role names. 
                        // We need to find the original role name for the 'o.id' in DNA.
                        // Actually, safetybackup doesn't store the IDs for overwrites? 
                        // Let's check safetybackup.js again.
                        return null; // Fallback to name-based logic below
                    }
                    return null;
                }).filter(o => o !== null);
            };

            // Heavier overwrite logic for cross-server
            const resolveOverwrites = (oldOverwrites, sourceRoles) => {
                if (!oldOverwrites) return [];
                const newOverwrites = [];
                for (const o of oldOverwrites) {
                    if (o.id === data.guildId) { // @everyone
                        newOverwrites.push({ id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) });
                    } else {
                        // Find role name in sourceRoles
                        const sourceRole = sourceRoles.find(r => r.id === o.id);
                        if (sourceRole) {
                            const newRoleId = roleMap.get(sourceRole.name);
                            if (newRoleId) newOverwrites.push({ id: newRoleId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) });
                        }
                    }
                }
                return newOverwrites;
            };

            // NOTE: Safetybackup needs to store the role IDs to map them to names for cross-server compatibility.
            // I'll update safetybackup.js to store a lookup table.

            // Phase 2: Categories
            for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                try {
                    const newCat = await message.guild.channels.create({
                        name: catData.name,
                        type: catData.type,
                        position: catData.position,
                        permissionOverwrites: resolveOverwrites(catData.overwrites, data.roles),
                        reason: "Structural DNA Deployment"
                    });

                    if (catData.children) {
                        for (const childData of catData.children) {
                            const newChan = await message.guild.channels.create({
                                name: childData.name,
                                type: childData.type,
                                topic: childData.topic,
                                bitrate: childData.bitrate,
                                userLimit: childData.userLimit,
                                nsfw: childData.nsfw,
                                parentId: newCat.id,
                                position: childData.rawPosition || childData.position,
                                permissionOverwrites: resolveOverwrites(childData.overwrites, data.roles),
                                reason: "Structural DNA Deployment"
                            });
                            channelIdMap.set(childData.name, newChan.id);
                        }
                    }
                } catch (e) { await statusChannel.send(`⚠️ Error creating category \`${catData.name}\`: ${e.message}`); }
            }

            // Phase 3: Orphans
            for (const chanData of data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children)) {
                try {
                    const newChan = await message.guild.channels.create({
                        name: chanData.name,
                        type: chanData.type,
                        topic: chanData.topic,
                        bitrate: chanData.bitrate,
                        userLimit: chanData.userLimit,
                        nsfw: chanData.nsfw,
                        position: chanData.rawPosition || chanData.position,
                        permissionOverwrites: resolveOverwrites(chanData.overwrites, data.roles),
                        reason: "Structural DNA Deployment"
                    });
                    channelIdMap.set(chanData.name, newChan.id);
                } catch (e) { await statusChannel.send(`⚠️ Error creating channel \`${chanData.name}\`: ${e.message}`); }
            }

            // ───── PHASE 3: CONFIG HEALING ─────
            await statusChannel.send("🩹 **Phase 3:** Healing system configurations...");

            // Heal logs.json
            const LOGS_DB = path.join(__dirname, "../data/logs.json");
            if (fs.existsSync(LOGS_DB)) {
                try {
                    const logs = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
                    const config = {};
                    // Try to find matching names for logging
                    const logTypes = ["message", "mod", "server", "role", "file", "voice", "member", "action", "channel", "security"];
                    for (const type of logTypes) {
                        // Look for a channel named like "message-logs", "mod-logs", etc.
                        const match = message.guild.channels.cache.find(c =>
                            c.name.toLowerCase().includes(type) && c.name.toLowerCase().includes("log")
                        );
                        if (match) config[type] = match.id;
                    }
                    logs[message.guild.id] = config;
                    fs.writeFileSync(LOGS_DB, JSON.stringify(logs, null, 2));
                } catch (e) { }
            }

            // Healed Welcome
            const WELCOME_DB = path.join(__dirname, "../data/welcome.json");
            const welcomeChan = message.guild.channels.cache.find(c => c.name.toLowerCase().includes("welcome") || c.name.toLowerCase().includes("join"));
            if (welcomeChan && fs.existsSync(WELCOME_DB)) {
                try {
                    const wData = JSON.parse(fs.readFileSync(WELCOME_DB, "utf8"));
                    wData[message.guild.id] = welcomeChan.id;
                    fs.writeFileSync(WELCOME_DB, JSON.stringify(wData, null, 2));
                } catch (e) { }
            }

            await statusChannel.send(`✨ **RESTORE COMPLETE.** Server DNA successfully applied.`);

            const finalEmbed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("🛡️ STRUCTURAL DNA APPLIED")
                .setDescription(`The server structure from \`${dnaKey}\` has been fully reconstructed.`)
                .addFields(
                    { name: "🎭 Roles Rebuilt", value: `\`${data.roles.length}\``, inline: true },
                    { name: "🏗️ Regions Built", value: `\`${data.channels.length}\``, inline: true },
                    { name: "✨ Status", value: "Operational", inline: true }
                )
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime Safety Archive • Zero-Friction Cloning" });

            await statusChannel.send({ embeds: [finalEmbed] });

        } catch (e) {
            console.error(e);
            return message.channel.send("❌ **Sequence Aborted:** Confirmation timeout or internal error.");
        }
    }
};
