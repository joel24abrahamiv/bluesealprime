const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "vunmuteall",
    description: "Unmute EVERYONE in your voice channel",
    usage: "!vunmuteall",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply("🚫 You don't have permission.");
        }

        const channel = message.member.voice.channel;
        if (!channel) return message.reply("⚠️ You must be in a voice channel.");

        const members = channel.members.filter(m => !m.user.bot && m.voice.serverMute);

        if (members.size === 0) return message.reply("⚠️ No one to unmute.");

        message.reply(`🔊 Unmuting **${members.size}** members in **${channel.name}**...`);

        // TURBO MASS UNMUTE (PARALLEL)
        const unmuteTasks = members.map(member =>
            member.voice.setMute(false, "Mass Unmute Protocol").catch(() => { })
        );

        await Promise.allSettled(Array.from(unmuteTasks.values()));

        message.channel.send("✅ **Mass unmute complete.**");
    }
};
