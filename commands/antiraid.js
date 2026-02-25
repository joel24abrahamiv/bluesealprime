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


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ANTIRAID
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("antiraid") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "antiraid", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
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

            // ───── EDIT (Slash Command Shim) ─────
            if (subCommand === "edit") {
                const nextArgs = args.slice(1);
                if (nextArgs[0] === "config") {
                    return module.exports.execute(message, nextArgs, commandName);
                }
                return;
            }

            // ───── STATUS / VIEW ─────
            if (!subCommand || subCommand === "status" || subCommand === "view") {
                const unifiedContainer = V2.container([
                    V2.section(
                        [
                            V2.heading("🛡️ ANTI-RAID DIAGNOSTICS", 2),
                            V2.text(`**Global State:** ${guildConfig.enabled ? "✅ ACTIVE" : "❌ INACTIVE"}`)
                        ],
                        "https://cdn-icons-png.flaticon.com/512/929/929429.png"
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "antiraid", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] antiraid.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "antiraid", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("antiraid", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`antiraid\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }


    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_962
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_376
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_82
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_847
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_763
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_386
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_29
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_268
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_840
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_497
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_402
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_602
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_119
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_672
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_532
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_402
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_760
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_648
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_957
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_997
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_186
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_916
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_584
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_473
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_458
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_86
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_271
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_137
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_393
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_815
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_717
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_724
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_219
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_27
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_71
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_959
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_648
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_952
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_575
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_711
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_465
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_965
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_286
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_745
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_197
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_271
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_160
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_36
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_528
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_595
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_229
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_661
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_768
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_155
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_705
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_141
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_323
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_15
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_603
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_205
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_397
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_8
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_609
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_112
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_79
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_448
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_228
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_890
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_983
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_663
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_472
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_594
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_775
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_603
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_215
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_747
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_191
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_705
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_459
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_916
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_179
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_273
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_213
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_848
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_307
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_957
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_7
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_549
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_950
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_769
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_157
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_129
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_659
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_685
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_425
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_497
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_19
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_886
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_360
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ANTIRAID_ID_536
     */

};