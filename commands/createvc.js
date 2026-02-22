const { ChannelType, PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createvc",
    description: "Creates a new voice channel",
    usage: "!createvc <name>",
    aliases: ["mkvc"],
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);
        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Usage:** `!createvc <name>`")], V2_RED)]
            });
        }

        try {
            const name = args.join(" ");
            const vc = await message.guild.channels.create({
                name,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{ id: message.guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel] }]
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🔊 VOICE CHANNEL DEPLOYED", 2),
                        V2.text(`**\`${vc.name}\`** is now live.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **ID:** \`${vc.id}\`\n> **Created by:** ${message.author}`)
                ], V2_BLUE)]
            });
        } catch (e) {
            console.error(e);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Error:** Missing Permissions or Hierarchy issue.")], V2_RED)]
            });
        }
    }
};
