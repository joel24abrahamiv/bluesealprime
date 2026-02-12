const { PermissionsBitField } = require("discord.js");
module.exports = {
    name: "unmute",
    description: "Remove timeout",
    usage: "!unmute @user",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    execute(message, args) {
        const cmd = message.client.commands.get("timeout");
        // Timeout can't really "untimeout" easily unless we pass 0 duration?
        // Timeout 0 removes it? No, null.
        // Let's just do it here.

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        target.timeout(null, "Unmute command").then(() => message.reply("🔊 User unmuted.")).catch(() => message.reply("❌ Error."));
    }
};
