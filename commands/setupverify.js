const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "setupverify",
    description: "Setup verification system",
    usage: "!setupverify <channel> <role_id>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== BOT_OWNER_ID) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const role = message.guild.roles.cache.get(args[1]); // ID only for safety

        if (!channel || !role) return message.reply("Usage: `!setupverify #channel <role_id>`");

        const embed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle("🛡️ Server Verification")
            .setDescription("Click the button below to verify yourself and gain access to the server.")
            .setFooter({ text: "BlueSealPrime Security" })
            .setThumbnail(message.guild.iconURL());

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`verify_${role.id}`)
                    .setLabel("Verify Me")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("✅")
            );

        await channel.send({ embeds: [embed], components: [row] });
        message.reply("✅ Verification panel sent!");
    }
};
