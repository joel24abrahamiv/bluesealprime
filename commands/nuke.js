const { BOT_OWNER_ID, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "nuke",
    description: "Nuke the current channel (Delete & Recreate)",
    usage: "!nuke",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: NUKE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("nuke") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "nuke", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            // Permission Check (Owner Bypass)
            if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.section([V2.heading("🚫 MISSING PERMISSIONS", 2), V2.text("I do not have permission to manage channels.")])], V2_RED)]
                });
            }

            const channel = message.channel;

            // Safety check: Don't nuke important channels if possible? 
            // For now, we trust the user.

            try {
                // Confirm Clone
                const originalPosition = channel.position;

                // Clone the channel
                const newChannel = await channel.clone({
                    position: originalPosition
                });

                // ♻️ SMART UPDATE: Check if this was a log channel and update DB
                const fs = require("fs");
                const path = require("path");
                const LOGS_DB = path.join(__dirname, "../data/logs.json");

                if (fs.existsSync(LOGS_DB)) {
                    try {
                        let data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
                        let guildData = data[message.guild.id];
                        let updated = false;

                        if (guildData) {
                            for (const [key, val] of Object.entries(guildData)) {
                                if (val === channel.id) {
                                    guildData[key] = newChannel.id; // Update ID
                                    updated = true;
                                }
                            }
                        }

                        if (updated) {
                            fs.writeFileSync(LOGS_DB, JSON.stringify(data, null, 2));
                        }
                    } catch (e) {
                        console.error("Smart Nuke Fail:", e);
                    }
                }

                // Delete the old channel
                try {
                    await channel.delete(`Nuked by ${message.author.tag}`);
                } catch (e) {
                    // If it's already deleted (10003), ignore it. 
                    if (e.code !== 10003) throw e;
                }



            } catch (err) {
                console.error("Nuke Command Error:", err);
                // If the old channel still exists, try to reply
                try {
                    const ch = await message.guild.channels.fetch(message.channel.id).catch(() => null);
                    if (ch) {
                        await ch.send({
                            content: null,
                            flags: V2.flag,
                            components: [V2.container([V2.section([V2.heading("❌ NUKE FAILED", 2), V2.text(err.message)], V2.botAvatar(message))], V2_RED)]
                        });
                    }
                } catch (e) { }
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "nuke", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] nuke.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "nuke", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("nuke", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`nuke\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | NUKE_ID_364
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | NUKE_ID_854
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | NUKE_ID_268
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | NUKE_ID_284
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | NUKE_ID_902
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | NUKE_ID_422
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | NUKE_ID_632
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | NUKE_ID_519
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | NUKE_ID_180
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | NUKE_ID_531
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | NUKE_ID_497
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | NUKE_ID_88
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | NUKE_ID_885
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | NUKE_ID_854
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | NUKE_ID_398
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | NUKE_ID_832
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | NUKE_ID_997
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | NUKE_ID_564
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | NUKE_ID_877
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | NUKE_ID_742
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | NUKE_ID_758
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | NUKE_ID_792
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | NUKE_ID_75
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | NUKE_ID_10
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | NUKE_ID_78
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | NUKE_ID_470
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | NUKE_ID_713
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | NUKE_ID_256
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | NUKE_ID_410
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | NUKE_ID_716
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | NUKE_ID_67
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | NUKE_ID_755
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | NUKE_ID_456
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | NUKE_ID_6
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | NUKE_ID_551
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | NUKE_ID_414
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | NUKE_ID_822
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | NUKE_ID_992
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | NUKE_ID_44
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | NUKE_ID_417
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | NUKE_ID_417
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | NUKE_ID_674
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | NUKE_ID_607
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | NUKE_ID_820
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | NUKE_ID_15
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | NUKE_ID_138
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | NUKE_ID_826
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | NUKE_ID_971
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | NUKE_ID_701
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | NUKE_ID_863
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | NUKE_ID_331
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | NUKE_ID_548
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | NUKE_ID_147
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | NUKE_ID_298
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | NUKE_ID_55
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | NUKE_ID_466
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | NUKE_ID_388
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | NUKE_ID_217
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | NUKE_ID_635
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | NUKE_ID_529
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | NUKE_ID_416
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | NUKE_ID_120
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | NUKE_ID_419
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | NUKE_ID_110
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | NUKE_ID_863
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | NUKE_ID_365
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | NUKE_ID_851
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | NUKE_ID_770
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | NUKE_ID_646
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | NUKE_ID_799
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | NUKE_ID_407
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | NUKE_ID_864
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | NUKE_ID_815
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | NUKE_ID_160
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | NUKE_ID_444
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | NUKE_ID_580
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | NUKE_ID_115
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | NUKE_ID_753
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | NUKE_ID_546
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | NUKE_ID_919
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | NUKE_ID_122
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | NUKE_ID_469
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | NUKE_ID_186
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | NUKE_ID_121
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | NUKE_ID_902
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | NUKE_ID_618
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | NUKE_ID_481
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | NUKE_ID_940
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | NUKE_ID_387
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | NUKE_ID_432
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | NUKE_ID_334
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | NUKE_ID_358
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | NUKE_ID_690
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | NUKE_ID_920
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | NUKE_ID_610
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | NUKE_ID_402
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | NUKE_ID_761
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | NUKE_ID_891
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | NUKE_ID_638
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | NUKE_ID_990
     */

};