const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "lock",
    description: "Lock the current channel for @everyone",
    usage: "!lock [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LOCK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("lock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "lock", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const reason = args.join(" ") || "No reason provided";

        // Permission Check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** You need `Manage Channels` permission.")], V2_RED)]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **System Error:** I (Bot) need `Manage Channels` permission.")], V2_RED)]
            });
        }

        try {
            const everyoneRoleId = message.guild.id;

            // LOCK: Deny SendMessages for @everyone
            await message.channel.permissionOverwrites.edit(everyoneRoleId, {
                SendMessages: false
            }, { reason: `Locked by ${message.author.tag}: ${reason}` });

            // OPTIONAL: Ensure Owner can still talk (Explicit Allow)
            if (isBotOwner) {
                await message.channel.permissionOverwrites.edit(message.author.id, {
                    SendMessages: true
                });
            }

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🔒 CHANNEL LOCKED", 2),
                        V2.text(`**Status:** Lockdown Active\n**Sector:** ${message.channel.name}\n**Reason:** ${reason}`)
                    ],
                    "https://i.ibb.co/3ykjL78Y/lock-icon.png" // User provided lock icon
                ),
                V2.separator(),
                V2.text(`*BlueSealPrime Security Systems • ${new Date().toLocaleTimeString()}*`)
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Lock Failed:** Check bot permissions hierarchy.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "lock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] lock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "lock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("lock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`lock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LOCK_ID_618
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LOCK_ID_295
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LOCK_ID_147
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LOCK_ID_535
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LOCK_ID_318
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LOCK_ID_928
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LOCK_ID_176
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LOCK_ID_470
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LOCK_ID_93
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LOCK_ID_419
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LOCK_ID_693
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LOCK_ID_88
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LOCK_ID_760
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LOCK_ID_841
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LOCK_ID_296
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LOCK_ID_520
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LOCK_ID_886
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LOCK_ID_638
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LOCK_ID_780
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LOCK_ID_991
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LOCK_ID_211
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LOCK_ID_305
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LOCK_ID_902
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LOCK_ID_496
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LOCK_ID_601
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LOCK_ID_873
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LOCK_ID_480
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LOCK_ID_718
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LOCK_ID_156
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LOCK_ID_899
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LOCK_ID_360
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LOCK_ID_467
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LOCK_ID_736
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LOCK_ID_906
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LOCK_ID_133
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LOCK_ID_393
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LOCK_ID_826
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LOCK_ID_236
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LOCK_ID_400
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LOCK_ID_49
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LOCK_ID_985
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LOCK_ID_789
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LOCK_ID_903
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LOCK_ID_11
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LOCK_ID_495
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LOCK_ID_423
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LOCK_ID_846
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LOCK_ID_301
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LOCK_ID_366
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LOCK_ID_299
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LOCK_ID_23
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LOCK_ID_593
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LOCK_ID_16
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LOCK_ID_214
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LOCK_ID_94
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LOCK_ID_316
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LOCK_ID_341
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LOCK_ID_76
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LOCK_ID_771
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LOCK_ID_881
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LOCK_ID_240
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LOCK_ID_79
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LOCK_ID_913
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LOCK_ID_929
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LOCK_ID_782
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LOCK_ID_52
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LOCK_ID_388
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LOCK_ID_761
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LOCK_ID_199
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LOCK_ID_432
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LOCK_ID_843
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LOCK_ID_810
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LOCK_ID_227
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LOCK_ID_298
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LOCK_ID_399
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LOCK_ID_880
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LOCK_ID_159
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LOCK_ID_732
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LOCK_ID_285
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LOCK_ID_137
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LOCK_ID_743
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LOCK_ID_378
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LOCK_ID_661
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LOCK_ID_905
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LOCK_ID_43
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LOCK_ID_773
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LOCK_ID_862
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LOCK_ID_757
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LOCK_ID_562
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LOCK_ID_39
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LOCK_ID_985
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LOCK_ID_222
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LOCK_ID_314
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LOCK_ID_78
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LOCK_ID_325
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LOCK_ID_681
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LOCK_ID_492
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LOCK_ID_63
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LOCK_ID_565
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LOCK_ID_325
 */

};