const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "deletech",
    description: "Delete a channel.",
    usage: "!deletech [channel]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["removech", "delch", "dc"],

    async execute(message, args) {
        const channel = message.mentions.channels.first() || message.channel;

        if (!channel.deletable) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ **Error:** I cannot delete this channel.")]
            });
        }

        try {
            // If deleting the current channel, we can't reply in it.
            // We'll try to reply in the log channel or just DM the user? 
            // The request says "replies in embed". If channel is gone, we can't reply.
            // So detailed logic: if mentioned channel != current channel, reply current.

            const isCurrent = channel.id === message.channel.id;

            await channel.delete(`Deleted by ${message.author.tag}`);

            if (!isCurrent) {
                const embed = new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setDescription(`✅ **Successfully deleted channel:** ${channel.name}`);
                message.channel.send({ embeds: [embed] });
            }

        } catch (err) {
            console.error(err);
            if (message.channel) {
                message.reply({
                    embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ **Error:** Failed to delete channel.")]
                });
            }
        }
    }
};
