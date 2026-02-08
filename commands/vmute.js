const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "vmute",
    description: "Server mute a member in Voice Channel",
    usage: "!vmute @user [reason]",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        // Owner Bypass & Perms
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply("🚫 You don't have permission to mute members.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        if (!target.voice.channel) return message.reply("⚠️ User is not in a voice channel.");

        // Immunity 
        if (target.id === BOT_OWNER_ID) return message.reply("❌ Cannot mute the Bot Owner.");

        try {
            await target.voice.setMute(true, args.slice(1).join(" ") || `Muted by ${message.author.tag}`);
            message.reply(`🔇 **${target.user.tag}** has been server muted.`);
        } catch (e) {
            message.reply("❌ Failed to mute user. Check my permissions.");
        }
    }
};
