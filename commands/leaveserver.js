const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "leaveserver",
    description: "Make the bot leave the current server (Bot Owner only).",
    aliases: ["lv", "leave"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        await message.reply("👋 Leaving the server as requested...");
        await message.guild.leave();
    },
};
