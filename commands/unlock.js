const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "unlock",
    description: "Unlock the current channel for @everyone",
    usage: "!unlock [reason]",
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
            // Unlock channel for @everyone (reset to null or true)
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null
            }, { reason: `Unlocked by ${message.author.tag}: ${reason}` });

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("🔓 CHANNEL UNLOCKED")
                .setDescription(
                    "```diff\n" +
                    "+ STATUS:  UNLOCKED\n" +
                    "+ TARGET:  @everyone\n" +
                    "+ ACCESS:  Restored\n" +
                    "```\n" +
                    `**Reason:** ${reason}`
                )
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/3064/3064197.png") // Unlock Icon
                .addFields(
                    { name: "🛡️ Authorized By", value: `> ${message.author}`, inline: true },
                    { name: "⏱️ Time", value: `> <t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Moderation System", iconURL: message.client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to unlock the channel.")] });
        }
    }
};
