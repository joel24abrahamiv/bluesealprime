const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "temproles.json");

const TIME_MULTIPLIERS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};

function loadTempRoles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return [];
    }
}

function saveTempRoles(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function parseDuration(str) {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    return value * TIME_MULTIPLIERS[unit];
}

module.exports = {
    name: "temprole",
    description: "Give a user a temporary role (Admin Only)",
    usage: "!temprole @User @Role <duration> (e.g. 1h, 30m)",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    init(client) {
        console.log("⏱️ TempRole monitoring started...");
        setInterval(async () => {
            const activeRoles = loadTempRoles();
            const now = Date.now();
            let changed = false;
            const remainingRoles = [];

            for (const entry of activeRoles) {
                if (now >= entry.expiresAt) {
                    try {
                        const guild = client.guilds.cache.get(entry.guildId);
                        if (!guild) continue;
                        const member = await guild.members.fetch(entry.userId).catch(() => null);
                        const role = guild.roles.cache.get(entry.roleId);
                        if (member && role) {
                            await member.roles.remove(role);
                            console.log(`[TempRole] Removed expired role ${role.name} from ${member.user.tag}`);
                        }
                        changed = true;
                    } catch (err) {
                        console.error(`[TempRole] Failed to remove role for ${entry.userId}:`, err);
                        changed = true;
                    }
                } else {
                    remainingRoles.push(entry);
                }
            }
            if (changed) saveTempRoles(remainingRoles);
        }, 60 * 1000);
    },

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "temprole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---
            const _fs = require('fs');
            const _path = require('path');
            const OWNERS_DB = _path.join(__dirname, '../data/owners.json');
            let _isExtraOwner = false;
            const _isBotOwner = message.author.id === BOT_OWNER_ID;
            const _isServerOwner = message.guild.ownerId === message.author.id;
            if (_fs.existsSync(OWNERS_DB)) {
                try {
                    const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));
                    const raw = rawDb[message.guild.id] || [];
                    const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);
                    _isExtraOwner = extraIds.includes(message.author.id);
                } catch (e) { }
            }
            if (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading('🚫 SYSTEM SECURITY LOCK', 3),
                        V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\nRole modifications are heavily monitored.')
                    ], V2_RED)]
                }).catch(() => { });
            }

            const member = message.mentions.members.first();
            const durationArg = args.find(a => /^\d+[smhd]$/.test(a));
            let role = message.mentions.roles.first();

            if (!role) {
                const potentialId = args.find(a => /^\d{17,19}$/.test(a) && a !== member?.id);
                if (potentialId) role = message.guild.roles.cache.get(potentialId);
                if (!role) {
                    const query = args.filter(a => a !== durationArg && !a.includes(member?.id) && !a.startsWith("<@")).join(" ");
                    if (query) {
                        role = message.guild.roles.cache.find(r => r.name.toLowerCase() === query.toLowerCase()) ||
                            message.guild.roles.cache.find(r => r.name.toLowerCase().includes(query.toLowerCase()));
                    }
                }
            }

            if (!member) return message.reply("⚠️ **Missing User.** Please mention a user.");
            if (!durationArg) return message.reply("⚠️ **Missing Duration.** Example: `1h`, `30m`.");
            if (!role) return message.reply("⚠️ **Missing Role.** Please provide a valid role.");

            // --- SOVEREIGN ROLE PREVENTION ---
            const rName = role.name.toLowerCase();
            if (rName.includes("bluesealprime") || rName.includes("antinuke") || rName.includes("anti-raid") || rName.includes("quarantine") || rName.includes("botrole") || role.tags?.botId === message.client.user.id) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 SOVEREIGN PROTECTION", 3),
                        V2.text("This is an integrated Bot Role and cannot be used for temporary assignments.")
                    ], V2_RED)]
                }).catch(() => { });
            }

            if (!_isBotOwner && !_isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
                return message.reply("🚫 Role hierarchy prevents this action.");
            }

            const durationMs = parseDuration(durationArg);
            if (!durationMs) return message.reply("❌ Invalid duration format.");

            const expiresAt = Date.now() + durationMs;
            await member.roles.add(role);

            const db = loadTempRoles();
            db.push({
                guildId: message.guild.id,
                userId: member.id,
                roleId: role.id,
                expiresAt: expiresAt,
                addedAt: Date.now()
            });
            saveTempRoles(db);

            const container = V2.container([
                V2.section([
                    V2.text(`**Temporary Assignment**`),
                    V2.text(`Provisional access granted.`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`Operative **${member.user.username}** has been granted temporary clearance.`),
                V2.text(`\n**Role:** ${role.name}\n**Duration:** ${durationArg}\n**Expiration:** <t:${Math.floor(expiresAt / 1000)}:R>`),
                V2.text(`\nArchitect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#0099ff");

            return message.channel.send({ components: [container], flags: V2.flag });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Failed to assign role.");
        }
    }
};