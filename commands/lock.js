const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "lock",
    description: "Lock the current channel for @everyone",
    usage: "!lock [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const reason = args.join(" ") || "No reason provided";

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You do not have permission to use this command.")] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 I do not have permission to manage channels.")] });
        }

        try {
            // Lock channel for @everyone
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            }, { reason: `Locked by ${message.author.tag}: ${reason}` });

            // Ensure Owner Bypass (Allow owner to send messages even if locked)
            if (isBotOwner) {
                await message.channel.permissionOverwrites.edit(BOT_OWNER_ID, {
                    SendMessages: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor("#2B2D31") // Dark Carbon
                .setTitle("🔒 CHANNEL LOCKDOWN")
                .setDescription(
                    "```diff\n" +
                    "- STATUS:  LOCKED\n" +
                    "- TARGET:  @everyone\n" +
                    "+ ACCESS:  Staff Only\n" +
                    "```\n" +
                    `**Reason:** ${reason}`
                )
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/3064/3064155.png") // Lock Icon
                .addFields(
                    { name: "🛡️ Authorized By", value: `> ${message.author}`, inline: true },
                    { name: "⏱️ Time", value: `> <t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Moderation System", iconURL: message.client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to lock the channel.")] });
        }
    }
};
