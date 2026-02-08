const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "left.json");

// ───── DATA MANAGEMENT ─────
function loadLeftData() {
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

function saveLeftData(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "left",
    description: "Configure the premium goodbye system",
    usage: "!left set #channel | !left test | !left off",
    permissions: [PermissionsBitField.Flags.ManageGuild],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 You need Manage Server permission.")] });
        }

        const subCommand = args[0]?.toLowerCase();

        // ───── CONFIGURATION ─────
        if (subCommand === "set") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) {
                return message.reply("⚠️ **Please mention a valid channel.**\nUsage: `!left set #goodbyes`");
            }

            const data = loadLeftData();
            data[message.guild.id] = channel.id;
            saveLeftData(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(require("../config").SUCCESS_COLOR)
                    .setTitle("✅ Goodbye Channel Set")
                    .setDescription(`**Premium Goodbye System** is now active in ${channel}.`)
                    .setFooter({ text: "BlueSealPrime Systems" })
                ]
            });
        }

        // ───── DISABLE ─────
        if (subCommand === "off") {
            const data = loadLeftData();
            if (!data[message.guild.id]) {
                return message.reply("ℹ️ Goodbye system is already disabled.");
            }
            delete data[message.guild.id];
            saveLeftData(data);
            return message.reply("✅ **Goodbye system disabled.**");
        }

        // ───── TEST ─────
        if (subCommand === "test") {
            if (message.author.id === BOT_OWNER_ID) {
                // 👑 OWNER LEAVE (INVINCIBLE)
                const royalEmbed = new EmbedBuilder()
                    .setColor("#FFD700") // Gold
                    .setTitle("👑 ROYAL DEPARTURE")
                    .setDescription(
                        `***The Creator has departed the sovereign dominion.***\n\n` +
                        `> **Status:** INVINCIBLE\n` +
                        `> **Legacy:** ETERNAL\n\n` +
                        `*Systems remain operational under autonomous protocols.*`
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `BlueSealPrime • Royal Protocol`, iconURL: message.client.user.displayAvatarURL() })
                    .setTimestamp();
                return message.channel.send({ embeds: [royalEmbed] });
            } else {
                // 🛡️ NORMAL MEMBER (SECURITY BREACH)
                const embed = new EmbedBuilder()
                    .setColor("#2B2D31") // Dark Carbon
                    .setTitle("🛡️ SECURITY PERIMETER BREACH")
                    .setDescription(
                        "```diff\n" +
                        "- MEMBER STATUS: DEPARTED\n" +
                        "- CLEARANCE:     REVOKED\n" +
                        "- ACCESS LEVEL:  TERMINATED\n" +
                        "```\n\n\n" +
                        `**${message.author}, your access to this secure facility has been terminated.**\n\n` +
                        `> *All credentials have been deactivated.*\n\n` +
                        `> *Security protocols remain active.*\n\n\n` +
                        `🔒 **BlueSealPrime Security Network**`
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                    .addFields(
                        { name: "👤 Departed User", value: `\`${message.author.tag}\``, inline: true },
                        { name: "🆔 User ID", value: `\`${message.author.id}\``, inline: true },
                        { name: "📊 Remaining Members", value: `\`${message.guild.memberCount}\``, inline: true }
                    )
                    .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                    .setFooter({ text: `BlueSealPrime • Security Protocols • Departed at`, iconURL: message.client.user.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }
        }

        return message.reply("❓ **Unknown subcommand.** Use `set #channel`, `off`, or `test`.");
    }
};
