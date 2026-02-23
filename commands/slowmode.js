const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "slowmode",
    description: "Set channel slowmode",
    usage: "!slowmode <seconds>",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SLOWMODE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("slowmode") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "slowmode", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const time = parseInt(args[0]);
        if (isNaN(time)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Please specify a time in seconds. Use `0` to disable.")], V2_RED)] });

        try {
            await message.channel.setRateLimitPerUser(time);
            const msg = time === 0
                ? "✅ **Slowmode disabled** for this channel."
                : `⏱️ **Slowmode set to ${time}s** — members must wait between messages.`;
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(msg)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Error setting slowmode. Check permissions.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "slowmode", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] slowmode.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "slowmode", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("slowmode", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`slowmode\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_365
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_176
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_382
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_762
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_328
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_999
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_987
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_338
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_529
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_654
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_981
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_404
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_499
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_920
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_984
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_222
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_689
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_43
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_953
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_910
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_638
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_931
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_710
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_728
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_490
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_777
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_836
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_542
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_443
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_982
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_661
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_792
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_475
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_980
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_647
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_265
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_79
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_142
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_636
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_876
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_165
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_638
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_111
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_599
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_480
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_374
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_875
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_830
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_975
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_217
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_609
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_301
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_467
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_373
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_32
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_81
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_935
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_883
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_589
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_381
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_596
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_918
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_566
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_701
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_672
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_119
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_581
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_77
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_604
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_692
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_868
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_492
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_945
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_694
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_69
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_737
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_896
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_633
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_63
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_991
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_965
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_164
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_268
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_500
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_436
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_87
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_839
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_646
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_372
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_593
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_801
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_288
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_569
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_90
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_843
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_979
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_221
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_153
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_69
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SLOWMODE_ID_376
 */

};