const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "avatar",
  description: "Displays a user's avatar in high quality",

  async execute(message, args) {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    const user = member.user;

    const avatarURL = user.displayAvatarURL({
      dynamic: true,
      size: 1024
    });

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor({
        name: user.tag,
        iconURL: avatarURL
      })
      .setDescription(
        `🖼️ **Avatar Preview**\n\n` +
        `**User:** ${user.tag}\n` +
        `**User ID:** \`${user.id}\`\n` +
        `**Type:** ${avatarURL.endsWith(".gif") ? "Animated (GIF)" : "Static"}`
      )
      .setImage(avatarURL)
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
