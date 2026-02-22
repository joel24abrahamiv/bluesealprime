const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "muv",
    description: "Move user to Quarantine VC (The Void) or a specified channel",
    usage: "!muv @user [channel_id]",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Permission Denied.**")], V2_RED)] });

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User not found.")], V2_RED)] });
        if (!target.voice.channel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User is not in a voice channel.")], V2_RED)] });
        if (target.id === BOT_OWNER_ID) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Cannot move the Owner.")], V2_RED)] });

        let destChannel;
        if (args[1]) {
            destChannel = message.guild.channels.cache.get(args[1]);
        } else {
            destChannel = message.guild.channels.cache.find(c => c.name === "The Void" && c.type === ChannelType.GuildVoice);
            if (!destChannel) {
                try {
                    destChannel = await message.guild.channels.create({
                        name: "The Void",
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: [{ id: message.guild.id, deny: [PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream] }]
                    });
                } catch (e) {
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to create Void channel.")], V2_RED)] });
                }
            }
        }

        if (!destChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Destination channel not found.")], V2_RED)] });

        try {
            await target.voice.setChannel(destChannel);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🚚 **${target.user.tag}** moved to **${destChannel.name}**.`)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to move user.")], V2_RED)] });
        }
    }
};
