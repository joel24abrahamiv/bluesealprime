const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlock",
    description: "Unlock the current channel for @everyone",
    usage: "!unlock [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const reason = args.join(" ") || "No reason provided";

        // Permission Check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** You need `Manage Channels` permission.")], V2_RED)]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **System Error:** I (Bot) need `Manage Channels` permission.")], V2_RED)]
            });
        }

        try {
            const everyoneRoleId = message.guild.id;

            // UNLOCK: Reset SendMessages for @everyone (null)
            await message.channel.permissionOverwrites.edit(everyoneRoleId, {
                SendMessages: null
            }, { reason: `Unlocked by ${message.author.tag}: ${reason}` });

            const container = V2.container([
                V2.section([
                    V2.heading("🔓 CHANNEL UNLOCKED", 2),
                    V2.text(`**Status:** Access Restored\n**Sector:** ${message.channel.name}\n**Reason:** ${reason}`)
                ], "https://i.ibb.co/j65q3X4/unlock-icon.png"), // User provided unlock icon
                V2.separator(),
                V2.text(`*BlueSealPrime Security Systems • ${new Date().toLocaleTimeString()}*`)
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Unlock Failed:** Check bot permissions hierarchy.")], V2_RED)]
            });
        }
    }
};
