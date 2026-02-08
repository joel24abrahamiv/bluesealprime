const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "serverunlock",
    description: "Unlocks the entire server (Admin Only)",
    usage: "!serverunlock",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // Owner/Admin Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Protocol Omega Authorization Required.")] });
        }

        const channels = message.guild.channels.cache.filter(c => c.type === 0); // Text Channels
        let unlockedCount = 0;

        const statusEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("🔓 SERVER UNLOCK INITIATED")
            .setDescription(`**Lifting Security Protocols**\nProcessing channel overrides...`)
            .setFooter({ text: "BlueSealPrime • Absolute Control" });

        const msg = await message.reply({ embeds: [statusEmbed] });

        for (const [id, channel] of channels) {
            try {
                // Resetting to null removes the explicit override, effectively unlocking if default is allowed
                // OR we can set to true. Setting to null is cleaner usually.
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: null
                }, { reason: `Server Unlock by ${message.author.tag}` });
                unlockedCount++;
            } catch (err) {
                console.error(`Failed to unlock ${channel.name}: ${err}`);
            }
        }

        const finalEmbed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle("🔓 SERVER UNLOCKED")
            .setDescription(
                "```diff\n" +
                "+ STATUS:      OPERATIONAL\n" +
                "+ ACCESS:      GRANTED\n" +
                "```\n" +
                `**Security Restrictions Lifted.**\n` +
                `> Channels Restored: \`${unlockedCount}\`\n` +
                `> Normal communications may resume.`
            )
            .setTimestamp();

        return msg.edit({ embeds: [finalEmbed] });
    }
};
