const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "muvu",
    description: "Retrieve a user from quarantine (move to your VC)",
    usage: "!muvu @user",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Permission Denied.**")], V2_RED)] });

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User not found.")], V2_RED)] });
        if (!target.voice.channel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User is not in a voice channel.")], V2_RED)] });

        const destChannel = message.member.voice.channel;
        if (!destChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **You must be in a voice channel** to pull them to you.")], V2_RED)] });

        try {
            await target.voice.setChannel(destChannel);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🚚 **${target.user.tag}** retrieved to **${destChannel.name}**.`)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to move user.")], V2_RED)] });
        }
    }
};
