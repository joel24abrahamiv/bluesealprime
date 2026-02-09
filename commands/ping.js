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

    // Calculate Latency
    const endPing = Date.now() - startTime;
    const apiPing = message.client.ws.ping;

    await sent.edit({
      content: `🟦 📶 <@${message.author.id}> **Pong! Bot: ${endPing}ms | API: ${apiPing}ms**`,
      embeds: []
    });
  }
};

