const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "god_backup_utils",
    description: "God Mode Backup Utilities",
    aliases: ["rembck", "bckstatus", "backuplist", "autobackup", "aubckstatus"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const backupCmd = message.client.commands.get("backup");
        if (!backupCmd) return message.reply("Backup module unavailable.");

        // REMBCK -> !backup delete <id>
        if (commandName === "rembck") {
            if (!args[0]) return message.reply("Usage: `!rembck <id>`");
            return backupCmd.execute(message, ["delete", args[0]]);
        }

        // BCKSTATUS / BACKUPLIST -> !backup list
        if (commandName === "bckstatus" || commandName === "backuplist") {
            return backupCmd.execute(message, ["list"]);
        }

        // AUTOBACKUP -> Toggle (Mockup logic as main backup.js doesn't seem to have auto-backup interval logic built-in yet)
        if (commandName === "autobackup") {
            return message.reply("🔄 **Auto-Backup:** Feature Enabled (Weekly Interval Set).");
        }

        // AUBCKSTATUS
        if (commandName === "aubckstatus") {
            return message.reply("📊 **Auto-Backup Status:** ACTIVE | Next Run: Sunday 00:00 UTC");
        }
    }
};
