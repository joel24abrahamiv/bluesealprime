const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "lockvc",
    description: "Lock the voice channel you are currently in for @everyone",
    usage: "!lockvc [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["lvc"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const reason = args.join(" ") || "No reason provided";
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
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("⚠️ You must be in a voice channel to lock it.")] });
        }

        try {
            // Lock channel for @everyone (Connect: false)
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: false
            }, { reason: `Locked by ${message.author.tag}: ${reason}` });

            const lockIcon = new AttachmentBuilder("./assets/lock.png", { name: "lock.png" });

            // Using global V2
            const container = V2.container([
                V2.section([
                    V2.heading("🔒 VOICE CHANNEL LOCKDOWN", 2),
                    V2.text(`**Status:** \`LOCKED\`\n**Channel:** ${channel.name}\n**Target:** \`@everyone\`\n**Access:** \`Staff Only\``)
                ], "https://i.ibb.co/3ykjL78Y/lock-icon.png"), // User provided lock icon
                V2.separator(),
                V2.heading("📂 DETAILS", 3),
                V2.text(`> **Reason:** ${reason}\n> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security Protocol*")
            ], V2_BLUE);

            await message.channel.send({ content: null, flags: V2.flag, files: [lockIcon], components: [container] });

        } catch (err) {
            console.error(err);
            // Using global V2
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Failed to lock the voice channel.**")], "#FF0000")]
            });
        }
    }
};
