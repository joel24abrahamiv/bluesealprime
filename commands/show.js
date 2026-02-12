const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "show",
    description: "Unhides the current channel for @everyone",
    aliases: ["showchannel", "view", "unlockview"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    async execute(message, args) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                ViewChannel: true
            });

            const embed = new EmbedBuilder()
                .setColor("#000000") // Black
                .setDescription(`👀 **Channel Visible**\n> Access granted for @everyone.`);

            await message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("❌ Error: Missing Permissions or Hierarchy issue.");
        }
    }
};
