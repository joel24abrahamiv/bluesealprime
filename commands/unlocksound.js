const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "unlocksound",
    description: "Unlock the soundboard in the current channel",
    usage: "!unlocksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    async execute(message, args) {
        const channel = message.channel;

        try {
            // Setting to null removes the overwrite, returning to default permissions
            // Or true to forcefully allow it. Let's use true to be explicit "Unlock".
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                UseSoundboard: true,
                UseExternalSounds: true
            });

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("🔊 Soundboard Unlocked")
                .setDescription(`The soundboard has been **UNLOCKED** for this channel.\nMembers can now play sounds.`)
                .setFooter({ text: "BlueSealPrime • Security" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            const errorEmbed = new EmbedBuilder()
                .setColor(ERROR_COLOR)
                .setDescription("❌ Failed to unlock soundboard. I may check my permissions.");
            message.reply({ embeds: [errorEmbed] });
        }
    }
};
