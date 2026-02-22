const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "lock",
    description: "Lock the current channel for @everyone",
    usage: "!lock [reason]",
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

            // LOCK: Deny SendMessages for @everyone
            await message.channel.permissionOverwrites.edit(everyoneRoleId, {
                SendMessages: false
            }, { reason: `Locked by ${message.author.tag}: ${reason}` });

            // OPTIONAL: Ensure Owner can still talk (Explicit Allow)
            if (isBotOwner) {
                await message.channel.permissionOverwrites.edit(message.author.id, {
                    SendMessages: true
                });
            }

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🔒 CHANNEL LOCKED", 2),
                        V2.text(`**Status:** Lockdown Active\n**Sector:** ${message.channel.name}\n**Reason:** ${reason}`)
                    ],
                    "https://i.ibb.co/3ykjL78Y/lock-icon.png" // User provided lock icon
                ),
                V2.separator(),
                V2.text(`*BlueSealPrime Security Systems • ${new Date().toLocaleTimeString()}*`)
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Lock Failed:** Check bot permissions hierarchy.")], V2_RED)]
            });
        }
    }
};
