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
function addToGlobalWL(guildId, userId, addedBy, permissions = null) {
    const wl = loadGlobalWhitelist();
    if (!wl[guildId]) wl[guildId] = {};
    if (Array.isArray(wl[guildId])) {
        const arr = wl[guildId];
        wl[guildId] = {};
        arr.forEach(id => { wl[guildId][id] = { addedBy: null, addedAt: Date.now(), permissions: {} }; });
    }

    const defaultPerms = {
        roleCreate: false, roleDelete: false, roleUpdate: false, roleAdd: false,
        kickBan: false, antiDangerous: false,
        channelCreate: false, channelDelete: false, channelUpdate: false,
        guildUpdate: false, emojiUpdate: false, webhooks: false,
        botAdd: false
    };

    if (!wl[guildId][userId]) {
        wl[guildId][userId] = {
            addedBy: addedBy || null,
            addedAt: Date.now(),
            permissions: permissions || defaultPerms
        };
    } else {
        if (!wl[guildId][userId].permissions) {
            wl[guildId][userId].permissions = defaultPerms;
        }
        if (permissions) {
            wl[guildId][userId].permissions = permissions;
        }
    }
    saveGlobalWhitelist(wl);
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


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ANTINUKE
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const { PermissionsBitField } = require("discord.js");
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("antinuke") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "antinuke", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
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
                        limits: { channelDelete: 1, channelCreate: 1, roleDelete: 1, ban: 2, kick: 2, webhookCreate: 1, interval: 10000 }
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
                            V2.text(`> **Channel Del/Create:** \`${config.limits.channelDelete}\` / \`${config.limits.channelCreate || 1}\`\n> **Role Deletions:** \`${config.limits.roleDelete}\`\n> **Mass Bans:** \`${config.limits.ban}\`\n> **Webhook Creation:** \`${config.limits.webhookCreate || 1}\``),
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
                            addToGlobalWL(message.guild.id, user.id, message.author.id);
                        }

                        // ── GRANULAR PERMISSIONS UI (BUTTONS) ──
                        const V2 = require("../utils/v2Utils");
                        const { ActionRowBuilder, ButtonStyle, ComponentType } = require("discord.js");

                        const globalWL = loadGlobalWhitelist();
                        const entry = globalWL[message.guild.id][user.id];
                        const perms = entry.permissions || {};

                        const createButton = (id, label, enabled) => {
                            return V2.button(`wl_${user.id}_${id}`, label, enabled ? ButtonStyle.Danger : ButtonStyle.Secondary)
                                .setEmoji(enabled ? "🔴" : "🔘");
                        };

                        const generateComponents = (currentPerms) => {
                            return [
                                V2.section([V2.heading(`Whitelist Management: ${user.tag || user.username}`, 2), V2.text("Select specific actions this user is authorized to perform.")], user.displayAvatarURL({ dynamic: true })),
                                V2.separator(),
                                V2.text("**Roles Management**"),
                                new ActionRowBuilder().addComponents(
                                    createButton("roleCreate", "Role Create", currentPerms.roleCreate),
                                    createButton("roleDelete", "Role Delete", currentPerms.roleDelete),
                                    createButton("roleUpdate", "Role Update", currentPerms.roleUpdate),
                                    createButton("roleAdd", "Give Roles", currentPerms.roleAdd)
                                ),
                                V2.text("**Moderation**"),
                                new ActionRowBuilder().addComponents(
                                    createButton("kickBan", "Ban / Kick", currentPerms.kickBan),
                                    createButton("antiDangerous", "Dangerous", currentPerms.antiDangerous)
                                ),
                                V2.text("**Channel Management**"),
                                new ActionRowBuilder().addComponents(
                                    createButton("channelCreate", "Chan Create", currentPerms.channelCreate),
                                    createButton("channelDelete", "Chan Delete", currentPerms.channelDelete),
                                    createButton("channelUpdate", "Chan Update", currentPerms.channelUpdate)
                                ),
                                V2.text("**Server Management**"),
                                new ActionRowBuilder().addComponents(
                                    createButton("guildUpdate", "Server Mod", currentPerms.guildUpdate),
                                    createButton("emojiUpdate", "Emoji Update", currentPerms.emojiUpdate),
                                    createButton("webhooks", "Webhooks", currentPerms.webhooks)
                                ),
                                V2.text("**Bot Management**"),
                                new ActionRowBuilder().addComponents(
                                    createButton("botAdd", "Bot Add/Rem", currentPerms.botAdd)
                                ),
                                V2.separator(),
                                new ActionRowBuilder().addComponents(V2.button(`wl_${user.id}_save`, "SAVE CHANGES", ButtonStyle.Primary))
                            ];
                        };

                        const response = await message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container(generateComponents(perms), V2_BLUE)]
                        });

                        const collector = response.createMessageComponentCollector({
                            componentType: ComponentType.Button,
                            time: 60000,
                            filter: (i) => i.user.id === message.author.id
                        });

                        let activePerms = { ...perms };

                        collector.on("collect", async (i) => {
                            const parts = i.customId.split("_");
                            const targetId = parts[1];
                            const action = parts[2];

                            if (action === "save") {
                                addToGlobalWL(message.guild.id, targetId, message.author.id, activePerms);
                                await i.update({
                                    components: [V2.container([V2.section([V2.heading("✅ PERMISSIONS SECURED", 2), V2.text(`Settings for **${user.tag}** have been updated successfully.`)])], "#2ECC71")]
                                });
                                return collector.stop();
                            }

                            // Toggle
                            activePerms[action] = !activePerms[action];
                            await i.update({
                                components: [V2.container(generateComponents(activePerms), V2_BLUE)]
                            });
                        });
                    }

                    // Remove
                    if (action === "remove") {
                        const user = await resolveWLTarget(args[2]);
                        if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user or bot: `!antinuke wl remove @bot` or `!antinuke wl remove <botID>`")], V2_RED)] });

                        const globalWL = loadGlobalWhitelist();
                        const inGlobal = globalWL[message.guild.id] && (
                            Array.isArray(globalWL[message.guild.id])
                                ? globalWL[message.guild.id].includes(user.id)
                                : !!globalWL[message.guild.id][user.id]
                        );

                        if (config.whitelisted.includes(user.id) || inGlobal) {
                            if (config.whitelisted.includes(user.id)) {
                                config.whitelisted = config.whitelisted.filter(id => id !== user.id);
                                saveDB(db);
                            }
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

                // ───── LIMIT ─────
                if (sub === "limit" || sub === "limits") {
                    const type = args[1]?.toLowerCase();
                    const value = parseInt(args[2]);

                    if (!type || isNaN(value)) {
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([V2.text("Usage: `!antinuke limit <channelDelete|channelCreate|roleDelete|ban|kick|webhookCreate> <number>`")], V2_RED)]
                        });
                    }

                    const validTypes = ["channelDelete", "channelCreate", "roleDelete", "ban", "kick", "webhookCreate"];
                    if (!validTypes.includes(type)) {
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([V2.text(`🚫 **Invalid Type.** Choose from: ${validTypes.join(", ")}`)], V2_RED)]
                        });
                    }

                    config.limits[type] = value;
                    saveDB(db);

                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.section([
                                V2.heading("📊 THRESHOLD UPDATED", 2),
                                V2.text(`**Category:** \`${type}\`\n**New Limit:** \`${value}\` actions per 10s.`)
                            ], message.guild.iconURL({ dynamic: true }))
                        ], V2_BLUE)]
                    });
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
                        "> `!antinuke limit <type> <val>`\n" +
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "antinuke", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] antinuke.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "antinuke", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("antinuke", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`antinuke\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_81
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_145
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_920
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_386
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_486
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_115
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_348
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_922
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_534
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_920
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_803
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_972
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_21
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_329
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_479
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_381
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_371
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_483
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_153
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_761
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_986
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_762
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_899
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_349
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_886
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_179
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_99
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_274
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_294
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_158
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_652
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_434
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_517
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_389
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_478
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_591
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_15
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_520
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_420
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_364
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_914
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_219
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_179
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_745
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_119
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_125
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_856
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_995
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_826
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_579
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_406
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_826
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_204
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_37
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_226
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_444
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_148
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_19
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_80
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_693
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_575
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_801
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_12
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_341
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_335
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_250
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_558
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_604
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_276
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_776
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_523
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_884
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_784
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_450
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_611
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_454
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_441
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_790
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_478
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_592
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_903
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_309
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_78
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_788
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_173
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_192
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_138
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_720
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_209
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_77
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_335
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_952
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_553
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_69
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_723
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_548
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_454
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_638
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_685
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ANTINUKE_ID_759
     */

};