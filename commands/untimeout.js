const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "untimeout",
    description: "Remove timeout from a user",
    usage: "!untimeout @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **User not found.**")], V2_RED)] });

        try {
            if (!target.moderatable) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ I cannot remove the timeout from this user.")], V2_RED)] });
            await target.timeout(null, "Untimeout command");
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🔊 TIMEOUT REMOVED", 2),
                    V2.text(`**${target.user.tag}** has been released from isolation.\n> *Actioned by ${message.author.tag}*`)
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to remove timeout.** Check my role hierarchy.")], V2_RED)] });
        }
    }
};
