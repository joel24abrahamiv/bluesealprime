const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "say",
    description: "Make the bot say something (Embed or Text)",
    usage: "!say <message> OR !say <Title> | <Description> | <Color>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to manage messages.")] });
        }

        if (args.length === 0) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing Content.**\nUsage: `!say Hello` or `!say Title | Description`")] });
        }

        // Delete user message to make it look like bot is speaking
        message.delete().catch(() => { });

        const rawContent = args.join(" ");

        // Check for pipe | splitting for Embed Mode
        if (rawContent.includes("|")) {
            const parts = rawContent.split("|").map(p => p.trim());
            const title = parts[0];
            const desc = parts[1];
            const color = parts[2] || require("../config").EMBED_COLOR;

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(desc)
                .setFooter({ text: `Message by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        } else {
            // Simple Text Mode (or simple embed?)
            // Let's make it a simple embed for aesthetics, or raw text?
            // "Make the reply more good" suggests Embeds.
            const embed = new EmbedBuilder()
                .setColor(require("../config").EMBED_COLOR) // Default Blue
                .setDescription(rawContent)
                .setFooter({ text: `Message by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            return message.channel.send({ embeds: [embed] });
        }
    }
};
