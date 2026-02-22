const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "god_logs",
    description: "God Mode Logging Commands",
    aliases: ["elogs", "auditlogs", "elogsbot", "eloggings"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;
        const botAvatar = V2.botAvatar(message);

        // ELOGS: Audit Log Dump
        if (commandName === "elogs" || commandName === "auditlogs") {
            const logs = await message.guild.fetchAuditLogs({ limit: 10 }).catch(() => null);
            if (!logs) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **System Error:** Failed to fetch audit logs from the guild shard.")], V2_RED)]
            });

            const logEntries = logs.entries.map(e =>
                `> \`[${e.actionType}]\` **${e.executor.tag}** -> ${e.target ? e.target.tag || e.target.id : "Unknown"}`
            ).join("\n") || "> *No recent logs.*";

            const logContainer = V2.container([
                V2.section([
                    V2.heading("📜 SYSTEM AUDIT FEED", 2),
                    V2.text(`### **[ RECENT_OPERATIONS ]**\n\n${logEntries}`)
                ], botAvatar),
                V2.separator(),
                V2.text("*BlueSealPrime • Kernel Audit Mirror*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [logContainer] });
        }

        // ELOGSBOT: Internal Session Logs
        if (commandName === "elogsbot") {
            const botLogContainer = V2.container([
                V2.section([
                    V2.heading("📂 KERNEL LOG STREAM", 2),
                    V2.text("**Internal session memory is clear.**\n> *No critical runtime anomalies recorded.*")
                ], botAvatar)
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [botLogContainer] });
        }

        // ELOGGINGS: Setup logs wrapper
        if (commandName === "eloggings") {
            const logCmd = message.client.commands.get("log");
            if (logCmd) return logCmd.execute(message, args);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Module Fault:** Logging setup module not found.")], V2_RED)]
            });
        }
    }
};
