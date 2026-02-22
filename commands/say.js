const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "say",
    description: "Broadcast a message using the premium V2 interface",
    usage: "!say <message> OR !say <Title> | <Description> | <Color>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("🚫 PERMISSION DENIED", 2), V2.text("I do not have permission to manage messages.")])], V2_RED)]
            });
        }

        if (args.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ MISSING CONTENT", 2), V2.text("**Usage:**\n`!say Hello`\n`!say Title | Description | Color`")])], V2_RED)]
            });
        }

        // Delete user message to make it look like bot is speaking
        message.delete().catch(() => { });

        const rawContent = args.join(" ");

        // Check for pipe | splitting for Advanced Mode
        if (rawContent.includes("|")) {
            const parts = rawContent.split("|").map(p => p.trim());
            const title = parts[0];
            const desc = parts[1];
            const color = parts[2] || V2_BLUE; // Default Blue if not provided

            const announcementContainer = V2.container([
                V2.section(
                    [
                        V2.heading(title, 2),
                        V2.text(desc)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/1246/1246358.png" // Megaphone
                ),
                V2.separator(),
                V2.text(`**Broadcast by:** ${message.author.tag}`)
            ], color); // Keep user color if provided, else default

            return message.channel.send({
                content: null,
                flags: V2.flag,
                components: [announcementContainer]
            });
        } else {
            // Simple Text Mode
            const simpleContainer = V2.container([
                V2.section(
                    [
                        V2.heading("📢 ANNOUNCEMENT", 2),
                        V2.text(rawContent)
                    ]
                ),
                V2.separator(),
                V2.text(`**Broadcast by:** ${message.author.tag}`)
            ], V2_BLUE);

            return message.channel.send({
                content: null,
                flags: V2.flag,
                components: [simpleContainer]
            });
        }
    }
};
