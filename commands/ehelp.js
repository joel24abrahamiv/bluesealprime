const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "ehelp",
    description: "Shows God-Mode (Eval) commands",
    aliases: ["eh"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const embed = new EmbedBuilder()
            .setColor("#000000") // Black
            .setTitle("GOD-MODE COMMANDS (EVAL)")
            .setDescription(
                `• **eram** - View hosting and system details\n` +
                `• **estats** - View bot statistics and performance\n` +
                `• **eusers** - Show server count and user statistics\n` +
                `• **elogs** - Show current server audit logs\n` +
                `• **eloggings <channel_id>** - Setup logging channel\n` +
                `• **elogsbot** - Show all bot logs across all servers\n` +
                `• **enuke <server_id> <custom name>** - Nuke a specific server\n` +
                `• **edelnuke <server_id>** - Delete ALL channels in server\n` +
                `• **eannoc <message_id>** - Global announcement\n` +
                `• **eval** - Toggle eval mode\n` +
                `• **eexit** - Exit eval mode\n` +
                `• **scanserver** - Scan server for security issues\n` +
                `• **purgebots** - Remove all unauthorized bots\n` +
                `• **flagged** - Show flagged users/bots\n` +
                `• **createabaseline** - Create server protection baseline\n` +
                `• **recovery** - Start server recovery process\n` +
                `• **backup** - Create server backup\n` +
                `• **rembck <backup_id>** - Remove server backup\n` +
                `• **restore <backup_id>** - Restore server from backup\n` +
                `• **bckstatus** - View backup status & IDs\n` +
                `• **backuplist** - List all global backups (Owner only)\n` +
                `• **autobackup enable/disable** - Weekly auto-backup\n` +
                `• **aubckstatus** - Check auto-backup status`
            )
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
