const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");
const os = require("os");

module.exports = {
    name: "botinfo",
    description: "Display sovereign node intelligence and system status.",
    aliases: ["bi", "about", "binfo"],

    async execute(message) {
        const { client, guild } = message;
        const botUser = client.user;

        // ── SYNC STATS ──
        const uptime = formatUptime(client.uptime);
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);
        const channels = client.channels.cache.size;
        const commands = client.commands?.size || 0;

        // ── SYSTEM METER ──
        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const memTotal = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
        const cpuModel = os.cpus().length > 0 ? os.cpus()[0].model.split(" ").slice(0, 3).join(" ") : "Virtual Node";
        const ping = client.ws.ping;
        const pingIndicator = ping < 150 ? "🟢" : ping < 300 ? "🟡" : "🔴";

        // ── IDENTITY ──
        const avatar = V2.botAvatar(message);

        // ── CONSTRUCT SOVEREIGN DASHBOARD ──
        try {
            const dashboard = V2.container([
                // Header: Identity Primary
                V2.separator(),
                V2.section([
                    V2.heading("🛡️ BLUESEALPRIME: SOVEREIGN NODE", 1),
                    V2.text(`**V2 Internal Intelligence Feed**\n> **Architect:** <@${BOT_OWNER_ID}>\n> **Version:** \`2.1.0-Ω\``)
                ], avatar),
                V2.separator(),

                // Section 1: Network Metrics
                V2.heading("📊 NETWORK ANALYTICS", 2),
                V2.text(
                    `> 🏛️ **Total Nodes:** \`${guilds}\`\n` +
                    `> 👥 **Known Entities:** \`${users.toLocaleString()}\`\n` +
                    `> 📺 **Active Matrix:** \`${channels}\` Channels\n` +
                    `> ⚙️ **Indexed Logic:** \`${commands}\` Modules`
                ),
                V2.separator(),

                // Section 2: Core Performance
                V2.heading("⚡ HEARTBEAT & CORE", 2),
                V2.text(
                    `> ${pingIndicator} **Sync Latency:** \`${ping}ms\`\n` +
                    `> ⏱️ **Node Uptime:** \`${uptime}\`\n` +
                    `> 🧠 **Memory Heap:** \`${memUsed} MB / ${memTotal} MB\``
                ),
                V2.separator(),

                // Section 3: Hardware Signature
                V2.heading("🖥️ HARDWARE SIGNATURE", 2),
                V2.text(
                    `> 🧩 **Engine:** \`Node ${process.version}\`\n` +
                    `> 💎 **Interface:** \`DJS v${require("discord.js").version}\`\n` +
                    `> 🔧 **Processor:** \`${cpuModel}\`\n` +
                    `> 💠 **OS Platform:** \`${os.platform().toUpperCase()}\``
                ),
                V2.separator(),

                // Footer: Integrity
                V2.text(`*Security Integrity: VERIFIED • Node ID: ${botUser.id}*\n*BlueSealPrime © 2026 Sovereign Systems*`)
            ], V2_BLUE);

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [dashboard]
            });

        } catch (error) {
            console.error("[BotInfo Error]:", error);
            // Fallback to basic embed if V2 components fail (Safety for non-V2 environments)
            const { EmbedBuilder } = require("discord.js");
            const fallback = new EmbedBuilder()
                .setColor(V2_BLUE || "#5DADE2")
                .setTitle("🛡️ Bot Information (Legacy Mode)")
                .setDescription(`Sovereign V2 Interface encountered a rendering fault.\n\n**Uptime:** ${uptime}\n**Latency:** ${ping}ms\n**Servers:** ${guilds}`)
                .setFooter({ text: "Error: Components V2 rendering failure on this build." });

            return message.reply({ embeds: [fallback] });
        }
    }
};

function formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
