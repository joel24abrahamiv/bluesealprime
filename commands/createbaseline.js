const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const BASELINE_PATH = path.join(__dirname, "../data/baseline.json");

module.exports = {
    name: "createbaseline",
    description: "Create a security snapshot of the server (Owner Only)",
    aliases: ["baseline", "snap"],

    async execute(message) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const guild = message.guild;
        const data = {
            timestamp: Date.now(),
            guildId: guild.id,
            author: message.author.id,
            stats: { channels: guild.channels.cache.size, roles: guild.roles.cache.size, members: guild.memberCount },
            channels: guild.channels.cache.map(c => ({
                id: c.id, name: c.name, type: c.type, parentId: c.parentId,
                permissionOverwrites: c.permissionOverwrites ? c.permissionOverwrites.cache.map(p => ({ id: p.id, allow: p.allow.bitfield.toString(), deny: p.deny.bitfield.toString() })) : []
            })),
            roles: guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor, hoist: r.hoist, permissions: r.permissions.bitfield.toString() }))
        };

        fs.writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2));

        await message.channel.send({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔒 SECURITY BASELINE ESTABLISHED", 2),
                    V2.text(
                        `**Snapshot secured.** A complete index of server permissions, roles, and channels has been saved.\n\n` +
                        `> 📁 **Channels:** \`${data.stats.channels}\`\n` +
                        `> 🎭 **Roles:** \`${data.stats.roles}\`\n` +
                        `> 👥 **Members:** \`${data.stats.members}\`\n` +
                        `> ⏱️ **Snapshot At:** <t:${Math.floor(data.timestamp / 1000)}:f>`
                    )
                ], guild.iconURL({ dynamic: true }) || V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • Recovery System*")
            ], V2_BLUE)]
        });
    }
};
