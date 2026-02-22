const V2 = require("../utils/v2Utils");
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "rstsafbackup",
    description: "Apply Structural DNA Backup to the current server.",
    usage: "!rstsafbackup <DNA-Key>",
    aliases: ["applydna", "safrestore"],
    whitelistOnly: true,

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can deploy structural matrices.")], V2_RED)] });

        const dnaKey = args[0]?.toUpperCase();
        if (!dnaKey) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a DNA Key: `!rstsafbackup <KEY>`")], V2_RED)] });

        const SAFETY_DIR = path.join(__dirname, "../data/safety");
        const filePath = path.join(SAFETY_DIR, `${dnaKey}.json`);

        if (!fs.existsSync(filePath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ DNA Key \`${dnaKey}\` not found in archive.`)], V2_RED)] });

        let data;
        try { data = JSON.parse(fs.readFileSync(filePath, "utf8")); }
        catch (e) { return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Error reading structural template.")], V2_RED)] }); }

        // ─── CONFIRMATION ───
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm_dna").setLabel("⚠️  PROCEED WITH COLLAPSE").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancel_dna").setLabel("Abort Sequence").setStyle(ButtonStyle.Secondary)
        );

        const response = await message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("☢️ PROTOCOL OMEGA — CONFIRMATION REQUIRED", 2),
                V2.text(
                    `### **CRITICAL STRUCTURAL OVERWRITE**\n` +
                    `Deploying DNA: \`${dnaKey}\` → **${message.guild.name}**\n\n` +
                    `> ⚠️ **All existing channels & roles will be purged** and replaced.\n` +
                    `> 🔒 **Bot roles & current channel** are protected during the process.\n\n` +
                    `**Authorize sequence to proceed or abort.**`
                ),
                V2.separator(),
                confirmRow
            ], V2_RED)]
        });

        try {
            const confirmation = await response.awaitMessageComponent({ filter: i => i.user.id === message.author.id, time: 30000 });

            if (confirmation.customId === "cancel_dna")
                return confirmation.update({ flags: V2.flag, components: [V2.container([V2.text("❌ **Sequence Aborted.**")], V2_BLUE)] });

            await confirmation.update({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚡ STRUCTURAL COLLAPSE INITIATED", 2), V2.text("Purging existing structure and deploying DNA matrix...")], botAvatar)], V2_BLUE)]
            });

            // ─── PHASE 0: PURGE ───
            const currentChanId = message.channel.id;
            const botMember = await message.guild.members.fetchMe();
            const botMaxPos = botMember.roles.highest.position;

            await Promise.all([
                ...message.guild.channels.cache.filter(c => c.id !== currentChanId).map(c => c.delete().catch(() => { })),
                ...message.guild.roles.cache.filter(r => !r.managed && r.id !== message.guild.id && r.position < botMaxPos).map(r => r.delete().catch(() => { }))
            ]);

            const statusChannel = await message.guild.channels.create({ name: "🧬-restoration-status", type: ChannelType.GuildText, reason: "Structural DNA Deployment" });
            await statusChannel.send({ flags: V2.flag, components: [V2.container([V2.text("✅ **Sovereign Purge Complete.** Reconstructing structural matrix...")], V2_BLUE)] });

            // ─── PHASE 1: ROLES ───
            const roleMap = new Map();
            for (const rData of data.roles.sort((a, b) => a.position - b.position)) {
                try {
                    const newRole = await message.guild.roles.create({ name: rData.name, color: rData.color, permissions: BigInt(rData.permissions), hoist: rData.hoist, mentionable: rData.mentionable, reason: "DNA Deploy" });
                    roleMap.set(rData.name, newRole.id);
                } catch (e) { }
            }

            // ─── PHASE 2: OVERWRITE RESOLVER ───
            const resolveOverwrites = (overwrites) => {
                if (!overwrites) return [];
                return overwrites.map(o => {
                    if (o.type === 1) return { id: o.id, type: 1, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                    if (o.id === data.guildId) return { id: message.guild.id, type: 0, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                    const src = data.roles.find(r => r.id === o.id);
                    if (src) { const nid = roleMap.get(src.name); if (nid) return { id: nid, type: 0, allow: BigInt(o.allow), deny: BigInt(o.deny) }; }
                    return null;
                }).filter(Boolean);
            };

            // ─── PHASE 3: CHANNELS ───
            const createdCats = new Map();
            for (const cat of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                try {
                    const nc = await message.guild.channels.create({ name: cat.name, type: cat.type, position: cat.position, permissionOverwrites: resolveOverwrites(cat.overwrites), reason: "DNA Deploy" });
                    createdCats.set(cat.name, nc.id);
                } catch (e) { }
            }

            await Promise.all(data.channels.filter(c => c.type === ChannelType.GuildCategory && c.children).flatMap(cat =>
                cat.children.map(ch => message.guild.channels.create({
                    name: ch.name, type: ch.type, topic: ch.topic, bitrate: ch.bitrate, userLimit: ch.userLimit, nsfw: ch.nsfw,
                    parentId: createdCats.get(cat.name), position: ch.rawPosition || ch.position,
                    permissionOverwrites: resolveOverwrites(ch.overwrites), reason: "DNA Deploy"
                }).catch(() => { }))
            ));

            await Promise.all(data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children).map(c =>
                message.guild.channels.create({ name: c.name, type: c.type, topic: c.topic, bitrate: c.bitrate, userLimit: c.userLimit, position: c.rawPosition || c.position, permissionOverwrites: resolveOverwrites(c.overwrites), reason: "DNA Deploy" }).catch(() => { })
            ));

            // ─── FINAL ───
            await statusChannel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🛡️ STRUCTURAL DNA APPLIED", 2),
                        V2.text(`Server structure from \`${dnaKey}\` has been reconstructed with full fidelity.\n\n> **Roles:** \`${data.roles.length}\`\n> **Channels:** \`${data.channels.length}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Safety Archive Protocol*")
                ], "#00FF7F")]
            });

        } catch (e) {
            console.error(e);
            return message.channel.send({ flags: V2.flag, components: [V2.container([V2.text("❌ **Sequence Aborted:** Internal error or 30s timeout.")], V2_RED)] });
        }
    }
};
