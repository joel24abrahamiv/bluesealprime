const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "locksound",
    description: "Lock the soundboard in the current channel",
    usage: "!locksound",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LOCKSOUND
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("locksound") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "locksound", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { UseSoundboard: false, UseExternalSounds: false });
            await message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔇 **Soundboard Locked** in ${message.channel}.\nMembers can no longer play sounds in this channel.`)], V2_RED)] });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to lock soundboard. Check my permissions.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "locksound", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] locksound.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "locksound", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("locksound", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`locksound\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_726
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_250
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_597
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_224
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_696
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_271
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_979
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_382
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_438
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_877
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_928
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_991
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_341
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_277
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_325
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_240
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_492
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_773
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_14
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_244
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_678
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_445
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_309
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_621
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_601
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_974
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_450
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_157
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_913
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_58
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_803
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_256
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_814
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_454
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_705
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_188
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_749
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_516
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_32
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_81
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_115
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_311
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_24
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_65
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_280
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_676
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_752
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_584
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_36
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_680
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_49
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_855
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_65
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_544
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_259
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_52
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_352
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_145
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_35
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_162
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_260
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_970
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_79
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_314
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_492
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_658
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_949
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_617
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_25
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_163
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_719
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_288
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_997
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_159
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_702
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_605
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_478
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_216
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_390
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_856
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_556
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_80
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_389
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_918
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_290
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_229
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_112
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_464
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_743
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_527
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_772
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_244
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_917
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_389
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_407
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_692
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_775
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_824
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_949
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LOCKSOUND_ID_586
 */

};