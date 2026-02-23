const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlocksound",
    description: "Unlock the soundboard in the current channel",
    usage: "!unlocksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNLOCKSOUND
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("unlocksound") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "unlocksound", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { UseSoundboard: true, UseExternalSounds: true });
            await message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔊 **Soundboard Unlocked** in ${message.channel}.\nMembers can now play sounds again.`)], V2_BLUE)] });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to unlock soundboard. Check my permissions.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlocksound", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] unlocksound.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlocksound", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("unlocksound", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`unlocksound\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_43
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_640
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_163
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_71
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_399
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_813
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_656
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_364
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_425
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_637
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_953
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_226
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_109
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_745
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_956
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_579
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_419
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_93
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_422
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_855
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_635
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_552
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_876
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_917
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_139
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_68
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_596
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_706
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_881
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_880
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_62
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_352
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_58
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_857
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_619
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_901
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_774
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_700
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_318
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_105
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_643
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_362
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_797
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_551
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_716
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_818
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_603
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_266
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_522
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_236
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_413
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_77
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_275
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_775
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_103
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_446
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_724
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_832
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_227
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_973
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_203
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_895
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_218
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_660
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_507
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_784
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_542
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_247
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_571
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_428
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_980
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_212
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_492
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_979
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_880
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_254
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_81
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_850
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_147
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_583
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_688
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_482
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_910
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_579
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_350
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_276
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_42
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_836
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_491
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_185
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_131
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_46
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_123
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_152
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_772
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_889
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_455
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_94
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_31
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNLOCKSOUND_ID_588
 */

};