const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");
const os = require("os");

function formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
}

module.exports = {
    name: "botinfo",
    description: "Comprehensive bot information dashboard",
    aliases: ["binfo", "about", "bi"],

    async execute(message) {
        const client = message.client;
        const botUser = client.user;
        const botMember = message.guild.members.me;

        // ── Stats ──
        const uptime = formatUptime(client.uptime);
        const guildCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const chanCount = client.channels.cache.size;
        const cmdCount = client.commands.size;
        const apiPing = client.ws.ping;
        const memUsed = formatBytes(process.memoryUsage().heapUsed);
        const memTotal = formatBytes(process.memoryUsage().heapTotal);
        const nodeVer = process.version;
        const djsVer = require("discord.js").version;
        const platform = os.platform() === "win32" ? "Windows" : os.platform() === "linux" ? "Linux" : os.platform();
        const cpuModel = os.cpus()[0]?.model?.split(" ").slice(0, 4).join(" ") || "Unknown";

        // ── Latency colour ──
        const pingColor = apiPing < 100 ? "🟢" : apiPing < 250 ? "🟡" : "🔴";

        // ── BUILD V2 UI ──
        const botPfp = V2.botAvatar(message);

        const container = V2.container([
            // Header
            V2.separator(),
            V2.section([
                V2.heading("🛡️ BLUESEALPRIME", 1),
                V2.text(`*Advanced Security & Moderation Bot*\n` +
                    `> **Version:** \`2.1.0\`   **Build:** \`Sovereign\`\n` +
                    `> **Developer:** <@${BOT_OWNER_ID}>`)
            ], botPfp),
            V2.separator(),

            // Stats
            V2.heading("📊 CLIENT STATISTICS", 2),
            V2.text(`> 🏠 **Servers:** \`${guildCount}\`\n` +
                `> 👥 **Total Users:** \`${userCount.toLocaleString()}\`\n` +
                `> 📺 **Channels:** \`${chanCount}\`\n` +
                `> ⚙️ **Commands Loaded:** \`${cmdCount}\``),
            V2.separator(),

            // Performance
            V2.heading("⚡ PERFORMANCE", 2),
            V2.text(`> ${pingColor} **API Latency:** \`${apiPing}ms\`\n` +
                `> ⏱️ **Uptime:** \`${uptime}\`\n` +
                `> 🧠 **Memory:** \`${memUsed} / ${memTotal}\``),
            V2.separator(),

            // System
            V2.heading("🖥️ SYSTEM INFO", 2),
            V2.text(`> 🟩 **Node.js:** \`${nodeVer}\`\n` +
                `> 💎 **Discord.js:** \`v${djsVer}\`\n` +
                `> 🖥️ **Platform:** \`${platform}\`\n` +
                `> 🔧 **CPU:** \`${cpuModel}\``),
            V2.separator(),

            // Flags
            V2.heading("🔰 BOT FLAGS", 2),
            V2.text(`> ` + (botUser.flags?.has("VerifiedBot") ? "✅" : "⚪") + ` **Verified Bot**\n` +
                `> ` + (botUser.flags?.has("GatewayGuildMembers") ? "✅" : "⚪") + ` **Members Intent**\n` +
                `> ` + (botUser.flags?.has("GatewayMessageContent") ? "✅" : "⚪") + ` **Content Intent**\n` +
                `> 🛡️ **Antinuke:** \`Active\`   🔒 **Security:** \`Sovereign Grade\``),
            V2.separator(),

            // Footer
            V2.text(`> 🆔 **Bot ID:** \`${botUser.id}\`   📅 **Created:** <t:${Math.floor(botUser.createdTimestamp / 1000)}:D>\n` +
                `*BlueSealPrime • Priority Alpha • Infinite Support*`)
        ], V2_BLUE);

        return message.reply({ flags: V2.flag, components: [container] });
    }
};
