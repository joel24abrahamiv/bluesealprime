const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "setupverify",
    description: "Setup the verification panel (button-based)",
    usage: "!setupverify #channel @role",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== BOT_OWNER_ID) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!channel || !role)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!setupverify #channel @role`")], V2_RED)] });

        // The verification panel itself uses a regular message + button (works without V2 flag for public panels)
        const panelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_${role.id}`)
                .setLabel("✅  Verify Me")
                .setStyle(ButtonStyle.Success)
        );

        await channel.send({
            flags: V2.flag,
            components: [
                V2.container([
                    V2.section([
                        V2.heading("🛡️ SERVER VERIFICATION", 1),
                        V2.text("Click the button below to verify yourself and gain full access to the server.\n\n> *By verifying, you agree to follow all server rules.*")
                    ], message.guild.iconURL({ dynamic: true }) || V2.botAvatar(message)),
                    V2.separator(),
                    panelRow
                ], V2_BLUE)
            ]
        });

        return message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text(`✅ **Verification panel sent to ${channel}.**\n> Role to grant: ${role}`)], V2_BLUE)]
        });
    }
};
