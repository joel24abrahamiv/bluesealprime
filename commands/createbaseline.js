const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "createbaseline",
    description: "Create a security snapshot of the server (Owner Only)",
    aliases: ["baseline", "snap"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const guild = message.guild;
        const BASELINE_PATH = path.join(__dirname, "../data/baseline.json");

        // 1. DATA COLLECTION
        const data = {
            timestamp: Date.now(),
            guildId: guild.id,
            author: message.author.id,
            stats: {
                channels: guild.channels.cache.size,
                roles: guild.roles.cache.size,
                members: guild.memberCount
            },
            channels: guild.channels.cache.map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                parentId: c.parentId,
                permissionOverwrites: c.permissionOverwrites ? c.permissionOverwrites.cache.map(p => ({
                    id: p.id,
                    allow: p.allow.bitfield.toString(),
                    deny: p.deny.bitfield.toString()
                })) : []
            })),
            roles: guild.roles.cache.map(r => ({
                id: r.id,
                name: r.name,
                color: r.hexColor,
                hoist: r.hoist,
                permissions: r.permissions.bitfield.toString()
            }))
        };

        // 2. SAVE TO FILE
        fs.writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2));

        // 3. PREMIUM EMBED RESPONSE
        const embed = new EmbedBuilder()
            .setColor("#000000") // Black/Deep
            .setTitle("🔒 SECURITY BASELINE ESTABLISHED")
            .setDescription(`**Snapshot Secure.**\nA complete backup of server permissions, roles, and channels has been indexed.`)
            .addFields(
                { name: "📁 Channels", value: `\`${data.stats.channels}\``, inline: true },
                { name: "🎭 Roles", value: `\`${data.stats.roles}\``, inline: true },
                { name: "👥 Members", value: `\`${data.stats.members}\``, inline: true },
                { name: "⏱️ Timestamp", value: `<t:${Math.floor(data.timestamp / 1000)}:f>`, inline: false }
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
            .setFooter({ text: "BlueSealPrime • Recovery System", iconURL: message.client.user.displayAvatarURL() });

        await message.channel.send({ embeds: [embed] });
    }
};
