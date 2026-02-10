const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "ping",
  description: "Check the bot's latency and system status",
  aliases: ["p", "latency"],

  async execute(message) {
    const startTime = Date.now();

    const sent = await message.reply({ content: "🏓 Pinging..." });

    // Calculate Latency
    const endPing = Date.now() - startTime;
    const apiPing = message.client.ws.ping;

    await sent.edit({
      content: `\`\`\`📶 Pong! Bot: ${endPing}ms | API: ${apiPing}ms\`\`\``,
      embeds: []
    });
  }
};

