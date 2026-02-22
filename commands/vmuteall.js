const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

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

        const V2 = require("../utils/v2Utils");
        const statusMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔇 MASS VOICE MUTE", 3),
                V2.text(`Processing **${members.size}** members in **${channel.name}**...`)
            ], V2_BLUE)]
        });

        // TURBO MASS MUTE (PARALLEL)
        const muteTasks = members.map(member =>
            member.voice.setMute(true, "Mass Mute Protocol").catch(() => { })
        );

        await Promise.allSettled(Array.from(muteTasks.values()));

        const { AttachmentBuilder } = require("discord.js");
        const muteIcon = new AttachmentBuilder("./assets/vmute.png", { name: "vmute.png" });

        await statusMsg.edit({
            content: null,
            flags: V2.flag,
            files: [muteIcon],
            components: [V2.container([
                V2.section([
                    V2.heading("✅ MASS MUTE COMPLETE", 2),
                    V2.text(`**Channel:** ${channel.name}\n**Total Muted:** \`${members.size}\` members`)
                ], "attachment://vmute.png"), // Premium Blue Mute
                V2.separator(),
                V2.text(`> **Actioned By:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Sovereign Voice Control*")
            ], V2_BLUE)]
        });
    }
};
