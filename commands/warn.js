const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "warn",
    description: "Warn a user (DMs them)",
    usage: "!warn @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        const reason = args.slice(1).join(" ") || "No reason provided.";

        try {
            await target.send(`⚠️ **You have been warned in ${message.guild.name}**\nReason: ${reason}`);
            message.reply(`✅ Warned **${target.user.tag}**.`);
        } catch (e) {
            message.reply(`✅ Warned **${target.user.tag}** (DM Failed).`);
        }
    }
};
