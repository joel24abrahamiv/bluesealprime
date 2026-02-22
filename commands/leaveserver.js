const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "leaveserver",
    description: "Make the bot leave the current server (Bot Owner only).",
    aliases: ["lv", "leave"],
    async execute(message) {
        if (message.author.id !== BOT_OWNER_ID) return;
        await message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text(`👋 **Departing from ${message.guild.name}...**\n> Node de-registered. Connection severed.`)], V2_BLUE)]
        });
        await message.guild.leave();
    }
};
