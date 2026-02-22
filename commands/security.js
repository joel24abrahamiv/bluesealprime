const V2 = require("../utils/v2Utils");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "security",
    description: "Live V2 Security Telemetry & System Control",
    aliases: ["sec", "dashboard"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) return;

        const clientUser = message.client.user;
        const guild = message.guild;

        // 📊 DATA RETRIEVAL
        const ANTINUKE_DB = path.join(__dirname, "../data/antinuke.json");
        const ANTIRAID_DB = path.join(__dirname, "../data/antiraid.json");
        const AUTOMOD_DB = path.join(__dirname, "../data/automod.json");

        const load = (p, def) => {
            if (!fs.existsSync(p)) return def;
            try { return JSON.parse(fs.readFileSync(p, "utf8"))[guild.id] || def; } catch (e) { return def; }
        };

        const anConfig = load(ANTINUKE_DB, { enabled: false });
        const arConfig = load(ANTIRAID_DB, { enabled: false });
        const amConfig = load(AUTOMOD_DB, { antiLinks: true, antiSpam: true, antiBadWords: true });

        // Hierarchy Check
        const me = guild.members.me;
        const botRole = me.roles.botRole;
        const isApex = botRole && botRole.position >= guild.roles.cache.size - 2;

        const dashboardContainer = V2.container([
            V2.section([
                V2.heading("📡 SOVEREIGN CORE TELEMETRY", 2),
                V2.text(`**Node:** ${guild.name}\n**System Status:** ${isApex ? "🟢 ABSOLUTE_APEX" : "🔴 DEGRADED_HIERARCHY"}`)
            ], V2.botAvatar(message)),
            V2.separator(),

            V2.heading("🛡️ LAYER STATUS", 3),
            V2.text(
                `> **Anti-Nuke:** ${anConfig.enabled ? "✅ ACTIVE" : "❌ OFFLINE"}\n` +
                `> **Anti-Raid:** ${arConfig.enabled ? "✅ ACTIVE" : "❌ OFFLINE"}\n` +
                `> **Ghost-Watch:** 🛡️ **INSTANT_TERMINATION**\n` +
                `> **Apex-Lock:** ${isApex ? "🔱 AT_TOP" : "⚠️ BELOW_PEERS"}`
            ),
            V2.separator(),

            V2.heading("⚙️ AUTOMOD MODULES", 3),
            V2.text(
                `> **Spam Filter:** ${amConfig.antiSpam ? "✅" : "❌"}\n` +
                `> **Link Shield:** ${amConfig.antiLinks ? "✅" : "❌"}\n` +
                `> **Profanity Filter:** ${amConfig.antiBadWords ? "✅" : "❌"}`
            ),
            V2.separator(),

            V2.heading("📋 COMMAND INDEX", 3),
            V2.text(`\`!sa\` (Apex) • \`!antinuke\` • \`!antiraid\` • \`!automod\``),

            V2.separator(),
            V2.text(`*Last Heartbeat: ${new Date().toLocaleTimeString()} • Node Jurisidction: ${message.client.user.username}*`)
        ], V2_BLUE);

        return message.reply({ content: null, flags: V2.flag, components: [dashboardContainer] });
    }
};
