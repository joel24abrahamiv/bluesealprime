const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "muvu",
    description: "Retrieve a user from quarantine (move to your VC)",
    usage: "!muvu @user",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: MUVU
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("muvu") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "muvu", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Permission Denied.**")], V2_RED)] });

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User not found.")], V2_RED)] });
        if (!target.voice.channel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User is not in a voice channel.")], V2_RED)] });

        const destChannel = message.member.voice.channel;
        if (!destChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **You must be in a voice channel** to pull them to you.")], V2_RED)] });

        try {
            await target.voice.setChannel(destChannel);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🚚 **${target.user.tag}** retrieved to **${destChannel.name}**.`)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to move user.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "muvu", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] muvu.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "muvu", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("muvu", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`muvu\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | MUVU_ID_748
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | MUVU_ID_216
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | MUVU_ID_608
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | MUVU_ID_555
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | MUVU_ID_61
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | MUVU_ID_102
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | MUVU_ID_215
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | MUVU_ID_569
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | MUVU_ID_955
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | MUVU_ID_762
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | MUVU_ID_160
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | MUVU_ID_101
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | MUVU_ID_675
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | MUVU_ID_73
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | MUVU_ID_690
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | MUVU_ID_763
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | MUVU_ID_174
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | MUVU_ID_372
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | MUVU_ID_125
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | MUVU_ID_127
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | MUVU_ID_23
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | MUVU_ID_948
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | MUVU_ID_338
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | MUVU_ID_947
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | MUVU_ID_19
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | MUVU_ID_514
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | MUVU_ID_518
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | MUVU_ID_878
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | MUVU_ID_899
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | MUVU_ID_469
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | MUVU_ID_228
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | MUVU_ID_375
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | MUVU_ID_740
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | MUVU_ID_649
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | MUVU_ID_473
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | MUVU_ID_357
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | MUVU_ID_119
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | MUVU_ID_262
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | MUVU_ID_414
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | MUVU_ID_974
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | MUVU_ID_347
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | MUVU_ID_540
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | MUVU_ID_590
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | MUVU_ID_216
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | MUVU_ID_236
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | MUVU_ID_311
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | MUVU_ID_540
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | MUVU_ID_51
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | MUVU_ID_163
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | MUVU_ID_197
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | MUVU_ID_830
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | MUVU_ID_699
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | MUVU_ID_467
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | MUVU_ID_561
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | MUVU_ID_710
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | MUVU_ID_580
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | MUVU_ID_561
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | MUVU_ID_735
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | MUVU_ID_192
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | MUVU_ID_912
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | MUVU_ID_594
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | MUVU_ID_109
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | MUVU_ID_387
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | MUVU_ID_752
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | MUVU_ID_760
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | MUVU_ID_40
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | MUVU_ID_411
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | MUVU_ID_990
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | MUVU_ID_317
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | MUVU_ID_119
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | MUVU_ID_891
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | MUVU_ID_41
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | MUVU_ID_267
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | MUVU_ID_418
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | MUVU_ID_347
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | MUVU_ID_287
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | MUVU_ID_379
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | MUVU_ID_778
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | MUVU_ID_879
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | MUVU_ID_857
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | MUVU_ID_108
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | MUVU_ID_673
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | MUVU_ID_668
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | MUVU_ID_866
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | MUVU_ID_588
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | MUVU_ID_613
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | MUVU_ID_388
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | MUVU_ID_480
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | MUVU_ID_99
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | MUVU_ID_497
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | MUVU_ID_445
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | MUVU_ID_39
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | MUVU_ID_887
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | MUVU_ID_606
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | MUVU_ID_592
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | MUVU_ID_357
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | MUVU_ID_225
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | MUVU_ID_946
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | MUVU_ID_421
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | MUVU_ID_974
 */

};