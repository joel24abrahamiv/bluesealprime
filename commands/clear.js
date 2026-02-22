const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "clear",
    description: "Bulk delete messages",
    aliases: ["purge"],
    usage: "!clear <amount>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Amount must be between **1** and **100**.")], V2_RED)] });

        try {
            await message.channel.bulkDelete(amount, true);
            const msg = await message.channel.send({ flags: V2.flag, components: [V2.container([V2.text(`🧹 Cleared **${amount}** messages.`)], V2_BLUE)] });
            setTimeout(() => msg.delete().catch(() => { }), 3000);
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to clear messages. Messages may be older than 14 days.")], V2_RED)] });
        }
    }
};
