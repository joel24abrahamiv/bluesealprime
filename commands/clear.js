const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "clear",
    description: "Delete messages",
    aliases: ["purge"],
    usage: "!clear <amount>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("⚠️ Amount must be 1-100.");

        try {
            await message.channel.bulkDelete(amount, true);
            const msg = await message.channel.send(`🧹 Cleared **${amount}** messages.`);
            setTimeout(() => msg.delete().catch(() => { }), 5);
        } catch (e) {
            message.reply("❌ Error clearing messages (Too old?).");
        }
    }
};
