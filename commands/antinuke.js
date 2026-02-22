const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const DB_PATH = path.join(__dirname, "../data/antinuke.json");

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
                        ])
                    ], config.autorestore ? V2_BLUE : V2_RED)]
                });
            }

            // ───── WHITELIST (WL) ─────
            if (sub === "wl" || sub === "whitelist") {
                const action = args[1]?.toLowerCase();

                // Add
                if (action === "add" || (!action && sub === "whitelist")) {
                    const targetArg = (sub === "whitelist" && !action) ? args[1] : args[2];
                    const user = message.mentions.users.first() || message.client.users.cache.get(targetArg);

                    if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user: `!antinuke wl add @user`")], V2_RED)] });

                    if (!config.whitelisted.includes(user.id)) {
                        config.whitelisted.push(user.id);
                        saveDB(db);
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([
                                V2.section([
                                    V2.heading("🔐 CLEARANCE GRANTED", 2),
                                    V2.text(`**Target:** ${user.tag}\n**Status:** Whitelisted\n> Imperial Agent is now immune to Anti-Nuke countermeasures.`)
                                ], user.displayAvatarURL({ dynamic: true }))
                            ], V2_BLUE)]
                        });
                    } else {
                        return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ User is already whitelisted.")], "#FFCC00")] });
                    }
                }

                // Remove
                if (action === "remove") {
                    const targetArg = args[2];
                    const user = message.mentions.users.first() || message.client.users.cache.get(targetArg);

                    if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user: `!antinuke wl remove @user`")], V2_RED)] });

                    if (config.whitelisted.includes(user.id)) {
                        config.whitelisted = config.whitelisted.filter(id => id !== user.id);
                        saveDB(db);
                        return message.reply({
                            content: null, flags: V2.flag,
                            components: [V2.container([
                                V2.section([
                                    V2.heading("🗑️ CLEARANCE REVOKED", 2),
                                    V2.text(`**Target:** ${user.tag}\n**Status:** Unwhitelisted\n> Standard security countermeasures now apply to this user.`)
                                ], user.displayAvatarURL({ dynamic: true }))
                            ], V2_RED)]
                        });
                    } else {
                        return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ User is not currently whitelisted.")], "#FFCC00")] });
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
                                    message.client.user.displayAvatarURL({ dynamic: true })
                                )
                            ], V2_BLUE)]
                        });
                    }

                    const wlList = config.whitelisted.map(id => `> <@${id}> (\`${id}\`)`).join("\n");

                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.section([
                                V2.heading("🛡️ IMPERIAL AGENT REGISTRY", 2),
                                V2.text("**Authorized Personnel with Anti-Nuke Immunity:**")
                            ], message.guild.iconURL({ dynamic: true })),
                            V2.text("\u200b"),
                            V2.text(wlList),
                            V2.separator(),
                            V2.text("*BlueSealPrime Identity Protocol*")
                        ], V2_BLUE)]
                    });
                }
            }

            // ───── UNWHITELIST ALIAS ─────
            if (sub === "unwhitelist") {
                const targetArg = args[1];
                const user = message.mentions.users.first() || message.client.users.cache.get(targetArg);

                if (!user) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a user: `!antinuke unwhitelist @user`")], V2_RED)] });

                if (config.whitelisted.includes(user.id)) {
                    config.whitelisted = config.whitelisted.filter(id => id !== user.id);
                    saveDB(db);
                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.section([
                                V2.heading("🗑️ CLEARANCE REVOKED", 2),
                                V2.text(`**Target:** ${user.tag}\n**Status:** Unwhitelisted\n> Standard security countermeasures now apply to this user.`)
                            ], user.displayAvatarURL({ dynamic: true }))
                        ], V2_RED)]
                    });
                } else {
                    return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("ℹ️ User is not currently whitelisted.")], "#FFCC00")] });
                }
            }

            // ───── HELP MENU ─────
            const container = V2.container([
                V2.section([
                    V2.heading("🛡️ SOVEREIGN SHIELD OS", 2),
                    V2.text("Configure advanced anti-nuke countermeasures.")
                ], message.client.user.displayAvatarURL({ dynamic: true })),
                V2.separator(),
                V2.text(
                    "> `!antinuke on` | `!antinuke off`\n" +
                    "> `!antinuke status`\n" +
                    "> `!antinuke autorestore <on|off>`\n" +
                    "> `!antinuke wl add @user`\n" +
                    "> `!antinuke wl remove @user`\n" +
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
