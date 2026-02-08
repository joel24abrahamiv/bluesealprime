const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "serverlock",
    description: "Locks the entire server (Admin Only)",
    usage: "!serverlock [reason]",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // Owner/Admin Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Protocol Omega Authorization Required.")] });
        }

        const reason = args.join(" ") || "Administrative Lockdown Protocol Initiated";
        const channels = message.guild.channels.cache.filter(c => c.type === 0); // Text Channels
        let lockedCount = 0;

        const statusEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🔒 SERVER LOCKDOWN INITIATED")
            .setDescription(`**Secure Protocol Active**\nProcessing channel overrides...`)
            .setFooter({ text: "BlueSealPrime • Absolute Control" });

        const msg = await message.reply({ embeds: [statusEmbed] });

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false
                }, { reason: `Server Lock: ${reason}` });
                lockedCount++;
            } catch (err) {
                console.error(`Failed to lock ${channel.name}: ${err}`);
            }
        }

        const finalEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🔒 SERVER LOCKDOWN COMPLETE")
            .setDescription(
                "```diff\n" +
                "- STATUS:      LOCKED DOWN\n" +
                "- ACCESS:      RESTRICTED\n" +
                "- REASON:      " + reason + "\n" +
                "```\n" +
                `**System Secured.**\n` +
                `> Channels Affected: \`${lockedCount}\`\n` +
                `> Only Administrators may communicate.`
            )
            .setImage("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZnJxcG54OGZqMGZqMGZqMGZqMGZqMGZqMGZqMGZqMGZqMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6ZxpC8U7jX6/giphy.gif") // Red alert / lockdown gif
            .setTimestamp();

        return msg.edit({ embeds: [finalEmbed] });
    }
};
