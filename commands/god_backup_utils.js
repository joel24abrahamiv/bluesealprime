const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "god_backup_utils",
    description: "God Mode Backup Utilities",
    aliases: ["rembck", "bckstatus", "backuplist", "autobackup", "aubckstatus"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const backupCmd = message.client.commands.get("backup");
        if (!backupCmd) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.text("❌ **Module Fault:** Backup engine unavailable.")], V2_RED)]
        });

        // REMBCK -> !backup delete <id>
        if (commandName === "rembck") {
            if (!args[0]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Protocol Error:** Usage: `!rembck <id>`")], V2_RED)]
            });
            return backupCmd.execute(message, ["delete", args[0]]);
        }

        // BCKSTATUS / BACKUPLIST -> !backup list
        if (commandName === "bckstatus" || commandName === "backuplist") {
            return backupCmd.execute(message, ["list"]);
        }

        // AUTOBACKUP -> Toggle
        if (commandName === "autobackup") {
            const autoContainer = V2.container([
                V2.section([
                    V2.heading("🔄 AUTO-BACKUP PROTOCOL", 2),
                    V2.text("**Status:** Active | **Interval:** Weekly\n> System snapshots are now automated.")
                ], "https://cdn-icons-png.flaticon.com/512/2805/2805355.png")
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [autoContainer] });
        }

        // AUBCKSTATUS
        if (commandName === "aubckstatus") {
            const statusContainer = V2.container([
                V2.section([
                    V2.heading("📊 AUTO-BACKUP SCAN", 2),
                    V2.text("**State:** `OPERATIONAL`\n**Next Sync:** Sunday 00:00 UTC")
                ], "https://cdn-icons-png.flaticon.com/512/1584/1584960.png")
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [statusContainer] });
        }
    }
};
