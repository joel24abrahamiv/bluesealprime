const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "eunlock",
    description: "God Mode Unlock Commands (Owner Only)",
    aliases: ["eunl"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EUNLOCK
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
            }).catch(() => {});
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("eunlock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "eunlock", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        if (!args[0]) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Usage:** `!eunlock <type> [args]`\nTypes: `role`, `media`, `threads`, `embeds`, `links`, `botcmds`")], V2_RED)]
            });
        }

        const type = args[0].toLowerCase();
        const channel = message.channel;
        const guild = message.guild;

        try {
            // 1. ROLE UNLOCK
            if (type === "role") {
                const role = message.mentions.roles.first() || guild.roles.cache.get(args[1]);
                if (!role) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ **Error:** Target role not found.")], V2_RED)] });

                await channel.permissionOverwrites.delete(role, "God Unlock: Role Unmuted");
                const roleUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 CHANNEL UNLOCKED", 2),
                        V2.text(`**Protocol:** Role Restored\n**Target:** ${role}\n**Status:** \`CLEAR\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3064/3064197.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [roleUnlock] });
            }

            // 2. MEDIA UNLOCK
            if (type === "media") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    AttachFiles: null,
                    EmbedLinks: null
                }, { reason: "God Unlock: Media Restored" });
                const mediaUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 MEDIA PROTOCOL", 2),
                        V2.text(`**System:** Content Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3342/3342137.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [mediaUnlock] });
            }

            // 3. THREADS UNLOCK
            if (type === "threads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null,
                    SendMessagesInThreads: null
                }, { reason: "God Unlock: Threads Restored" });
                const threadUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 THREAD PROTOCOL", 2),
                        V2.text(`**System:** Thread Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/5968/5968853.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [threadUnlock] });
            }

            // 4. EMBEDS UNLOCK
            if (type === "embeds") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    EmbedLinks: null
                }, { reason: "God Unlock: Embeds Restored" });
                const embedUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 EMBED PROTOCOL", 2),
                        V2.text(`**System:** Visual Restoration\n**Scope:** @everyone\n**Status:** \`ALLOW\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2164/2164327.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [embedUnlock] });
            }

            // 5. LINKS UNLOCK
            if (type === "links") {
                updateRestricted(guild.id, channel.id, "links", false);
                const linkUnlock = V2.container([
                    V2.section([
                        V2.heading("🔓 LINK PROTOCOL", 2),
                        V2.text(`**Defense:** Anti-Link Pulse Disengaged\n**Zone:** ${channel}\n**Status:** \`CLEAR\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2088/2088617.png")
                ], V2_BLUE);
                return message.channel.send({ content: null, components: [linkUnlock] });
            }

            // 6. BOT CMDS UNLOCK
            if (type === "botcmds") {
                const targetRole = message.mentions.roles.first() || (args[1] ? guild.roles.cache.get(args[1]) : null);

                if (targetRole) {
                    updateRestricted(guild.id, targetRole.id, "botcmds_role", false);
                    const botRoleUnlock = V2.container([
                        V2.section([
                            V2.heading("🔓 BOT PROTOCOL", 2),
                            V2.text(`**Clearance:** Command Restoration\n**Target:** ${targetRole}\n**Status:** \`AUTHORIZED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_BLUE);
                    return message.channel.send({ content: null, components: [botRoleUnlock] });
                } else {
                    updateRestricted(guild.id, channel.id, "botcmds_channel", false);
                    const botChanUnlock = V2.container([
                        V2.section([
                            V2.heading("🔓 BOT PROTOCOL", 2),
                            V2.text(`**Zone Clear:** Command Vacuum Repaired\n**Channel:** ${channel}\n**Status:** \`AUTHORIZED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_BLUE);
                    return message.channel.send({ content: null, components: [botChanUnlock] });
                }
            }
        } catch (e) {
            console.error(e);
            return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text(`❌ **Fault:** Failed to execute unlock. \`${e.message}\``)], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "eunlock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] eunlock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "eunlock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("eunlock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`eunlock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_687
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_950
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_669
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_606
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_344
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_600
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_576
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_932
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_669
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_213
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_989
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_20
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_310
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_669
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_579
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_549
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_167
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_48
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_112
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_668
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_396
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_335
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_374
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_903
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_560
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_441
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_618
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_621
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_304
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_915
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_37
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_766
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_817
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_585
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_611
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_186
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_732
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_929
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_603
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_324
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_101
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_585
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_368
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_342
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_131
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_538
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_697
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_201
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_206
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_335
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_149
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_341
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_272
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_168
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_75
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_775
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_435
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_557
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_606
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_3
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_924
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_875
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_578
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_443
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_977
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_210
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_830
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_975
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_143
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_22
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_70
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_65
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_443
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_648
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_551
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_718
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_164
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_894
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_395
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_367
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_142
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_125
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_902
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_907
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_582
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_925
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_306
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_985
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_352
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_51
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_581
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_651
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_775
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_282
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_757
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_428
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_376
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_803
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_761
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EUNLOCK_ID_58
 */

};