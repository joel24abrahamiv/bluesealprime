const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");

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

            const { AttachmentBuilder } = require("discord.js");
            const showIcon = new AttachmentBuilder("./assets/show.png", { name: "show.png" });

            // Using global V2
            const container = V2.container([
                V2.section([
                    V2.heading("👀 CHANNEL VISIBLE", 2),
                    V2.text(`** Status:** \`VISIBLE\`\n**Target:** \`@everyone\`\n**Access:** \`Public Access Restored\``)
                ], "attachment://show.png"), // Premium Blue Eye
                V2.separator(),
                V2.text(`> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Visibility Protocol*")
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, files: [showIcon], components: [container] });

        } catch (e) {
            console.error(e);
            // Using global V2
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Error: Missing Permissions or Hierarchy issue.**")], "#FF0000")]
            });
        }
    }
};
