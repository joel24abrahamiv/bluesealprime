const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR } = require("../config");
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
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:** `!eunlock <type> [args]`\nTypes: `role`, `media`, `threads`, `embeds`, `links`, `botcmds`")]
            });
        }

        const type = args[0].toLowerCase();
        const channel = message.channel;
        const guild = message.guild;

        try {
            // 1. ROLE UNLOCK
            if (type === "role") {
                const role = message.mentions.roles.first() || guild.roles.cache.get(args[1]);
                if (!role) return message.reply("⚠️ **Error:** Role not found.");

                await channel.permissionOverwrites.delete(role, "God Unlock: Role Unmuted");
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 CHANNEL UNLOCKED").setDescription(`**Role Protocol Disengaged.**\nTarget: ${role}\nStatus: **MUTED LIFTED**`)] });
            }

            // 2. MEDIA UNLOCK
            if (type === "media") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    AttachFiles: null,
                    EmbedLinks: null
                }, { reason: "God Unlock: Media Restored" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 MEDIA PROTOCOL").setDescription(`**Content Filter Disengaged.**\nFiles & Links are now **ALLOWED**.`)] });
            }

            // 3. THREADS UNLOCK
            if (type === "threads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null,
                    SendMessagesInThreads: null
                }, { reason: "God Unlock: Threads Restored" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 THREAD PROTOCOL").setDescription(`**Thread System Restored.**\nThreads can be created.`)] });
            }

            // 4. EMBEDS UNLOCK
            if (type === "embeds") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    EmbedLinks: null
                }, { reason: "God Unlock: Embeds Restored" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 EMBED PROTOCOL").setDescription(`**Visual Filter Disengaged.**\nEmbeds are now **ALLOWED**.`)] });
            }

            // 5. LINKS UNLOCK
            if (type === "links") {
                updateRestricted(guild.id, channel.id, "links", false);
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 LINK PROTOCOL").setDescription(`**Anti-Link Field Disengaged.**\nLinks are now **ALLOWED**.`)] });
            }

            // 6. BOT CMDS UNLOCK
            if (type === "botcmds") {
                const targetRole = message.mentions.roles.first() || (args[1] ? guild.roles.cache.get(args[1]) : null);

                if (targetRole) {
                    updateRestricted(guild.id, targetRole.id, "botcmds_role", false);
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 BOT PROTOCOL").setDescription(`**Command Override Lifted.**\nTarget: ${targetRole}\nStatus: **ALLOWED** to use bot commands.`)] });
                } else {
                    updateRestricted(guild.id, channel.id, "botcmds_channel", false);
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🔓 BOT PROTOCOL").setDescription(`**Zone Lock Lifted.**\nBot commands are **ALLOWED** in this channel.`)] });
                }
            }


        } catch (e) {
            console.error(e);
            message.reply("❌ **Error:** Failed to execute unlock command.");
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
