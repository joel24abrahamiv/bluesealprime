const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "serverinfo",
  description: "Displays detailed information about this server",

  async execute(message) {
    const guild = message.guild;

    // Owner
    const owner = await guild.fetchOwner();

    // Members
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;

    // Channels
    const textChannels = guild.channels.cache.filter(
      c => c.type === 0
    ).size;
    const voiceChannels = guild.channels.cache.filter(
      c => c.type === 2
    ).size;

    // Boosts
    const boostCount = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier;

    // Timestamps
    const createdFull = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
    const createdRelative = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor({
        name: `${guild.name} • Server Overview`,
        iconURL: guild.iconURL({ dynamic: true })
      })
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setDescription(
        `**Server Name**\n${guild.name}\n\n` +
        `**Server ID**\n\`${guild.id}\``
      )

      // Spacer
      .addFields({ name: "\u200b", value: "\u200b" })

      // Core Info
      .addFields({
        name: "🧩 CORE INFORMATION",
        value:
          `**Owner**\n${owner.user.tag}\n\n` +
          `**Created On**\n${createdFull}\n` +
          `(${createdRelative})`,
        inline: false
      })

      // Spacer
      .addFields({ name: "\u200b", value: "\u200b" })

      // Members
      .addFields({
        name: "👥 MEMBERS",
        value:
          `**Total Members**\n${totalMembers}\n\n` +
          `**Humans**\n${humans}\n\n` +
          `**Bots**\n${bots}`,
        inline: false
      })

      // Spacer
      .addFields({ name: "\u200b", value: "\u200b" })

      // Channels
      .addFields({
        name: "💬 CHANNELS",
        value:
          `**Text Channels**\n${textChannels}\n\n` +
          `**Voice Channels**\n${voiceChannels}`,
        inline: false
      })

      // Spacer
      .addFields({ name: "\u200b", value: "\u200b" })

      // Boosts
      .addFields({
        name: "🚀 SERVER BOOSTS",
        value:
          `**Boost Level**\nLevel ${boostLevel}\n\n` +
          `**Boost Count**\n${boostCount}`,
        inline: false
      })

      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
