const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "vunmute",
    description: "Server unmute a member in Voice Channel",
    usage: "!vunmute @user",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        // Owner Bypass & Perms
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Security Alert:** Access Denied. Mute permissions required.")], V2_RED)]
            });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid Target:** Specify a valid user to voice-unmute.")], V2_RED)]
            });
        }

        if (!target.voice.channel) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Action Failed:** The target is currently not in a voice channel.")], V2_RED)]
            });
        }

        try {
            await target.voice.setMute(false, `Unmuted by ${message.author.tag}`);

            const container = V2.container([
                V2.section([
                    V2.heading("🔊 VOICE SERVER UNMUTE", 2),
                    V2.text(`**Target:** ${target}\n**Channel:** ${target.voice.channel.name}\n**Status:** \`UNMUTED\``)
                ], target.user.displayAvatarURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`> **Authorized By:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security protocol*")
            ], V2_BLUE);

            message.reply({ content: null, flags: V2.flag, components: [container] });
        } catch (e) {
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Execution Failed:** Unable to unmute user. Validate bot's hierarchy and permissions.")], V2_RED)]
            });
        }
    }
};
