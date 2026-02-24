const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "ehelp",
    description: "God Mode Commands (Interactive Menu)",
    aliases: ["eh"],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EHELP
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("ehelp") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "ehelp", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

            if (!global.GOD_MODE) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("⚠️ **GOD MODE REQUIRED:** Execute `!eval` to toggle system override.")], V2_RED)]
                });
            }

            const clientUser = message.client.user;

            const categories = [
                {
                    label: "Root Home",
                    value: "home",
                    emoji: "🏠",
                    description: "Return to Main Menu",
                    content: [
                        V2.heading("🔒 GOD MODE INTELLIGENCE PANEL", 2),
                        V2.text(
                            `**System Override Active.**\n` +
                            `Access to restricted kernel commands.\n\n` +
                            `**Select a module below:**\n` +
                            `• 🛡️ **System & Core** (Stats, Evaluation, Control)\n` +
                            `• 📡 **Broadcasting** (ANNOC, Identity, Avatar)\n` +
                            `• ⚡ **Elite Operations** (Mass Ops, Nuke, Purge)\n` +
                            `• 🔒 **Security & Locks** (God-Locks, Audit, Auth)\n` +
                            `• 👑 **Authority & Trust** (Owners, Registry, Global)\n` +
                            `• 💾 **Archival Protocols** (Backups, Restoration)\n` +
                            `• 🛰️ **Diagnostic Protocols** (Ping, Trace, Integrities)`
                        )
                    ]
                },
                {
                    label: "System & Core",
                    value: "system",
                    emoji: "🛡️",
                    description: "Stats, Diagnostics, Control",
                    content: [
                        V2.heading("🛡️ SYSTEM & CORE MODULE", 2),
                        V2.heading("📊 [ METRICS_LOAD ]", 3),
                        V2.text("> • **eram** / **estats** - Check resources\n> • **eusers** - Global population trace\n> • **ping** - Latency heartbeat"),
                        V2.heading("⚙️ [ KERNEL_CONTROL ]", 3),
                        V2.text("> • **eval** - Direct logic execution\n> • **exec** - Shell terminal access\n> • **ediagnose** - Integrity scan\n> • **estop** / **eexit** - Process kill")
                    ]
                },
                {
                    label: "Broadcasting",
                    value: "broadcasting",
                    emoji: "📡",
                    description: "Announcement & Identity",
                    content: [
                        V2.heading("📡 BROADCASTING MODULE", 2),
                        V2.heading("📢 [ NEURAL_COMMS ]", 3),
                        V2.text("> • **eannoc <msg>** - Global Neural Broadcast\n> • **announce <#ch> <msg>** - Node Announcement\n> • **say <msg>** - Forced speech"),
                        V2.heading("👁️ [ IDENTITY_SHAPING ]", 3),
                        V2.text("> • **setguildavatar** - Change node avatar\n> • **setguildbanner** - Change node banner\n> • **debugavatar** - Troubleshoot Identity")
                    ]
                },
                {
                    label: "Elite Operations",
                    value: "elite",
                    emoji: "⚡",
                    description: "Mass Destruction & Ops",
                    content: [
                        V2.heading("⚡ ELITE OPERATIONS MODULE", 2),
                        V2.heading("🌊 [ MASS_DELETION ]", 3),
                        V2.text("> • **massban <ids>** - Target deletion\n> • **massrole <r> <ids>** - Bulk assignment\n> • **purgebots** - Cleanse unauthorized entities"),
                        V2.heading("☢️ [ NUCLEAR_PROTOCOL ]", 3),
                        V2.text("> • **enuke** - High-yield shard destruction\n> • **edeleteserver** - ⚠️ **NODE EXTINCTION**")
                    ]
                },
                {
                    label: "Security & Locks",
                    value: "security",
                    emoji: "🔒",
                    description: "Locks, Audits, Panic",
                    content: [
                        V2.heading("🔒 SECURITY & LOCKS MODULE", 2),
                        V2.heading("⛓️ [ GOD_LOCKS ]", 3),
                        V2.text("> • **elock <type>** - Lock Media/Links/Cmds\n> • **eunlock <type>** - Lift lockdown\n> • **emassch <add/remove>** - Bulk channel work"),
                        V2.heading("🛡️ [ DEFENSE_ANALYSIS ]", 3),
                        V2.text("> • **audit** / **scan** - Security assessment\n> • **flagged** - Threat tracking\n> • **panic** - Immediate server shutdown")
                    ]
                },
                {
                    label: "Authority & Trust",
                    value: "trust",
                    emoji: "👑",
                    description: "Management & Hierarchy",
                    content: [
                        V2.heading("👑 AUTHORITY & TRUST MODULE", 2),
                        V2.heading("🤝 [ TRUST_DELEGATION ]", 3),
                        V2.text("> • **addowner** / **delowner** - Manage Acting Owners\n> • **listowners** - View local hierarchy\n> • **elistowners** - View global manifest"),
                        V2.heading("👁️ [ VISUAL_VERIFY ]", 3),
                        V2.text("> • **tmpdisplay** - Security alert preview\n> • **welcome test** / **left test**")
                    ]
                },
                {
                    label: "Archival Protocols",
                    value: "archival",
                    emoji: "💾",
                    description: "Backups & Restoration",
                    content: [
                        V2.heading("💾 ARCHIVAL PROTOCOLS MODULE", 2),
                        V2.heading("📦 [ SNAPSHOT_STORAGE ]", 3),
                        V2.text("> • **backup create** - Structural DNA save\n> • **backup restore** - Deploy blueprint\n> • **backuplist** - Catalog snapshots"),
                        V2.heading("🛰️ [ ADVANCED_VECTORS ]", 3),
                        V2.text("> • **recovery** - Trigger emergency restoration\n> • **safetybackup** - Extract core logic mapping")
                    ]
                },
                {
                    label: "Diagnostic Protocols",
                    value: "diagnostics",
                    emoji: "🛰️",
                    description: "Module Integrity & Verifications",
                    content: [
                        V2.heading("🛰️ DIAGNOSTIC PROTOCOLS MODULE", 2),
                        V2.heading("📡 [ SYSTEM_VERIFICATION ]", 3),
                        V2.text("> • **ping** - Core latency and status\n> • **debugavatar** - Troubleshoot and sync identity\n> • **ediagnose** - Deep Module Integrity Scan")
                    ]
                }
            ];

            const createV2Panel = (pageIdx) => {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("ehelp_select")
                    .setPlaceholder("💠 INITIALIZE ROOT MODULE")
                    .addOptions(categories.map((cat, index) => ({
                        label: cat.label,
                        value: cat.value,
                        emoji: cat.emoji,
                        description: cat.description,
                        default: index === pageIdx
                    })));

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("ehelp_prev")
                        .setLabel("Back")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === 0),
                    new ButtonBuilder()
                        .setCustomId("ehelp_home")
                        .setLabel("Home")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === 0),
                    new ButtonBuilder()
                        .setCustomId("ehelp_stop")
                        .setLabel("Terminate")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("ehelp_next")
                        .setLabel("Next")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === categories.length - 1)
                );

                const menuRow = new ActionRowBuilder().addComponents(selectMenu);
                const current = categories[pageIdx];

                return V2.container([
                    V2.section([
                        V2.heading("GOD MODE INTELLIGENCE PANEL", 1),
                        V2.text(`\`\`\`yml\nStatus: System Override Active\nSession: Architect Mode\n\`\`\``)
                    ], clientUser.displayAvatarURL({ forceStatic: true, extension: 'png' })),
                    V2.separator(),
                    ...current.content,
                    V2.separator(),
                    menuRow,
                    buttons,
                    V2.text("*BlueSealPrime • Root Access Protocol*")
                ], V2_BLUE);
            };

            let currentIndex = 0;
            const msg = await message.reply({
                content: null,
                flags: V2.flag,
                components: [createV2Panel(currentIndex)]
            });

            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 300000
            });

            collector.on("collect", async i => {
                if (i.customId === "ehelp_select") {
                    currentIndex = categories.findIndex(c => c.value === i.values[0]);
                } else if (i.customId === "ehelp_prev") {
                    currentIndex = Math.max(0, currentIndex - 1);
                } else if (i.customId === "ehelp_next") {
                    currentIndex = Math.min(categories.length - 1, currentIndex + 1);
                } else if (i.customId === "ehelp_home") {
                    currentIndex = 0;
                } else if (i.customId === "ehelp_stop") {
                    await i.update({ components: [] });
                    return collector.stop();
                }

                await i.update({
                    components: [createV2Panel(currentIndex)]
                });
            });

            collector.on("end", (_, reason) => {
                if (reason !== "user") {
                    msg.edit({ components: [] }).catch(() => { });
                }
            });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ehelp", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] ehelp.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ehelp", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("ehelp", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`ehelp\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EHELP_ID_919
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EHELP_ID_50
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EHELP_ID_987
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EHELP_ID_224
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EHELP_ID_134
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EHELP_ID_200
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EHELP_ID_19
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EHELP_ID_251
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EHELP_ID_513
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EHELP_ID_585
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EHELP_ID_15
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EHELP_ID_455
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EHELP_ID_442
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EHELP_ID_956
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EHELP_ID_547
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EHELP_ID_971
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EHELP_ID_610
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EHELP_ID_200
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EHELP_ID_592
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EHELP_ID_281
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EHELP_ID_604
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EHELP_ID_581
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EHELP_ID_954
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EHELP_ID_992
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EHELP_ID_874
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EHELP_ID_703
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EHELP_ID_234
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EHELP_ID_788
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EHELP_ID_790
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EHELP_ID_664
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EHELP_ID_368
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EHELP_ID_880
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EHELP_ID_631
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EHELP_ID_777
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EHELP_ID_434
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EHELP_ID_296
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EHELP_ID_600
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EHELP_ID_231
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EHELP_ID_252
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EHELP_ID_310
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EHELP_ID_301
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EHELP_ID_141
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EHELP_ID_61
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EHELP_ID_432
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EHELP_ID_405
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EHELP_ID_100
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EHELP_ID_42
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EHELP_ID_129
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EHELP_ID_710
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EHELP_ID_795
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EHELP_ID_6
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EHELP_ID_174
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EHELP_ID_665
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EHELP_ID_367
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EHELP_ID_854
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EHELP_ID_70
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EHELP_ID_685
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EHELP_ID_875
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EHELP_ID_997
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EHELP_ID_413
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EHELP_ID_278
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EHELP_ID_662
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EHELP_ID_78
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EHELP_ID_690
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EHELP_ID_258
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EHELP_ID_220
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EHELP_ID_494
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EHELP_ID_819
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EHELP_ID_348
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EHELP_ID_832
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EHELP_ID_489
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EHELP_ID_469
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EHELP_ID_189
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EHELP_ID_515
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EHELP_ID_358
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EHELP_ID_625
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EHELP_ID_83
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EHELP_ID_724
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EHELP_ID_397
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EHELP_ID_91
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EHELP_ID_740
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EHELP_ID_472
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EHELP_ID_504
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EHELP_ID_519
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EHELP_ID_220
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EHELP_ID_729
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EHELP_ID_39
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EHELP_ID_24
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EHELP_ID_518
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EHELP_ID_192
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EHELP_ID_190
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EHELP_ID_657
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EHELP_ID_130
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EHELP_ID_167
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EHELP_ID_535
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EHELP_ID_54
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EHELP_ID_829
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EHELP_ID_43
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EHELP_ID_487
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EHELP_ID_998
     */

};