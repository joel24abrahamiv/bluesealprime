const V2 = require("../utils/v2Utils");
const {
    SeparatorBuilder, SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");
const os = require("os");

// ── Builder Helpers ──
const sepLg = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (c) => new TextDisplayBuilder().setContent(c);
const h = (c, lvl = 2) => {
    const hashes = "#".repeat(lvl);
    return new TextDisplayBuilder().setContent(`${hashes} ${c}`);
};

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

        // ── HEADER SECTION ──
        const headerSection = new SectionBuilder()
            .addTextDisplayComponents(
                h("🛡️ BLUESEALPRIME", 1),
                txt(
                    `*Advanced Security & Moderation Bot*\n` +
                    `> **Version:** \`2.1.0\`   **Build:** \`Sovereign\`\n` +
                    `> **Developer:** <@${BOT_OWNER_ID}>`
                )
            )
            .setThumbnailAccessory(
                botMember.displayAvatarURL({ extension: "png", size: 256 })
            );

        // ── BUILD FINAL CONTAINER ──
        const container = new ContainerBuilder()
            .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))

            // Header
            .addSeparatorComponents(sepLg())
            .addSectionComponents(headerSection)
            .addSeparatorComponents(sepLg())

            // ── CLIENT STATS ──
            .addTextDisplayComponents(h("📊 CLIENT STATISTICS", 2))
            .addSeparatorComponents(sepSm())
            .addTextDisplayComponents(txt(
                `> 🏠 **Servers:** \`${guildCount}\`\n` +
                `> 👥 **Total Users:** \`${userCount.toLocaleString()}\`\n` +
                `> 📺 **Channels:** \`${chanCount}\`\n` +
                `> ⚙️ **Commands Loaded:** \`${cmdCount}\``
            ))
            .addSeparatorComponents(sepLg())

            // ── PERFORMANCE ──
            .addTextDisplayComponents(h("⚡ PERFORMANCE", 2))
            .addSeparatorComponents(sepSm())
            .addTextDisplayComponents(txt(
                `> ${pingColor} **API Latency:** \`${apiPing}ms\`\n` +
                `> ⏱️ **Uptime:** \`${uptime}\`\n` +
                `> 🧠 **Memory:** \`${memUsed} / ${memTotal}\``
            ))
            .addSeparatorComponents(sepLg())

            // ── SYSTEM ──
            .addTextDisplayComponents(h("🖥️ SYSTEM INFO", 2))
            .addSeparatorComponents(sepSm())
            .addTextDisplayComponents(txt(
                `> 🟩 **Node.js:** \`${nodeVer}\`\n` +
                `> 💎 **Discord.js:** \`v${djsVer}\`\n` +
                `> 🖥️ **Platform:** \`${platform}\`\n` +
                `> 🔧 **CPU:** \`${cpuModel}\``
            ))
            .addSeparatorComponents(sepLg())

            // ── QUICK LINKS / FLAGS ──
            .addTextDisplayComponents(h("🔰 BOT FLAGS", 2))
            .addSeparatorComponents(sepSm())
            .addTextDisplayComponents(txt(
                `> ` + (botUser.flags?.has("VerifiedBot") ? "✅" : "⚪") + ` **Verified Bot**\n` +
                `> ` + (botUser.flags?.has("GatewayGuildMembers") ? "✅" : "⚪") + ` **Server Members Intent**\n` +
                `> ` + (botUser.flags?.has("GatewayMessageContent") ? "✅" : "⚪") + ` **Message Content Intent**\n` +
                `> 🛡️ **Antinuke:** \`Active\`   🔒 **Security:** \`Sovereign Grade\``
            ))
            .addSeparatorComponents(sepLg())

            // ── FOOTER ──
            .addTextDisplayComponents(txt(
                `> 🆔 **Bot ID:** \`${botUser.id}\`   📅 **Created:** <t:${Math.floor(botUser.createdTimestamp / 1000)}:D>\n` +
                `*BlueSealPrime • Priority Alpha • Infinite Support*`
            ));

        return message.reply({ flags: V2.flag, components: [container] });
    }
};
