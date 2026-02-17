const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "setguildavatar",
    description: "Sets the bot's server-specific avatar.",
    usage: "!setguildavatar <URL> | [Attachment]",
    aliases: ["sgav", "serveravatar"],
    whitelistOnly: true,

    async execute(message, args) {
        // Authorization: Bot Owner or Server Owner
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Architect or Server Owner can modify my identity.");
        }

        let imageURL = message.attachments.first()?.url || args[0];

        if (!imageURL) {
            return message.reply("⚠️ **Missing Data:** Please provide an image URL or upload an attachment.");
        }

        const status = await message.reply("📡 **Accessing Identity Matrix...** Downloading visual data.");

        try {
            const response = await fetch(imageURL);
            if (!response.ok) throw new Error("Failed to fetch image.");

            const buffer = Buffer.from(await response.arrayBuffer());

            // Apply Server Avatar
            await message.guild.members.me.setAvatar(buffer);

            const successEmbed = new EmbedBuilder()
                .setColor("#00EEFF")
                .setTitle("🎭 IDENTITY REALIGNED")
                .setDescription(`My server-specific avatar has been updated successfully in **${message.guild.name}**.`)
                .setImage(imageURL)
                .setFooter({ text: "BlueSealPrime • Local Identity Management" })
                .setTimestamp();

            await status.edit({ content: null, embeds: [successEmbed] });

        } catch (err) {
            console.error(err);
            await status.edit("❌ **Update Failed:** Ensure the link is valid and I have the required Nitro/Server features to use per-guild avatars.");
        }
    }
};
