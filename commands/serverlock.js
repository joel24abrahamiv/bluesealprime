const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "serverlock",
    description: "Locks the entire server",
    usage: "!serverlock [reason]",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **ACCESS DENIED:** Administrator required.")], V2_RED)] });
        }

        const reason = args.join(" ") || "Administrative Lockdown Protocol";
        const channels = message.guild.channels.cache.filter(c => c.type === 0);

        const msg = await message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔒 LOCKDOWN INITIATED...", 2),
                V2.text("Processing channel overrides in parallel...")
            ], V2_RED)]
        });

        const results = await Promise.allSettled(
            channels.map(ch => ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }, { reason: `Server Lock: ${reason}` }).catch(() => { }))
        );
        const lockedCount = results.filter(r => r.status === "fulfilled").length;

        return msg.edit({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔒 SERVER LOCKDOWN COMPLETE", 2),
                    V2.text(`\`\`\`yml\nSTATUS:   LOCKED\nACCESS:   RESTRICTED\nREASON:   ${reason}\n\`\`\``)
                ], botAvatar),
                V2.separator(),
                V2.text(`> **Channels Affected:** \`${lockedCount}\`\n> **Only Admins may communicate.**`)
            ], V2_RED)]
        });
    }
};
