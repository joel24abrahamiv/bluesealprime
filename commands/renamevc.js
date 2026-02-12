const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "renamevc",
    description: "Rename the voice channel you are currently in",
    usage: "!renamevc <new name>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["rvc"],

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
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ You must be in a voice channel to rename it.")] });
        }

        if (!args[0]) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ Usage: `!renamevc <new name>`")] });
        }

        const oldName = channel.name;
        const newName = args.join(" ");

        try {
            await channel.setName(newName);

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR || "#00FF00")
                .setTitle("🏷️ VOICE CHANNEL RENAMED")
                .setDescription(`**${oldName}** ➡️ **${newName}**`)
                .addFields(
                    { name: "🛡️ Modified By", value: `> ${message.author}`, inline: true },
                    { name: "⏱️ Time", value: `> <t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Moderation System", iconURL: message.client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to rename the voice channel.")] });
        }
    }
};
