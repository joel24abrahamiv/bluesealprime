const { ChannelType, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "deletevc",
    description: "Deletes the voice channel you are currently in",
    aliases: ["dvc", "delvc"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    async execute(message, args) {
        if (!message.member.voice.channel) {
            return message.reply("⚠️ You must be in a voice channel to delete it.");
        }

        const channel = message.member.voice.channel;

        try {
            await channel.delete();

            const embed = new EmbedBuilder()
                .setColor("#FF0000") // Red
                .setDescription(`🗑️ **Voice Channel Deleted**\n> Name: \`${channel.name}\``);

            await message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("❌ Error: Could not delete channel (Missing Permissions?).");
        }
    }
};
