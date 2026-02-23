const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const DB_PATH = path.join(__dirname, "../data/antinuke.json");
const WHITELIST_PATH = path.join(__dirname, "../data/whitelist.json");

// ── Shared whitelist.json helpers (this is what checkNuke reads) ──
function loadGlobalWhitelist() {
    if (!fs.existsSync(WHITELIST_PATH)) return {};
    try { return JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")); } catch { return {}; }
}
function saveGlobalWhitelist(data) {
    if (!fs.existsSync(path.dirname(WHITELIST_PATH))) fs.mkdirSync(path.dirname(WHITELIST_PATH), { recursive: true });
    fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}
function addToGlobalWL(guildId, userId, addedBy) {
    const wl = loadGlobalWhitelist();
    if (!wl[guildId]) wl[guildId] = {};
    // Migrate old array format
    if (Array.isArray(wl[guildId])) {
        const arr = wl[guildId];
        wl[guildId] = {};
        arr.forEach(id => { wl[guildId][id] = { addedBy: null, addedAt: Date.now() }; });
    }
    if (!wl[guildId][userId]) {
        wl[guildId][userId] = { addedBy: addedBy || null, addedAt: Date.now() };
        saveGlobalWhitelist(wl);
    }
}
function removeFromGlobalWL(guildId, userId) {
    const wl = loadGlobalWhitelist();
    if (!wl[guildId]) return;
    if (Array.isArray(wl[guildId])) {
        wl[guildId] = wl[guildId].filter(id => id !== userId);
    } else {
        delete wl[guildId][userId];
    }
    saveGlobalWhitelist(wl);
}

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch { return {}; }
}

