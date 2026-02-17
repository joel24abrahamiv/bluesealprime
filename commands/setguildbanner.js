const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "setguildbanner",
    description: "Sets the server's banner image.",
    usage: "!setguildbanner <URL> | [Attachment]",
    aliases: ["sgbn", "serverbanner"],
    whitelistOnly: true,

    async execute(message, args) {
        // Authorization: Bot Owner or Server Owner
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Architect or Server Owner can modify the server's visual identity.");
        }

        // Permission Check: Manage Server (Required for banner)
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply("⚠️ **Permission Error:** I need the `Manage Server` permission to update the banner.");
        }

        // Check if server has enough boosts
        if (!message.guild.features.includes("BANNER")) {
            return message.reply("❌ **Feature Unavailable:** This server does not have the required Level 2/3 Boost status to set a banner.");
        }

        let imageURL = message.attachments.first()?.url || args[0];

        if (!imageURL) {
            return message.reply("⚠️ **Missing Data:** Please provide an image URL or upload an attachment.");
        }

        const status = await message.reply("📡 **Accessing Visual Matrix...** Downloading banner data.");

        try {
            const response = await fetch(imageURL);
            if (!response.ok) throw new Error("Failed to fetch image.");

            const buffer = Buffer.from(await response.arrayBuffer());

            // Apply Server Banner
            await message.guild.setBanner(buffer, "Sovereign Identity Update");

            const successEmbed = new EmbedBuilder()
                .setColor("#00EEFF")
                .setTitle("🖼️ SERVER BANNER UPDATED")
                .setDescription(`The banner for **${message.guild.name}** has been successfully realigned.`)
                .setImage(imageURL)
                .setFooter({ text: "BlueSealPrime • Structural Aesthetics" })
                .setTimestamp();

            await status.edit({ content: null, embeds: [successEmbed] });

        } catch (err) {
            console.error(err);
            await status.edit("❌ **Update Failed:** Ensure the link is valid and the image is in a supported format (PNG/JPG/GIF).");
        }
    }
};
