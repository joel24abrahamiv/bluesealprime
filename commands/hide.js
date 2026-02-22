const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");

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

            const { AttachmentBuilder } = require("discord.js");
            const hideIcon = new AttachmentBuilder("./assets/hide.png", { name: "hide.png" });

            const hideContainer = V2.container([
                V2.section(
                    [
                        V2.heading("🙈 VISIBILITY REVOKED", 2),
                        V2.text(`**Status:** Hidden from @everyone\n**Access:** Revoked`)
                    ],
                    "attachment://hide.png" // Use local attachment
                ),
                V2.separator(),
                V2.text(`**Authorized By:** ${message.author.tag}`)
            ], "#0099ff"); // Blue

            await message.channel.send({
                content: null,
                flags: V2.flag,
                files: [hideIcon], // Attach the file
                components: [hideContainer]
            });

        } catch (e) {
            console.error(e);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ SYSTEM ERROR", 2), V2.text("Missing Permissions or Hierarchy issue.")])], "#0099ff")]
            });
        }
    }
};
