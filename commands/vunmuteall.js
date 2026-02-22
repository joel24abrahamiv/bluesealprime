const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

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

        const V2 = require("../utils/v2Utils");
        const statusMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔊 MASS VOICE UNMUTE", 3),
                V2.text(`Processing **${members.size}** members in **${channel.name}**...`)
            ], V2_BLUE)]
        });

        // TURBO MASS UNMUTE (PARALLEL)
        const unmuteTasks = members.map(member =>
            member.voice.setMute(false, "Mass Unmute Protocol").catch(() => { })
        );

        await Promise.allSettled(Array.from(unmuteTasks.values()));

        const { AttachmentBuilder } = require("discord.js");
        const unmuteIcon = new AttachmentBuilder("./assets/vunmute.png", { name: "vunmute.png" });

        await statusMsg.edit({
            content: null,
            flags: V2.flag,
            files: [unmuteIcon],
            components: [V2.container([
                V2.section([
                    V2.heading("✅ MASS UNMUTE COMPLETE", 2),
                    V2.text(`**Channel:** ${channel.name}\n**Total Unmuted:** \`${members.size}\` members`)
                ], "attachment://vunmute.png"), // Premium Blue Unmute
                V2.separator(),
                V2.text(`> **Actioned By:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Sovereign Voice Control*")
            ], V2_BLUE)]
        });
    }
};
