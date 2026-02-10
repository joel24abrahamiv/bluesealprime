const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "locksound",
    description: "Lock the soundboard in the current channel",
    usage: "!locksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    async execute(message, args) {
        const channel = message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                UseSoundboard: false,
                UseExternalSounds: false
            });

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("🔊 Soundboard Locked")
                .setDescription(`The soundboard has been **LOCKED** for this channel.\nMembers can no longer play sounds.`)
                .setFooter({ text: "BlueSealPrime • Security" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            const errorEmbed = new EmbedBuilder()
                .setColor(ERROR_COLOR)
                .setDescription("❌ Failed to lock soundboard. I may check my permissions.");
            message.reply({ embeds: [errorEmbed] });
        }
    }
};
