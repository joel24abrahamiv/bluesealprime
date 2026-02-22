const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlocksound",
    description: "Unlock the soundboard in the current channel",
    usage: "!unlocksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    async execute(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { UseSoundboard: true, UseExternalSounds: true });
            await message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔊 **Soundboard Unlocked** in ${message.channel}.\nMembers can now play sounds again.`)], V2_BLUE)] });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to unlock soundboard. Check my permissions.")], V2_RED)] });
        }
    }
};
