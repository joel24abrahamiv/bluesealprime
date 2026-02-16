const { EmbedBuilder, version: djsversion } = require("discord.js");
const os = require("os");

module.exports = {
    name: "stats",
    description: "Detailed Bot & System Statistics",
    usage: "!stats",
    aliases: ["botstats", "systeminfo", "status"],

    async execute(message) {
        // Calculation: Uptime
        let totalSeconds = (message.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Calculation: Memory
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const statsEmbed = new EmbedBuilder()
            .setColor("#00EEFF")
            .setTitle("📊 BLUESEALPRIME CORE METRICS")
            .setAuthor({ name: "SYSTEM DIAGNOSTICS", iconURL: message.client.user.displayAvatarURL() })
            .setThumbnail(message.client.user.displayAvatarURL())
            .setDescription(
                `### **[ OPERATIONAL_STATUS ]**\n` +
                `> 🟢 **System:** Online & Stable\n` +
                `> 🛡️ **Defense Level:** Maximum (Encrypted)\n` +
                `> 🚀 **Uptime:** \`${uptimeString}\`\n` +
                `> ⚡ **Latency:** \`${message.client.ws.ping}ms\`\n\n` +
                `### **[ RESOURCE_ALLOCATION ]**\n` +
                `> 🧠 **Memory Usage:** \`${memoryUsage} MB\` / \`${totalMemory} GB\`\n` +
                `> 🧩 **Process ID:** \`${process.pid}\`\n` +
                `> 💻 **Platform:** \`${os.platform().toUpperCase()} (${os.arch()})\`\n\n` +
                `### **[ BOT_INTELLIGENCE ]**\n` +
                `> 📂 **Total Guilds:** \`${message.client.guilds.cache.size}\`\n` +
                `> 👥 **Total Users:** \`${message.client.users.cache.size}\`\n` +
                `> 🛠️ **Library:** \`Discord.js v${djsversion}\`\n` +
                `> ⚙️ **Node.js:** \`${process.version}\`\n`
            )
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setFooter({ text: "BlueSealPrime Sovereign Monitoring", iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [statsEmbed] });
    }
};
