const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "elock",
    description: "God Mode Lock Commands (Owner Only)",
    aliases: ["el"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        if (!args[0]) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:** `!elock <type> [args]`\nTypes: `role`, `media`, `threads`, `embeds`, `links`, `botcmds`")]
            });
        }

        const type = args[0].toLowerCase();
        const channel = message.channel;
        const guild = message.guild;

        try {
            // 1. ROLE LOCK
            if (type === "role") {
                const role = message.mentions.roles.first() || guild.roles.cache.get(args[1]);
                if (!role) return message.reply("⚠️ **Error:** Role not found.");

                await channel.permissionOverwrites.edit(role, { SendMessages: false }, { reason: "God Lock: Role Muted" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 CHANNEL SECURED").setDescription(`**Role Protocol Active.**\nTarget: ${role}\nStatus: **MUTED**`)] });
            }

            // 2. MEDIA LOCK
            if (type === "media") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    AttachFiles: false,
                    EmbedLinks: false
                }, { reason: "God Lock: Media Restricted" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 MEDIA PROTOCOL").setDescription(`**Content Filter Active.**\nFiles & Links are now **DISABLED** for everyone.`)] });
            }

            // 3. THREADS LOCK
            if (type === "threads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    SendMessagesInThreads: false
                }, { reason: "God Lock: Threads Restricted" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 THREAD PROTOCOL").setDescription(`**Thread System Disabled.**\nNo new threads can be created.`)] });
            }

            // 4. EMBEDS LOCK
            if (type === "embeds") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    EmbedLinks: false
                }, { reason: "God Lock: Embeds Restricted" });
                return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 EMBED PROTOCOL").setDescription(`**Visual Filter Active.**\nEmbeds are now **DISABLED** for everyone.`)] });
            }

            // 5. LINKS LOCK (Requires index.js Handler)
            if (type === "links") {
                updateRestricted(guild.id, channel.id, "links", true);
                return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 LINK PROTOCOL").setDescription(`**Anti-Link Field Active.**\nAll links will be **VAPORIZED** upon entry.`)] });
            }

            // 6. BOT CMDS LOCK (Requires index.js Handler)
            if (type === "botcmds") {
                // Check if role is specified
                const targetRole = message.mentions.roles.first() || (args[1] ? guild.roles.cache.get(args[1]) : null);

                if (targetRole) {
                    updateRestricted(guild.id, targetRole.id, "botcmds_role", true);
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 BOT PROTOCOL").setDescription(`**Command Override.**\nTarget: ${targetRole}\nStatus: **BLOCKED** from using bot commands.`)] });
                } else {
                    updateRestricted(guild.id, channel.id, "botcmds_channel", true);
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("🔒 BOT PROTOCOL").setDescription(`**Zone Lock Active.**\nBot commands are **DISABLED** in this channel.`)] });
                }
            }

            // 7. PUBLIC THREADS LOCK (Specific alias if needed)
            if (type === "publicthreads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: false
                }, { reason: "God Lock: Public Threads Restricted" });
                return message.reply({ embeds: [new EmbedBuilder().setColor("#FF0000").setDescription(`🔒 **LOCKED:** Public Threads disabled for @everyone.`)] });
            }


        } catch (e) {
            console.error(e);
            message.reply("❌ **Error:** Failed to execute lock command.");
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
