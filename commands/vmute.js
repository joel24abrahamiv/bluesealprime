const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR, V2_RED, V2_BLUE } = require("../config");

module.exports = {
    name: "vmute",
    description: "Server mute a member in Voice Channel",
    usage: "!vmute @user [reason]",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");

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
                components: [V2.container([V2.text("⚠️ **Invalid Target:** Specify a valid user to voice-mute.")], V2_RED)]
            });
        }

        if (!target.voice.channel) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Action Failed:** The target is currently not in a voice channel.")], V2_RED)]
            });
        }

        // Immunity 
        if (target.id === BOT_OWNER_ID) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [
                    V2.container([
                        V2.section(
                            [
                                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                                V2.text("Did you seriously just try to voice-mute the **Architect** of this system?")
                            ],
                            target.user.displayAvatarURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text(`> You have no power here, ${message.author}. Know your place.`),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Sovereign Protection*")
                    ], "#FF0000") // Brutal Red
                ]
            });
        }

        try {
            const reason = args.slice(1).join(" ") || "No reason provided.";
            await target.voice.setMute(true, reason);

            const container = V2.container([
                V2.section([
                    V2.heading("🔇 SECURE MUTE ENFORCED", 2),
                    V2.text(`**Target:** ${target}\n**Channel:** ${target.voice.channel.name}\n**Status:** \`VOICE MUTED\``)
                ], target.user.displayAvatarURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.heading("📋 INCIDENT LOG", 3),
                V2.text(`> **Reason:** \`${reason}\`\n> **Enforcer:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security protocol*")
            ], V2_BLUE);

            message.reply({ content: null, flags: V2.flag, components: [container] });

        } catch (e) {
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Execution Failed:** Unable to mute user. Validate bot's hierarchy and permissions.")], V2_RED)]
            });
        }
    }
};
