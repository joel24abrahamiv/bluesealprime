const V2 = require("../utils/v2Utils");

module.exports = {
  name: "serverinfo",
  description: "Displays detailed information about this server",

  async execute(message) {
    const guild = message.guild;

    // Owner (Cache First)
    const ownerId = guild.ownerId;
    const ownerMember = await guild.fetchOwner().catch(() => null);
    const ownerUser = ownerMember ? ownerMember.user : await message.client.users.fetch(ownerId).catch(() => null);
    const ownerTag = ownerUser ? ownerUser.tag : "Unknown#0000";

    // Members
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;

    // Channels
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;

    // Boosts
    const boostCount = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier;

    // Timestamps
    const createdFull = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
    const createdRelative = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    message.reply({
      content: null,
      flags: V2.flag,
      components: [
        V2.container([
          V2.section(
            [
              V2.heading(`📊 ${guild.name.toUpperCase()}`, 2),
              V2.text(`**ID:** \`${guild.id}\`\n**Created:** ${createdFull}`)
            ],
            guild.iconURL({ forceStatic: true, extension: 'png' }) || "https://cdn.discordapp.com/embed/avatars/0.png"
          ),
          V2.section([V2.text("🛡️ **System Protection:** Active")], V2.botAvatar(message)),
          V2.separator(),
          V2.heading("👑 TOP AUTHORITY", 3),
          V2.text(`> **Owner:** ${ownerTag}\n> **ID:** \`${ownerId}\``),
          V2.separator(),
          V2.heading("👥 POPULATION", 3),
          V2.text(`> **Total:** \`${totalMembers}\`\n> **Humans:** \`${humans}\`\n> **Bots:** \`${bots}\``),
          V2.separator(),
          V2.heading("💬 INFRASTRUCTURE", 3),
          V2.text(`> **Text Channels:** \`${textChannels}\`\n> **Voice Channels:** \`${voiceChannels}\`\n> **Total:** \`${textChannels + voiceChannels}\``),
          V2.separator(),
          V2.heading("🚀 BOOST STATUS", 3),
          V2.text(`> **Level:** \`${boostLevel}\`\n> **Count:** \`${boostCount}\``),
          V2.separator(),
          V2.text(`*Requested by ${message.author.tag}*`)
        ], "#0099ff")
      ]
    });
  }
};
