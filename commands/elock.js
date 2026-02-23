const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "elock",
    description: "God Mode Lock Commands (Owner Only)",
    aliases: ["el"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ELOCK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("elock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "elock", cooldown);
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
                components: [V2.container([V2.text("⚠️ **Usage:** `!elock <type> [args]`\nTypes: `role`, `media`, `threads`, `embeds`, `links`, `botcmds`")], V2_RED)]
            });
        }

        const type = args[0].toLowerCase();
        const channel = message.channel;
        const guild = message.guild;

        try {
            // 1. ROLE LOCK
            if (type === "role") {
                const role = message.mentions.roles.first() || guild.roles.cache.get(args[1]);
                if (!role) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ **Error:** Target role not found.")], V2_RED)] });

                await channel.permissionOverwrites.edit(role, { SendMessages: false }, { reason: "God Lock: Role Muted" });
                const roleLock = V2.container([
                    V2.section([
                        V2.heading("🔒 CHANNEL SECURED", 2),
                        V2.text(`**Protocol:** Role Lockdown\n**Target:** ${role}\n**Status:** \`MUTED\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3064/3064155.png")
                ], V2_RED);
                return message.channel.send({ content: null, components: [roleLock] });
            }

            // 2. MEDIA LOCK
            if (type === "media") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    AttachFiles: false,
                    EmbedLinks: false
                }, { reason: "God Lock: Media Restricted" });
                const mediaLock = V2.container([
                    V2.section([
                        V2.heading("🔒 MEDIA PROTOCOL", 2),
                        V2.text(`**Filter:** Content Suppression\n**Scope:** @everyone\n**Status:** \`DISABLED\``)
                    ], "https://cdn-icons-png.flaticon.com/512/3342/3342137.png")
                ], V2_RED);
                return message.channel.send({ content: null, components: [mediaLock] });
            }

            // 3. THREADS LOCK
            if (type === "threads") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    SendMessagesInThreads: false
                }, { reason: "God Lock: Threads Restricted" });
                const threadLock = V2.container([
                    V2.section([
                        V2.heading("🔒 THREAD PROTOCOL", 2),
                        V2.text(`**System:** Thread Management\n**Scope:** @everyone\n**Status:** \`DISABLED\``)
                    ], "https://cdn-icons-png.flaticon.com/512/5968/5968853.png")
                ], V2_RED);
                return message.channel.send({ content: null, components: [threadLock] });
            }

            // 4. EMBEDS LOCK
            if (type === "embeds") {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    EmbedLinks: false
                }, { reason: "God Lock: Embeds Restricted" });
                const embedLock = V2.container([
                    V2.section([
                        V2.heading("🔒 EMBED PROTOCOL", 2),
                        V2.text(`**Visuals:** Rich Link Filter\n**Scope:** @everyone\n**Status:** \`DISABLED\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2164/2164327.png")
                ], V2_RED);
                return message.channel.send({ content: null, components: [embedLock] });
            }

            // 5. LINKS LOCK
            if (type === "links") {
                updateRestricted(guild.id, channel.id, "links", true);
                const linkLock = V2.container([
                    V2.section([
                        V2.heading("🔒 LINK PROTOCOL", 2),
                        V2.text(`**Defense:** Anti-Link Pulse\n**Zone:** ${channel}\n**Status:** \`ACTIVE_VAPORIZE\``)
                    ], "https://cdn-icons-png.flaticon.com/512/2088/2088617.png")
                ], V2_RED);
                return message.channel.send({ content: null, components: [linkLock] });
            }

            // 6. BOT CMDS LOCK
            if (type === "botcmds") {
                const targetRole = message.mentions.roles.first() || (args[1] ? guild.roles.cache.get(args[1]) : null);

                if (targetRole) {
                    updateRestricted(guild.id, targetRole.id, "botcmds_role", true);
                    const botRoleLock = V2.container([
                        V2.section([
                            V2.heading("🔒 BOT PROTOCOL", 2),
                            V2.text(`**Clearance:** Command Override\n**Target:** ${targetRole}\n**Status:** \`RESTRICTED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_RED);
                    return message.channel.send({ content: null, components: [botRoleLock] });
                } else {
                    updateRestricted(guild.id, channel.id, "botcmds_channel", true);
                    const botChanLock = V2.container([
                        V2.section([
                            V2.heading("🔒 BOT PROTOCOL", 2),
                            V2.text(`**Zone Lock:** Command Vacuum\n**Channel:** ${channel}\n**Status:** \`LOCKED\``)
                        ], "https://cdn-icons-png.flaticon.com/512/2593/2593627.png")
                    ], V2_RED);
                    return message.channel.send({ content: null, components: [botChanLock] });
                }
            }
        } catch (e) {
            console.error(e);
            return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text(`❌ **Fault:** Failed to execute lock. \`${e.message}\``)], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "elock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] elock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "elock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("elock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`elock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ELOCK_ID_483
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ELOCK_ID_735
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ELOCK_ID_793
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ELOCK_ID_959
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ELOCK_ID_52
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ELOCK_ID_954
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ELOCK_ID_814
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ELOCK_ID_462
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ELOCK_ID_589
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ELOCK_ID_991
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ELOCK_ID_239
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ELOCK_ID_622
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ELOCK_ID_670
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ELOCK_ID_90
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ELOCK_ID_416
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ELOCK_ID_873
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ELOCK_ID_751
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ELOCK_ID_629
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ELOCK_ID_833
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ELOCK_ID_584
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ELOCK_ID_811
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ELOCK_ID_638
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ELOCK_ID_184
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ELOCK_ID_280
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ELOCK_ID_109
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ELOCK_ID_646
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ELOCK_ID_780
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ELOCK_ID_839
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ELOCK_ID_829
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ELOCK_ID_953
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ELOCK_ID_684
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ELOCK_ID_231
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ELOCK_ID_593
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ELOCK_ID_599
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ELOCK_ID_563
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ELOCK_ID_28
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ELOCK_ID_555
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ELOCK_ID_514
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ELOCK_ID_568
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ELOCK_ID_980
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ELOCK_ID_824
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ELOCK_ID_414
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ELOCK_ID_412
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ELOCK_ID_641
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ELOCK_ID_603
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ELOCK_ID_881
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ELOCK_ID_105
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ELOCK_ID_789
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ELOCK_ID_65
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ELOCK_ID_648
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ELOCK_ID_169
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ELOCK_ID_412
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ELOCK_ID_418
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ELOCK_ID_391
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ELOCK_ID_407
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ELOCK_ID_423
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ELOCK_ID_524
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ELOCK_ID_323
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ELOCK_ID_80
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ELOCK_ID_544
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ELOCK_ID_180
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ELOCK_ID_487
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ELOCK_ID_936
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ELOCK_ID_341
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ELOCK_ID_298
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ELOCK_ID_804
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ELOCK_ID_132
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ELOCK_ID_836
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ELOCK_ID_152
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ELOCK_ID_973
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ELOCK_ID_954
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ELOCK_ID_918
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ELOCK_ID_509
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ELOCK_ID_910
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ELOCK_ID_323
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ELOCK_ID_964
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ELOCK_ID_411
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ELOCK_ID_247
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ELOCK_ID_388
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ELOCK_ID_191
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ELOCK_ID_639
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ELOCK_ID_873
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ELOCK_ID_681
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ELOCK_ID_588
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ELOCK_ID_192
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ELOCK_ID_724
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ELOCK_ID_627
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ELOCK_ID_961
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ELOCK_ID_445
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ELOCK_ID_863
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ELOCK_ID_854
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ELOCK_ID_269
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ELOCK_ID_100
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ELOCK_ID_862
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ELOCK_ID_39
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ELOCK_ID_744
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ELOCK_ID_253
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ELOCK_ID_522
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ELOCK_ID_415
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ELOCK_ID_502
 */

};