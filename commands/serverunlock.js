const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "serverunlock",
    description: "Unlocks the entire server",
    usage: "!serverunlock",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **ACCESS DENIED:** Administrator required.")], V2_RED)] });
        }

        const channels = message.guild.channels.cache.filter(c => c.type === 0);

        const msg = await message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔓 UNLOCK INITIATED...", 2),
                V2.text("Lifting security overrides in parallel...")
            ], V2_BLUE)]
        });

        const results = await Promise.allSettled(
            channels.map(ch => ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null }, { reason: `Server Unlock by ${message.author.tag}` }).catch(() => { }))
        );
        const unlockedCount = results.filter(r => r.status === "fulfilled").length;

        return msg.edit({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔓 SERVER UNLOCKED", 2),
                    V2.text(`\`\`\`yml\nSTATUS:   OPERATIONAL\nACCESS:   GRANTED\n\`\`\``)
                ], botAvatar),
                V2.separator(),
                V2.text(`> **Channels Restored:** \`${unlockedCount}\`\n> **Normal communications may resume.**`)
            ], V2_BLUE)]
        });
    }
};
