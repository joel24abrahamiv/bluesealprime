const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "locksound",
    description: "Lock the soundboard in the current channel",
    usage: "!locksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    async execute(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { UseSoundboard: false, UseExternalSounds: false });
            await message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔇 **Soundboard Locked** in ${message.channel}.\nMembers can no longer play sounds in this channel.`)], V2_RED)] });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to lock soundboard. Check my permissions.")], V2_RED)] });
        }
    }
};
