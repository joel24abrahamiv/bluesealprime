const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "untimeout",
    description: "Remove timeout from a user",
    usage: "!untimeout @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNTIMEOUT
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("untimeout") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "untimeout", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **User not found.**")], V2_RED)] });

        try {
            if (!target.moderatable) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ I cannot remove the timeout from this user.")], V2_RED)] });
            await target.timeout(null, "Untimeout command");
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🔊 TIMEOUT REMOVED", 2),
                    V2.text(`**${target.user.tag}** has been released from isolation.\n> *Actioned by ${message.author.tag}*`)
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to remove timeout.** Check my role hierarchy.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "untimeout", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] untimeout.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "untimeout", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("untimeout", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`untimeout\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_241
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_772
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_969
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_536
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_411
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_265
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_179
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_384
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_337
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_489
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_428
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_689
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_269
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_101
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_90
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_637
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_304
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_174
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_816
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_445
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_990
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_640
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_244
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_852
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_250
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_702
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_670
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_558
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_149
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_272
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_167
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_318
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_558
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_100
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_708
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_102
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_870
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_399
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_626
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_460
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_165
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_482
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_692
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_997
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_882
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_524
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_425
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_8
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_221
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_46
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_186
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_473
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_470
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_650
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_664
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_542
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_253
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_611
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_146
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_244
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_389
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_686
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_532
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_62
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_100
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_911
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_386
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_294
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_34
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_255
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_496
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_709
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_623
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_182
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_540
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_946
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_501
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_509
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_217
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_962
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_509
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_949
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_864
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_496
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_955
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_115
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_379
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_444
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_829
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_201
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_80
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_566
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_894
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_43
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_74
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_732
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_750
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_383
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_32
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNTIMEOUT_ID_38
 */

};