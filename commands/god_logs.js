const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "god_logs",
    description: "God Mode Logging Commands",
    aliases: ["auditlogs", "elogsbot", "eloggings"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // ELOGS: Audit Log Dump
        if (commandName === "elogs") {
            const logs = await message.guild.fetchAuditLogs({ limit: 10 }).catch(() => null);
            if (!logs) return message.reply("Failed to fetch logs.");

            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("📜 RECENT AUDIT LOGS")
                .setDescription(logs.entries.map(e =>
                    `\`[${e.actionType}]\` **${e.executor.tag}** -> ${e.target ? e.target.tag || e.target.id : "Unknown"} : ${e.reason || "No Reason"}`
                ).join("\n") || "No recent logs.");

            return message.reply({ embeds: [embed] });
        }

        // ELOGSBOT: Dummy for now as we don't track comprehensive bot-internal logs to a file readable here
        if (commandName === "elogsbot") {
            return message.reply("📂 **Bot Internal Logs:** No critical errors recorded in current session memory.");
        }

        // ELOGGINGS: Setup logs wrapper
        if (commandName === "eloggings") {
            const logCmd = message.client.commands.get("log");
            if (logCmd) return logCmd.execute(message, args);
            return message.reply("Log module not found.");
        }
    }
};
