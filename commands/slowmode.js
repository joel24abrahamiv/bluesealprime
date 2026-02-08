const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "slowmode",
    description: "Set channel slowmode",
    usage: "!slowmode <seconds>",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const time = parseInt(args[0]);
        if (isNaN(time)) return message.reply("⚠️ Specify seconds (0 to disable).");

        try {
            await message.channel.setRateLimitPerUser(time);
            message.reply(`⏱️ Slowmode set to **${time}s**.`);
        } catch (e) {
            message.reply("❌ Error setting slowmode.");
        }
    }
};
