const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "ping",
  description: "Check the bot's latency and system status",
  aliases: ["p", "latency"],

  async execute(message) {
    const startTime = Date.now();

    const initialEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setDescription("📡 **ESTABLISHING SECURE CONNECTION...**")
      .setFooter({ text: "BlueSealPrime Internal Terminal v2.0" });

    const sent = await message.reply({ embeds: [initialEmbed] });

    const endPing = Date.now() - startTime;
    const apiPing = message.client.ws.ping;

    // Calculate Uptime
    const totalSeconds = process.uptime();
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const statusEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("📡 SYSTEM DIAGNOSTICS: LINK ESTABLISHED")
      .setDescription("`CRITICAL SYSTEMS: NOMINAL` - The link to the Discord Gateway is fully operational.")
      .addFields(
        {
          name: "📶 CONNECTION",
          value: `> **Round Trip:** \`${endPing}ms\`\n> **API Heartbeat:** \`${apiPing}ms\``,
          inline: false
        },
        {
          name: "💻 HOST STATUS",
          value: `> **Status:** \`ONLINE\`\n> **Uptime:** \`${uptimeStr}\``,
          inline: false
        }
      )
      .setThumbnail("https://cdn-icons-png.flaticon.com/512/3050/3050215.png")
      .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
      .setFooter({
        text: `BlueSealPrime Global Network • Internal Ping Verified`,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await sent.edit({ embeds: [statusEmbed] });
  }
};

