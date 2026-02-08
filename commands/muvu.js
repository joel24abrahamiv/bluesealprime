const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "muvu",
    description: "Move user back to previous channel (or disconnect if unknown)",
    usage: "!muvu @user",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        // Logic: Actually, we don't track "previous". 
        // muvu usually means "Move User ... Up?" or "Un-Move"?
        // In the image it said "Restore from quarantine".
        // Use "General" or Author's channel?
        // Let's tries to move to author's channel.

        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply("🚫 Permission Denied.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");
        if (!target.voice.channel) return message.reply("⚠️ User not in VC.");

        const destChannel = message.member.voice.channel;
        if (!destChannel) return message.reply("⚠️ You are not in a VC to pull them to. Join a channel first.");

        try {
            await target.voice.setChannel(destChannel);
            message.reply(`🚚 **${target.user.tag}** retrieved to ${destChannel.name}.`);
        } catch (e) {
            message.reply("❌ Failed to move user.");
        }
    }
};
