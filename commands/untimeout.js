const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "untimeout",
    description: "Remove timeout from a user",
    usage: "!untimeout @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ User not found.")] });

        try {
            if (!target.moderatable) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot untimeout this user.")] });
            }

            await target.timeout(null, "Untimeout command");

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("🔊 TIMEOUT REMOVED")
                .setDescription(`**${target.user.tag}** has been released from isolation.`)
                .setFooter({ text: `Actioned by ${message.author.tag}` })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to untimeout user.")] });
        }
    }
};
