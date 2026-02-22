const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlockvc",
    description: "Unlock the voice channel you are currently in for @everyone",
    usage: "!unlockvc",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["uvc"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const V2 = require("../utils/v2Utils");

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 You do not have permission to use this command.")] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 I do not have permission to manage channels.")] });
        }

        const channel = message.member.voice.channel;
        if (!channel) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("⚠️ You must be in a voice channel to unlock it.")] });
        }

        try {
            // Unlock channel for @everyone (Connect: null)
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: null
            }, { reason: `Unlocked by ${message.author.tag}` });

            const unlockIcon = new AttachmentBuilder("./assets/unlock.png", { name: "unlock.png" });

            // Using global V2
            const container = V2.container([
                V2.section([
                    V2.heading("🔓 VOICE CHANNEL UNLOCKED", 2),
                    V2.text(`**Status:** \`UNLOCKED\`\n**Channel:** ${channel.name}\n**Target:** \`@everyone\`\n**Access:** \`Public Default\``)
                ], "https://i.ibb.co/j65q3X4/unlock-icon.png"), // User provided unlock icon
                V2.separator(),
                V2.heading("📂 DETAILS", 3),
                V2.text(`> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security Protocol*")
            ], V2_BLUE);

            await message.channel.send({ content: null, flags: V2.flag, files: [unlockIcon], components: [container] });

        } catch (err) {
            console.error(err);
            // Using global V2
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Failed to unlock the voice channel.**")], "#FF0000")]
            });
        }
    }
};
