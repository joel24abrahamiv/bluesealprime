const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "slowmode",
    description: "Set channel slowmode",
    usage: "!slowmode <seconds>",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const time = parseInt(args[0]);
        if (isNaN(time)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Please specify a time in seconds. Use `0` to disable.")], V2_RED)] });

        try {
            await message.channel.setRateLimitPerUser(time);
            const msg = time === 0
                ? "✅ **Slowmode disabled** for this channel."
                : `⏱️ **Slowmode set to ${time}s** — members must wait between messages.`;
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(msg)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Error setting slowmode. Check permissions.")], V2_RED)] });
        }
    }
};
