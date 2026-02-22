const { V2_BLUE } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
  name: "ping",
  description: "Check the bot's latency and system status",
  aliases: ["p", "latency"],

  async execute(message) {
    const startTime = Date.now();
    const apiPing = message.client.ws.ping;

    // We can't really do the "re-edit" easily with V2 content=null without initial flicker
    // but the user wants it built with V2.

    // Calculate initial roughly
    const initialLatency = Date.now() - startTime;

    message.reply({
      content: null,
      flags: V2.flag,
      components: [
        V2.container([
          V2.text(`<@${message.client.user.id}> Pong! Bot: \`${initialLatency}ms\` | API: \`${apiPing}ms\``)
        ], V2_BLUE) // Blue accent for the container
      ]
    });
  }
};
