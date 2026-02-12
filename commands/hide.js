const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "hide",
    description: "Hides the current channel from @everyone",
    aliases: ["hidechannel", "lockview"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    async execute(message, args) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                ViewChannel: false
            });

            const embed = new EmbedBuilder()
                .setColor("#000000") // Black
                .setDescription(`🙈 **Channel Hidden**\n> Access revoked for @everyone.`);

            await message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("❌ Error: Missing Permissions or Hierarchy issue.");
        }
    }
};
