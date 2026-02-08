const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "userinfo",
  description: "Shows a detailed and spacious user profile",

  async execute(message, args) {
    if (!message.mentions.members.first() && !args[0]) {
      return message.reply(
        "❌ **No user mentioned.**\nUsage: `!userinfo @user`"
      );
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) return message.reply("❌ User not found.");

    const user = member.user;

    const statusMap = {
      online: "🟢 Online",
      idle: "🌙 Idle",
      dnd: "⛔ Do Not Disturb",
      offline: "⚫ Offline"
    };

    const status =
      member.presence?.status
        ? statusMap[member.presence.status]
        : "⚫ Offline";

    const memberType =
      message.guild.ownerId === user.id
        ? "👑 Server Owner"
        : member.permissions.has("Administrator")
          ? "🛡 Administrator"
          : "👤 Member";

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position);

    const roleList =
      roles.map(r => r.toString()).join("  ") || "None";

    const createdFull = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
    const createdRelative = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedFull = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;
    const joinedRelative = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor({
        name: `${user.username} • Member Overview`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        `**${user.tag}**\n${status}\n\n` +
        `**User ID**\n\`${user.id}\``
      )

      .addFields({ name: "\u200b", value: "\u200b" })

      .addFields({
        name: "🧩 CORE INFORMATION",
        value:
          `**Member Type**\n${memberType}\n\n` +
          `**Account Age**\n${createdRelative}\n\n` +
          `**Server Member Since**\n${joinedRelative}\n\n` +
          `**Total Roles**\n${roles.size}`,
        inline: false
      })

      .addFields({ name: "\u200b", value: "\u200b" })

      .addFields({
        name: "🕒 TIMELINE",
        value:
          `**Account Created**\n${createdFull}\n\n` +
          `**Joined Server**\n${joinedFull}`,
        inline: false
      })

      .addFields({ name: "\u200b", value: "\u200b" })

      .addFields({
        name: `🎭 ROLES (${roles.size})`,
        value:
          roleList.length > 1024
            ? "Too many roles to display"
            : roleList,
        inline: false
      })

      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
