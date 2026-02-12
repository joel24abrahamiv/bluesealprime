const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "mute",
    description: "Timeout a user (Alias for timeout)",
    usage: "!mute @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    execute(message, args) {
        // Redirect to timeout logic or just re-implement simple version
        // Let's alias it to 'timeout' behavior but simpler
        // Actually, best to just say "Use !timeout" or invoke it.
        // I'll invoke timeout command if lazy, but cleaner to write simple code.
        const cmd = message.client.commands.get("timeout");
        if (cmd) {
            // Inject default duration if missing? "mute" usually implies indefinite, but timeout requires duration.
            // Let's default to 1 hour if not specified? 
            // The timeout command requires duration. 
            // args: [user, duration, reason]
            // If user types !mute @user reason... args[1] is reason. Timeout expects args[1] as duration.
            // So we inject "1h" as arg[1] if missing.

            // Re-parsing args for aliases is tricky. 
            // I'll just write a quick wrapper.
            const newArgs = [args[0], "1h", ...args.slice(1)]; // Default 1h
            cmd.execute(message, newArgs);
        }
    }
};
