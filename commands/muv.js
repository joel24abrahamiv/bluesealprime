const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "muv",
    description: "Move user to a Quarantine Voice Channel (or specified)",
    usage: "!muv @user [channel_id]",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply("🚫 Permission Denied.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");
        if (!target.voice.channel) return message.reply("⚠️ User not in VC.");

        if (target.id === BOT_OWNER_ID) return message.reply("❌ Cannot move Owner.");

        // If channel ID provided, move there. Else, move to "The Void" (Create if needed)
        let destChannel;
        const inputId = args[1]; // optional

        if (inputId) {
            destChannel = message.guild.channels.cache.get(inputId);
        } else {
            // Find/Create Quarantine VC
            destChannel = message.guild.channels.cache.find(c => c.name === "The Void" && c.type === ChannelType.GuildVoice);
            if (!destChannel) {
                try {
                    destChannel = await message.guild.channels.create({
                        name: "The Void",
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                deny: [PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream] // Silence
                            }
                        ]
                    });
                } catch (e) {
                    return message.reply("❌ Failed to create Void channel.");
                }
            }
        }

        if (!destChannel) return message.reply("⚠️ Destination channel invalid.");

        try {
            await target.voice.setChannel(destChannel);
            message.reply(`🚚 **${target.user.tag}** moved to ${destChannel.name}.`);
        } catch (e) {
            message.reply("❌ Failed to move user.");
        }
    }
};
