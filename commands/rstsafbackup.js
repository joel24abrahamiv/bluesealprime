const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, SUCCESS_COLOR } = require("../config");

/**
 * PERFECT DNA RESTORE PROTOCOL v2.0
 * Features: Sovereign Protection, Structural Alignment, Cross-Server Fidelity
 */
module.exports = {
    name: "rstsafbackup",
    description: "Apply Structural DNA Backup to current server (Perfected).",
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
            .setTitle("☢️ [ PROTOCOL_OMEGA: CONFIRMATION ]")
            .setDescription(
                `### **CRITICAL STRUCTURAL OVERWRITE**\n` +
                `Deploying DNA: \`${dnaKey}\` to **${message.guild.name}**.\n\n` +
                `> **PROTECTION:** Current channel and bot authority roles are SECURED.\n` +
                `> **WARNING:** All other structures will be purged for realignment.\n\n` +
                `Authorize sequence to proceed.`
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
            if (confirmation.customId === "cancel_dna") return confirmation.update({ content: "❌ **Sequence Aborted.**", embeds: [], components: [] });

            await confirmation.update({ content: "⚡ **Initializing structural collapse...**", embeds: [], components: [] });

            // ───── PHASE 0: SOVEREIGN PURGE ─────
            const currentChanId = message.channel.id;
            const botMember = await message.guild.members.fetchMe();
            const botMaxPos = botMember.roles.highest.position;

            const channels = message.guild.channels.cache.filter(c => c.id !== currentChanId);
            const roles = message.guild.roles.cache.filter(r => !r.managed && r.id !== message.guild.id && r.position < botMaxPos);

            const purgeItems = [...channels.values(), ...roles.values()];
            for (const item of purgeItems) {
                await item.delete().catch(() => { });
                await new Promise(r => setTimeout(r, 5));
            }

            // Create temporary status channel
            const statusChannel = await message.guild.channels.create({
                name: "🧬-restoration-status",
                type: ChannelType.GuildText,
                reason: "Structural DNA Deployment"
            });

            await statusChannel.send(`✅ **Sovereign Purge Complete.** Reconstructing structural matrix...`);

            // ───── PHASE 1: ROLE ALIGNMENT ─────
            const roleMap = new Map(); // Old Name -> New ID
            const sortedRoles = data.roles.sort((a, b) => a.position - b.position);

            for (const rData of sortedRoles) {
                try {
                    const newRole = await message.guild.roles.create({
                        name: rData.name,
                        color: rData.color,
                        permissions: BigInt(rData.permissions),
                        hoist: rData.hoist,
                        mentionable: rData.mentionable,
                        reason: "DNA Deployment"
                    });
                    roleMap.set(rData.name, newRole.id);
                    await new Promise(r => setTimeout(r, 5));
                } catch (e) { }
            }

            // Restore Icons
            if (data.settings?.iconURL) {
                try {
                    const res = await fetch(data.settings.iconURL);
                    if (res.ok) await message.guild.setIcon(Buffer.from(await res.arrayBuffer()));
                } catch (e) { }
            }

            // ───── PHASE 2: OVERWRITE LOGIC ─────
            const resolveOverwrites = (oldOverwrites, sourceRoles) => {
                if (!oldOverwrites) return [];
                const newOverwrites = [];
                for (const o of oldOverwrites) {
                    if (o.type === 1) { // Member
                        newOverwrites.push({ id: o.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) });
                    } else if (o.id === data.guildId) { // @everyone
                        newOverwrites.push({ id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) });
                    } else {
                        const sourceRole = sourceRoles.find(r => r.id === o.id);
                        if (sourceRole) {
                            const newRoleId = roleMap.get(sourceRole.name);
                            if (newRoleId) newOverwrites.push({ id: newRoleId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) });
                        }
                    }
                }
                return newOverwrites;
            };

            // ───── PHASE 3: STRUCTURAL WAVE ─────
            const createdCats = new Map(); // Name -> New ID

            // WAVE 1: Categories
            for (const catData of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                try {
                    const newCat = await message.guild.channels.create({
                        name: catData.name,
                        type: catData.type,
                        position: catData.position,
                        permissionOverwrites: resolveOverwrites(catData.overwrites, data.roles),
                        reason: "DNA Deployment"
                    });
                    createdCats.set(catData.name, newCat.id);
                    await new Promise(r => setTimeout(r, 5));
                } catch (e) { }
            }

            // WAVE 2: Elements
            const createChan = async (cData, parentId = null) => {
                try {
                    await message.guild.channels.create({
                        name: cData.name,
                        type: cData.type,
                        topic: cData.topic,
                        bitrate: cData.bitrate,
                        userLimit: cData.userLimit,
                        nsfw: cData.nsfw,
                        parentId: parentId,
                        position: cData.rawPosition || cData.position,
                        permissionOverwrites: resolveOverwrites(cData.overwrites, data.roles),
                        reason: "DNA Deployment"
                    });
                } catch (e) { }
            };

            const subChannelsGroup = data.channels.filter(c => c.type === ChannelType.GuildCategory && c.children);
            for (const catData of subChannelsGroup) {
                const pid = createdCats.get(catData.name);
                for (const child of catData.children) {
                    await createChan(child, pid);
                    await new Promise(r => setTimeout(r, 5));
                }
            }

            const orphans = data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children);
            for (const orphan of orphans) {
                await createChan(orphan);
                await new Promise(r => setTimeout(r, 5));
            }

            // FINAL PULSE
            await statusChannel.send(`✨ **DNA SUCCESSFULLLY APPLIED.** Server matrix aligned.`);

            const finalEmbed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("🛡️ STRUCTURAL DNA APPLIED")
                .setDescription(`The server structure from \`${dnaKey}\` has been reconstructed with total fidelity.`)
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime Safety Archive" });

            await statusChannel.send({ embeds: [finalEmbed] });

        } catch (e) {
            console.error(e);
            return message.channel.send("❌ **Sequence Aborted:** Internal error or timeout.");
        }
    }
};
