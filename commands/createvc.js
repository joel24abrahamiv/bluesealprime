const { ChannelType, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "createvc",
    description: "Creates a new voice channel",
    aliases: ["mkvc"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    async execute(message, args) {
        if (!args[0]) return message.reply("⚠️ Usage: `!createvc <name>`");

        try {
            const name = args.join(" ");
            const vc = await message.guild.channels.create({
                name: name,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{ id: message.guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel] }]
            });

            const embed = new EmbedBuilder()
                .setColor("#000000") // Black
                .setDescription(`🔊 **Voice Channel Created**\n> Name: \`${vc.name}\`\n> ID: \`${vc.id}\``);

            await message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("❌ Error: Missing Permissions or Hierarchy issue.");
        }
    }
};
