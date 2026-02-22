const V2 = require("../utils/v2Utils");
const os = require("os");
const { version: djsversion } = require("discord.js");

module.exports = {
    name: "stats",
    description: "Detailed Bot & System Statistics using Components V2",
    aliases: ["botstats", "systeminfo", "status"],

    async execute(message) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const container = V2.container([
            V2.section(
                [
                    V2.heading("📊 SYSTEM DIAGNOSTICS", 2),
                    V2.text(`**Status:** 🟢 Online & Stable\n**Defense:** Maximum (Encrypted)\n\u200b`)
                ],
                message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
            ),
            V2.separator(),
            V2.heading("🚀 OPERATIONAL STATUS", 3),
            V2.text(`> **Uptime:** \`${uptimeString}\`\n> **Latency:** \`${message.client.ws.ping}ms\``),
            V2.separator(),
            V2.heading("🧠 RESOURCE ALLOCATION", 3),
            V2.text(`> **RAM Usage:** \`${memoryUsage} MB\` / \`${totalMemory} GB\`\n> **Platform:** \`${os.platform().toUpperCase()} (${os.arch()})\``),
            V2.separator(),
            V2.heading("🧩 BOT INTELLIGENCE", 3),
            V2.text(`> **Guilds:** \`${message.client.guilds.cache.size}\`\n> **Users:** \`${message.client.users.cache.size}\`\n> **Discord.js:** \`v${djsversion}\``)
        ], "#0099ff");

        message.reply({
            content: null,
            flags: V2.flag,
            components: [container]
        });
    }
};
