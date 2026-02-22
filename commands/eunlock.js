const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "eunlock",
    description: "God Mode Unlock Commands (Owner Only)",
    aliases: ["eunl"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        if (!args[0]) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Usage:** `!eunlock <type> [args]`\nTypes: `role`, `media`, `threads`, `embeds`, `links`, `botcmds`")], V2_RED)]
            });
        }

        const type = args[0].toLowerCase();
        const channel = message.channel;
        const guild = message.guild;

        try {
            // 1. ROLE UNLOCK
            if (type === "role") {
                const role = message.mentions.roles.first() || guild.roles.cache.get(args[1]);
                if (!role) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ **Error:** Target role not found.")], V2_RED)] });

                await channel.permissionOverwrites.delete(role, "God Unlock: Role Unmuted");
                const roleUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 CHANNEL UNLOCKED", 2),
                        V2.text(`**Protocol:** Role Restored\n**Target:** ${role}\n**Status:** \`CLEAR\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3064/3064197.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [roleUnlock] });
            }

            // 2. MEDIA UNLOCK
            if (type === "media") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    AttachFiles: null,
                    EmbedLinks: null
                }, { reason: "God Unlock: Media Restored" });
                const mediaUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 MEDIA PROTOCOL", 2),
                        V2.text(`**System:** Content Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3342/3342137.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [mediaUnlock] });
            }

            // 3. THREADS UNLOCK
            if (type === "threads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null,
                    SendMessagesInThreads: null
                }, { reason: "God Unlock: Threads Restored" });
                const threadUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 THREAD PROTOCOL", 2),
                        V2.text(`**System:** Thread Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/5968/5968853.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [threadUnlock] });
            }

            // 4. EMBEDS UNLOCK
            if (type === "embeds") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    EmbedLinks: null
                }, { reason: "God Unlock: Embeds Restored" });
                const embedUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 EMBED PROTOCOL", 2),
                        V2.text(`**System:** Visual Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2164/2164327.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [embedUnlock] });
            }

            // 5. LINKS UNLOCK
            if (type === "links") {
                updateRestricted(guild.id, channel.id, "links", false);
                const linkUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 LINK PROTOCOL", 2),
                        V2.text(`**Defense:** Anti-Link Pulse Disengaged\n**Zone:** ${channel}\n**Status:** \`CLEAR\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2088/2088617.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [linkUnlock] });
            }

            // 6. BOT CMDS UNLOCK
            if (type === "botcmds") {
                const targetRole = message.mentions.roles.first() || (args[1] ? guild.roles.cache.get(args[1]) : null);

                if (targetRole) {
                    updateRestricted(guild.id, targetRole.id, "botcmds_role", false);
                    const botRoleUnlock = V2.container([
                        V2.section([
                            V2.heading("🔓 BOT PROTOCOL", 2),
                            V2.text(`**Clearance:** Command Restoration\n**Target:** ${targetRole}\n**Status:** \`AUTHORIZED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_BLUE);
                    return message.channel.send({ content: null, components: [botRoleUnlock] });
                } else {
                    updateRestricted(guild.id, channel.id, "botcmds_channel", false);
                    const botChanUnlock = V2.container([
                        V2.section([
                            V2.heading("🔓 BOT PROTOCOL", 2),
                            V2.text(`**Zone Clear:** Command Vacuum Repaired\n**Channel:** ${channel}\n**Status:** \`AUTHORIZED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_BLUE);
                    return message.channel.send({ content: null, components: [botChanUnlock] });
                }
            }
        } catch (e) {
            console.error(e);
            return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text(`❌ **Fault:** Failed to execute unlock. \`${e.message}\``)], V2_RED)] });
        }
    }
};

function updateRestricted(guildId, targetId, type, add) {
    const DB_PATH = path.join(__dirname, "../data/restricted.json");
    let data = {};
    if (fs.existsSync(DB_PATH)) {
        try { data = JSON.parse(fs.readFileSync(DB_PATH)); } catch (e) { }
    }

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][type]) data[guildId][type] = [];

    if (add) {
        if (!data[guildId][type].includes(targetId)) data[guildId][type].push(targetId);
    } else {
        data[guildId][type] = data[guildId][type].filter(id => id !== targetId);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
