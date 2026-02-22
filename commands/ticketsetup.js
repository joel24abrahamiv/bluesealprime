const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "ticketsetup",
    description: "Deploy the Secure Ticket Panel",
    usage: "!ticketsetup",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission Check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🚫 ACCESS DENIED", 3),
                    V2.text("You require Administrator privileges to deploy this terminal.")
                ], V2_RED)]
            });
        }

        // Clean up command message
        message.delete().catch(() => { });

        // Create Select Menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🔹 Initiate Secure Connection")
            .addOptions([
                {
                    label: "General Support",
                    description: "Request assistance with server matters.",
                    emoji: "🎫",
                    value: "ticket_support"
                },
                {
                    label: "Incident Report",
                    description: "Report a rule violation or technical anomaly.",
                    emoji: "⚠️",
                    value: "ticket_report"
                },
                {
                    label: "Security Application",
                    description: "Apply to join the Sovereign Security Team.",
                    emoji: "🛡️",
                    value: "ticket_apply"
                }
            ]);

        // Wrap in ActionRow
        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Build V2 Container
        const container = V2.container([
            V2.section([
                V2.heading("🛡️ SOVEREIGN SUPPORT TERMINAL", 2),
                V2.text("**Authenticate to establish a private channel.**\n> Select an issue classification below to initiate a secure data line with active personnel.")
            ], message.guild.iconURL({ dynamic: true, size: 512 })),
            V2.separator(),
            V2.heading("📂 CLASSIFICATIONS", 3),
            V2.text("> 📩 **General Support**\n> ⚠️ **Incident Reports**\n> 🤝 **Security Applications**"),
            V2.text("\n\n*A staff member will arrive shortly after connection.*"),
            V2.separator(),
            row, // Embedded ActionRow
            V2.separator(),
            V2.text("*BlueSealPrime • Encrypted Support Protocol*")
        ], V2_BLUE);

        // Send Panel
        await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [container]
        });
    }
};