function saveDB(data) {
    if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "antinuke",
    description: "Configure Anti-Nuke Protection",
    usage: "!antinuke <on|off|config|status|autorestore|wl>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");

        try {
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.author.id === message.guild.ownerId;
            const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

            // General access check (Status/Help)
            if (!isBotOwner && !isServerOwner && !isAdmin) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("🚫 **Security Alert:** Access Denied. Sovereign or Administrator only.")], V2_RED)]
                });
            }

            const sub = args[0]?.toLowerCase();
            let db = loadDB();

            // Initialize Config
            if (!db[message.guild.id]) {
                db[message.guild.id] = {
                    enabled: false,
                    whitelisted: [],
                    autorestore: true,
                    limits: { channelDelete: 2, roleDelete: 2, ban: 3, kick: 3, interval: 10000 }
                };
            }
            const config = db[message.guild.id];
            if (!config.whitelisted) config.whitelisted = [];

            // ───── ON ─────
            if (sub === "on") {
                if (!isBotOwner) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("🚫 **Bot Owner Only:** This sensitive toggle is restricted.")], V2_RED)] });

                config.enabled = true;
                saveDB(db);
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.section(
                            [
                                V2.heading("🛡️ SOVEREIGN SHIELD ACTIVATED", 2),
                                V2.text("**Status:** Active & Monitoring\n> High-frequency deletion events will be intercepted.")
                            ],
                            message.guild.iconURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text("*BlueSealPrime Security Matrix*")
                    ], "#00FF7F")] // Premium Spring Green
                });
            }

            // ───── OFF ─────
            if (sub === "off") {
                if (!isBotOwner) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("🚫 **Bot Owner Only:** This sensitive toggle is restricted.")], V2_RED)] });

                config.enabled = false;
                saveDB(db);
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.section(
                            [
                                V2.heading("⚠️ SOVEREIGN SHIELD DEACTIVATED", 2),
                                V2.text("**Status:** Offline\n> The server is currently exposed to unauthorized administrative actions.")
                            ],
                            message.guild.iconURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text("*BlueSealPrime Security Matrix*")
                    ], "#FF3030")] // Premium Red
                });
            }

            // ───── STATUS ─────
            if (sub === "status") {
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.section(
                            [
                                V2.heading("🛡️ SOVEREIGN SHIELD DIAGNOSTICS", 2),
                                V2.text(`**System State:** ${config.enabled ? "✅ ACTIVE" : "❌ OFFLINE"}`),
                                V2.text("\u200b")
                            ],
                            message.client.user.displayAvatarURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.heading("⚙️ CONFIGURATION DATA", 3),
                        V2.text(`> **Autorestore Protocol:** ${config.autorestore ? "✅ Enabled" : "❌ Disabled"}\n> **Authorized Personnel:** \`${config.whitelisted.length}\` Agents Whitelisted`),
                        V2.text("\u200b"),
                        V2.heading("📊 THRESHOLD LIMITS (per 10s)", 3),
                        V2.text(`> **Channel Deletions:** \`${config.limits.channelDelete}\`\n> **Role Deletions:** \`${config.limits.roleDelete}\`\n> **Mass Bans:** \`${config.limits.ban}\``),
                        V2.separator(),
                        V2.text("*BlueSealPrime Defense Systems*")
                    ], config.enabled ? V2_BLUE : V2_RED)]
                });
            }

            // ───── AUTORESTORE ─────
            if (sub === "autorestore") {
                const action = args[1]?.toLowerCase();
                if (action === "on") config.autorestore = true;
                else if (action === "off") config.autorestore = false;
                else return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("Usage: `!antinuke autorestore <on|off>`")], V2_RED)] });

                saveDB(db);
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading(config.autorestore ? "♻️ AUTORESTORE PROTOCOL: ONLINE" : "⚠️ AUTORESTORE PROTOCOL: OFFLINE", 2),
                            V2.text(config.autorestore ? "> Deleted channels and roles will be automatically regenerated." : "> Deleted assets will NOT be restored.")
                        ], message.client.user.displayAvatarURL({ dynamic: true, size: 512 }))
                    ], config.autorestore ? V2_BLUE : V2_RED)]
                });
            }

            // ───── WHITELIST (WL) ─────
            if (sub === "wl" || sub === "whitelist") {
                const action = args[1]?.toLowerCase();

                // ── Resolve target: mention OR raw bot/user ID ──
                async function resolveWLTarget(rawId) {
                    const mentioned = message.mentions.users.first();
                    if (mentioned) return mentioned;
                    if (rawId && /^\d{17,20}$/.test(rawId)) {
                        try { return await message.client.users.fetch(rawId); } catch { return null; }
                    }
                    return null;
                }

                // Add
                if (action === "add") {
                    const user = await resolveWLTarget(args[2]);
                    if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user or bot: `!antinuke wl add @bot` or `!antinuke wl add <botID>`")], V2_RED)] });

                    const isBot = user.bot;
                    if (!config.whitelisted.includes(user.id)) {
                        config.whitelisted.push(user.id);
                        saveDB(db);
                        // ✅ CRITICAL: also write to whitelist.json which checkNuke() reads
                        addToGlobalWL(message.guild.id, user.id, message.author.id);
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([
                                V2.section([
                                    V2.heading("🔐 CLEARANCE GRANTED", 2),
                                    V2.text(`**${isBot ? "🤖 Bot" : "👤 User"}:** ${user.tag || user.username}\n**ID:** \`${user.id}\`\n> ${isBot ? "Bot" : "User"} is now **immune** to Anti-Nuke countermeasures.`)
                                ], user.displayAvatarURL({ dynamic: true }))
                            ], V2_BLUE)]
                        });
                    } else {
                        return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ Already whitelisted.")], "#FFCC00")] });
                    }
                }

                // Remove
                if (action === "remove") {
                    const user = await resolveWLTarget(args[2]);
                    if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user or bot: `!antinuke wl remove @bot` or `!antinuke wl remove <botID>`")], V2_RED)] });

                    if (config.whitelisted.includes(user.id)) {
                        config.whitelisted = config.whitelisted.filter(id => id !== user.id);
                        saveDB(db);
                        // ✅ CRITICAL: also remove from whitelist.json
                        removeFromGlobalWL(message.guild.id, user.id);
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([
                                V2.section([
                                    V2.heading("🗑️ CLEARANCE REVOKED", 2),
                                    V2.text(`**${user.bot ? "🤖 Bot" : "👤 User"}:** ${user.tag || user.username}\n**ID:** \`${user.id}\`\n> Anti-Nuke will now monitor this ${user.bot ? "bot" : "user"} normally.`)
                                ], user.displayAvatarURL({ dynamic: true }))
                            ], V2_RED)]
                        });
                    } else {
                        return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ Not currently whitelisted.")], "#FFCC00")] });
                    }
                }

                // List
                if (action === "list") {
                    if (config.whitelisted.length === 0) {
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([
                                V2.section(
                                    [
                                        V2.heading("🛡️ SOVEREIGN WHITELIST", 2),
                                        V2.text("The clearance registry is currently empty.")
                                    ],
                                    message.client.user.displayAvatarURL({ dynamic: true, size: 512 })
                                )
                            ], V2_BLUE)]
                        });
                    }

                    const wlLines = await Promise.all(config.whitelisted.map(async (id, i) => {
                        const u = message.client.users.cache.get(id) || await message.client.users.fetch(id).catch(() => null);
                        if (u) return `> **${i + 1}.** ${u.bot ? "🤖 Bot" : "👤 User"} — ${u.tag || u.username} (\`${id}\`)`;
                        return `> **${i + 1}.** ❓ Unknown — \`${id}\``;
                    }));

                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.section([
                                V2.heading("🛡️ IMPERIAL AGENT REGISTRY", 2),
                                V2.text("**Authorized Personnel with Anti-Nuke Immunity:**")
                            ], message.guild.iconURL({ dynamic: true })),
                            V2.text("\u200b"),
                            V2.text(wlLines.join("\n")),
                            V2.separator(),
                            V2.text("*BlueSealPrime Identity Protocol*")
                        ], V2_BLUE)]
                    });
                }

                // Fallback usage hint for wl subcommand
                return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("Usage: `!antinuke wl add @bot/ID` | `remove @bot/ID` | `list`")], "#FFCC00")] });
            }

            // ───── UNWHITELIST ALIAS ─────
            if (sub === "unwhitelist") {
                const targetArg = args[1];
                let user = message.mentions.users.first();
                if (!user && targetArg && /^\d{17,20}$/.test(targetArg)) {
                    user = await message.client.users.fetch(targetArg).catch(() => null);
                }

                if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user or bot: `!antinuke unwhitelist @bot` or `!antinuke unwhitelist <botID>`")], V2_RED)] });

                if (config.whitelisted.includes(user.id)) {
                    config.whitelisted = config.whitelisted.filter(id => id !== user.id);
                    saveDB(db);
                    removeFromGlobalWL(message.guild.id, user.id);
                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.section([
                                V2.heading("🗑️ CLEARANCE REVOKED", 2),
                                V2.text(`**${user.bot ? "🤖 Bot" : "👤 User"}:** ${user.tag || user.username}\n**ID:** \`${user.id}\`\n> Anti-Nuke will now monitor this ${user.bot ? "bot" : "user"} normally.`)
                            ], user.displayAvatarURL({ dynamic: true }))
                        ], V2_RED)]
                    });
                } else {
                    return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ Not currently whitelisted.")], "#FFCC00")] });
                }
            }

            // ───── HELP MENU ─────
            const container = V2.container([
                V2.section([
                    V2.heading("🛡️ SOVEREIGN SHIELD OS", 2),
                    V2.text("Configure advanced anti-nuke countermeasures.")
                ], message.client.user.displayAvatarURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(
                    "> `!antinuke on` | `!antinuke off`\n" +
                    "> `!antinuke status`\n" +
                    "> `!antinuke autorestore <on|off>`\n" +
                    "\n> `!antinuke wl add @bot` or `!antinuke wl add <botID>`\n" +
                    "> `!antinuke wl remove @bot` or `!antinuke wl remove <botID>`\n" +
                    "> `!antinuke wl list`"
                )
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });

        } catch (e) {
            console.error(e);
            const V2 = require("../utils/v2Utils");
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Internal error:** \`${e.message}\``)], V2_RED)]
            });
        }
    }
};
