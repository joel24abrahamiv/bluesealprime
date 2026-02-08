const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "vunmute",
    description: "Server unmute a member in Voice Channel",
    usage: "!vunmute @user",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply("🚫 You don't have permission to unmute members.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        if (!target.voice.channel) return message.reply("⚠️ User is not in a voice channel.");

        try {
            await target.voice.setMute(false, `Unmuted by ${message.author.tag}`);
            message.reply(`🔊 **${target.user.tag}** has been unmuted.`);
        } catch (e) {
            message.reply("❌ Failed to unmute user.");
        }
    }
};
