const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR, WARN_COLOR } = require("../config");

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
            const statusEmbed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("🛡️ ANTI-RAID PROTECTION STATUS")
                .setDescription(
                    `**Security Protocols Status:**\n` +
                    `> **Status:** ${guildConfig.enabled ? "✅ ACTIVE" : "❌ INACTIVE"}\n` +
                    `> **Threshold:** \`${guildConfig.threshold}\` joins\n` +
                    `> **Timeframe:** \`${guildConfig.timeWindow}\` seconds\n\n` +
                    `**Current Detail:**\n` +
                    `Triggers when **${guildConfig.threshold}** members join within **${guildConfig.timeWindow}** seconds.\n\n` +
                    `🔒 **BlueSealPrime Security Network**`
                )
                .setFooter({ text: "BlueSealPrime • Anti-Raid System", iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            return message.reply({ embeds: [statusEmbed] });
        }

        // ───── ENABLE ─────
        if (subCommand === "on") {
            guildConfig.enabled = true;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("✅ Anti-Raid Protection Enabled")
                    .setDescription(
                        `**Security protocols are now active.**\n\n` +
                        `> Monitoring for **${guildConfig.threshold}** joins in **${guildConfig.timeWindow}** seconds\n\n` +
                        `> Auto-lockdown will trigger if threshold is exceeded`
                    )
                    .setFooter({ text: "BlueSealPrime • Anti-Raid System" })
                ]
            });
        }

        // ───── DISABLE ─────
        if (subCommand === "off") {
            guildConfig.enabled = false;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(WARN_COLOR)
                    .setTitle("⚠️ Anti-Raid Protection Disabled")
                    .setDescription("**Security protocols have been deactivated.**")
                    .setFooter({ text: "BlueSealPrime • Anti-Raid System" })
                ]
            });
        }

        // ───── CONFIG ─────
        if (subCommand === "config") {
            const threshold = parseInt(args[1]);
            const timeWindow = parseInt(args[2]);

            if (!threshold || !timeWindow || threshold < 2 || timeWindow < 5) {
                return message.reply("⚠️ **Invalid configuration.**\nUsage: `!antiraid config <joins> <seconds>`\nExample: `!antiraid config 5 10`");
            }

            guildConfig.threshold = threshold;
            guildConfig.timeWindow = timeWindow;
            data[message.guild.id] = guildConfig;
            saveAntiRaidData(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("⚙️ Anti-Raid Configuration Updated")
                    .setDescription(
                        `**New thresholds have been set:**\n\n` +
                        `> **Joins:** ${threshold}\n` +
                        `> **Timeframe:** ${timeWindow} seconds`
                    )
                    .setFooter({ text: "BlueSealPrime • Anti-Raid System" })
                ]
            });
        }

        // ───── UNLOCK ─────
        if (subCommand === "unlock") {
            const channels = message.guild.channels.cache.filter(c => c.type === 0); // Text channels
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

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("🔓 SERVER UNLOCKED")
                    .setDescription(
                        `**Lockdown has been lifted.**\n\n` +
                        `> Unlocked **${unlocked}** channels\n` +
                        `> Normal operations resumed`
                    )
                    .setFooter({ text: "BlueSealPrime • Anti-Raid System" })
                ]
            });
        }

        return message.reply("❓ **Unknown subcommand.**\nUse: `on`, `off`, `config <joins> <seconds>`, `status`, or `unlock`");
    }
};
