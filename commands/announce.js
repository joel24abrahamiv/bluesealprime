const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "announce",
    description: "Make an official server announcement",
    usage: "!announce <message>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("🚫 PERMISSION DENIED", 3), V2.text("I do not have permission to manage messages.")], "#0099ff")]
            });
        }

        if (args.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING CONTENT", 3), V2.text("Usage: `!announce <message>`")], "#0099ff")]
            });
        }

        // Delete command message
        message.delete().catch(() => { });

        const announcement = args.join(" ");

        const container = V2.container([
            V2.section([
                V2.heading("📢 SYSTEM WIDE BROADCAST", 2),
                V2.text("**Incoming Transmission:**")
            ], V2.botAvatar(message)), // Bot PFP as requested
            V2.separator(),
            V2.text("```fix\n" + announcement + "\n```"), // Keep fix block for color
            V2.separator(),
            V2.heading("ℹ️ TRANSMISSION DATA", 3),
            V2.text(`> **Origin:** \`${message.author.tag}\`\n> **Priority:** \`CRITICAL / HIGH\`\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:R>`),
            V2.separator(),
            V2.text(`*BlueSealPrime Global Systems • Verification: 0x${Math.floor(Math.random() * 10000).toString(16).toUpperCase()}*`)
        ], V2_BLUE); // Blue as requested

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }
};
