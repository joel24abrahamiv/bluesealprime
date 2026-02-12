const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "unlockvc",
    description: "Unlock the voice channel you are currently in for @everyone",
    usage: "!unlockvc",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["uvc"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You do not have permission to use this command.")] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 I do not have permission to manage channels.")] });
        }

        const channel = message.member.voice.channel;
        if (!channel) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ You must be in a voice channel to unlock it.")] });
        }

        try {
            // Unlock channel for @everyone (Connect: null - inherits/defaults to allowed if not specifically denied elsewhere for @everyone)
            // Or explicitly set to true if that's the desired behavior. Usually null removes the overwrite.
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: null
            }, { reason: `Unlocked by ${message.author.tag}` });

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR || "#00FF00")
                .setTitle("🔓 VOICE CHANNEL UNLOCKED")
                .setDescription(
                    "```diff\n" +
                    "+ STATUS:  UNLOCKED\n" +
                    "- CHANNEL: " + channel.name + "\n" +
                    "+ TARGET:  @everyone\n" +
                    "```"
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
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to unlock the voice channel.")] });
        }
    }
};
