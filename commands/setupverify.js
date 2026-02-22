const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "setupverify",
    description: "Setup the premium verification panel",
    usage: "!setupverify #channel @role",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== BOT_OWNER_ID) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!channel || !role)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!setupverify #channel @role`")], V2_RED)] });

        // ───── PREMIUM DESIGN CONSTRUCTION ─────
        // (1) ActionRowBuilder for the Verify Button
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_${role.id}`)
                .setLabel("✅ Verify Membership")
                .setStyle(ButtonStyle.Success)
        );

        // (2) Builder Ensemble: Container, Section, Heading, Text, Separator, Thumbnail
        const verifyPanel = V2.container([
            // Header Section with Thumbnail
            V2.section([
                V2.heading("🛡️ SOVEREIGN GATEWAY", 1),
                V2.text("Biometric & Identity Authentication Required")
            ], V2.thumbnail(message.guild.iconURL({ dynamic: true, size: 512 }) || V2.botAvatar(message))),

            V2.separator(),

            // Info Section
            V2.text("To access the restricted sectors of this dominion, you must verify your identity. This process ensures the integrity and security of the Sovereign network.\n\n> **Authorized Access Only**"),

            V2.separator(),

            // Guidelines Section
            V2.section([
                V2.text("**Identity Registry:** You will be granted the role: " + role.name),
                V2.text("**Security Protocol:** By verifying, you commit to honoring all Imperial Statutes.")
            ]),

            // Final Action Row (7th Builder usage)
            row
        ], V2_BLUE);

        try {
            await channel.send({
                flags: V2.flag,
                components: [verifyPanel]
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(`💎 **Sovereign Gateway synchronized with ${channel}.**\nRegistry Role: ${role}`)], V2_BLUE)]
            });
        } catch (e) {
            console.error("SetupVerify Error:", e);
            return message.reply({ content: "❌ Failed to send panel. Ensure the bot has permissions in that channel." });
        }
    }
};
