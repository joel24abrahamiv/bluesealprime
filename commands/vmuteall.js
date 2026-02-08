const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "vmuteall",
    description: "Mute EVERYONE in your voice channel (except bots/immune)",
    usage: "!vmuteall",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply("🚫 You don't have permission.");
        }

        const channel = message.member.voice.channel;
        if (!channel) return message.reply("⚠️ You must be in a voice channel.");

        const members = channel.members.filter(m => !m.user.bot && m.id !== BOT_OWNER_ID && m.id !== message.author.id); // Don't mute self or owner

        if (members.size === 0) return message.reply("⚠️ No one to mute.");

        message.reply(`🔇 Muting **${members.size}** members in **${channel.name}**...`);

        for (const [id, member] of members) {
            try {
                await member.voice.setMute(true, "Mass Mute");
            } catch (e) { }
        }

        message.channel.send("✅ **Mass mute complete.**");
    }
};
