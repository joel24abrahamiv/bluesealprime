const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR, WARN_COLOR, V2_BLUE, V2_RED } = require("../config");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "antiraid.json");

// ───── DATA MANAGEMENT ─────
function loadAntiRaidData() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return {};
    }
}

function saveAntiRaidData(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "antiraid",
    description: "Configure anti-raid protection system",
    usage: "!antiraid <on|off|config|status|unlock>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You need Administrator permission.")] });
        }

        const subCommand = args[0]?.toLowerCase();
        const data = loadAntiRaidData();
        const guildConfig = data[message.guild.id] || { enabled: false, threshold: 5, timeWindow: 10 };

        // ───── STATUS ─────
        if (!subCommand || subCommand === "status") {
            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🛡️ ANTI-RAID DIAGNOSTICS", 2),
                        V2.text(`**Global State:** ${guildConfig.enabled ? "✅ ACTIVE" : "❌ INACTIVE"}`)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/3524/3524812.png" // Shield Icon
                ),
                V2.separator(),
                V2.heading("⚙️ CONFIGURATION", 3),
                V2.text(`> **Threshold:** \`${guildConfig.threshold}\` joins\n> **Timeframe:** \`${guildConfig.timeWindow}\` seconds`),
                V2.separator(),
                V2.heading("ℹ️ DETECTION LOGIC", 3),
                V2.text(`System will trigger lockdown if **${guildConfig.threshold}** users join within **${guildConfig.timeWindow}s**.`),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], guildConfig.enabled ? "#0099ff" : "#2B2D31"); // Blue if active, dark if inactive? Or just Blue as requested. Let's stick to Blue. 
            // Actually, for "status", color coding state is useful. But user asked for unification. I'll use Blue for the frame, but text indicators for status.

            const unifiedContainer = V2.container([
                V2.section(
                    [
                        V2.heading("🛡️ ANTI-RAID DIAGNOSTICS", 2),
                        V2.text(`**Global State:** ${guildConfig.enabled ? "✅ ACTIVE" : "❌ INACTIVE"}`)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/929/929429.png" // Shield with cross or check
                ),
                V2.separator(),
                V2.heading("⚙️ CONFIGURATION", 3),
                V2.text(`> **Threshold:** \`${guildConfig.threshold}\` joins\n> **Timeframe:** \`${guildConfig.timeWindow}\` seconds`),
                V2.separator(),
                V2.heading("ℹ️ DETECTION LOGIC", 3),
                V2.text(`System will trigger lockdown if **${guildConfig.threshold}** users join within **${guildConfig.timeWindow}s**.`),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [unifiedContainer] });
        }

        // ───── ENABLE ─────
        if (subCommand === "on") {
            guildConfig.enabled = true;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            const container = V2.container([
                V2.heading("🛡️ PROTECTION ENABLED", 2),
                V2.text(`**Anti-Raid Protocols ACTIVE.**\n> Monitoring for **${guildConfig.threshold}** joins in **${guildConfig.timeWindow}s**.`),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        // ───── DISABLE ─────
        if (subCommand === "off") {
            guildConfig.enabled = false;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            const container = V2.container([
                V2.heading("⚠️ PROTECTION DISABLED", 2),
                V2.text("**Anti-Raid Protocols DEACTIVATED.**\n> Server is vulnerable to join floods."),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        // ───── CONFIG ─────
        if (subCommand === "config") {
            const threshold = parseInt(args[1]);
            const timeWindow = parseInt(args[2]);

            if (!threshold || !timeWindow || threshold < 2 || timeWindow < 5) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.heading("⚠️ INVALID CONFIGURATION", 3), V2.text("Usage: `!antiraid config <joins> <seconds>`\nExample: `!antiraid config 5 10`")], "#0099ff")]
                });
            }

            guildConfig.threshold = threshold;
            guildConfig.timeWindow = timeWindow;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            const container = V2.container([
                V2.heading("⚙️ CONFIGURATION UPDATED", 2),
                V2.text(`**New Raid Thresholds Set:**\n> **Joins:** ${threshold}\n> **Timeframe:** ${timeWindow} seconds`),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        // ───── UNLOCK ─────
        if (subCommand === "unlock") {
            const channels = message.guild.channels.cache.filter(c => c.type === 0);
            let unlocked = 0;

            const unlockPromises = channels.map(async ([id, channel]) => {
                try {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        SendMessages: null
                    });
                    unlocked++;
                } catch (err) {
                    console.error(`Failed to unlock ${channel.name}:`, err);
                }
            });

            await Promise.all(unlockPromises);

            const container = V2.container([
                V2.heading("🔓 LOCKDOWN LIFTED", 2),
                V2.text(`**Emergency Protocols Disengaged.**\n> Unlocked **${unlocked}** channels.\n> Normal operations resumed.`),
                V2.separator(),
                V2.text("*BlueSealPrime Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        const container = V2.container([
            V2.heading("🛡️ ANTI-RAID COMMANDS", 2),
            V2.text("Configure the join-flood protection system."),
            V2.separator(),
            V2.heading("🛠️ CONFIGURATION", 3),
            V2.text(`> \`!antiraid on\` - **Activate Protection**\n> \`!antiraid off\` - **Deactivate Protection**\n> \`!antiraid config <joins> <sec>\` - **Set Sensitivity**`),
            V2.heading("🚨 EMERGENCY", 3),
            V2.text(`> \`!antiraid unlock\` - **Lift Lockdown**`),
            V2.heading("📊 MONITORING", 3),
            V2.text(`> \`!antiraid status\` - **View Diagnostics**`)
        ], V2_RED);

        return message.reply({ content: null, flags: V2.flag, components: [container] });
    }
};
