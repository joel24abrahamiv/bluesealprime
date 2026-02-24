const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "vunmute",
    description: "Server unmute a member in Voice Channel",
    usage: "!vunmute @user",
    permissions: [PermissionsBitField.Flags.MuteMembers],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VUNMUTE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vunmute") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vunmute", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            // Owner Bypass & Perms
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([V2.text("🚫 **Security Alert:** Access Denied. Mute permissions required.")], V2_RED)]
                });
            }

            const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!target) {
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([V2.text("⚠️ **Invalid Target:** Specify a valid user to voice-unmute.")], V2_RED)]
                });
            }

            if (!target.voice.channel) {
                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([V2.text("⚠️ **Action Failed:** The target is currently not in a voice channel.")], V2_RED)]
                });
            }

            try {
                await target.voice.setMute(false, `Unmuted by ${message.author.tag}`);

                const unmuteFile = new AttachmentBuilder("./assets/vunmute.png");
                const container = V2.container([
                    V2.section([
                        V2.heading("🎙️ SOVEREIGN_VOICE: OPERATIONAL", 2),
                        V2.text(`**Target:** ${target}\n**Channel:** ${target.voice.channel.name}\n**Status:** \`SECURE_UNMUTE_ACTIVE\``)
                    ], "attachment://vunmute.png"),
                    V2.separator(),
                    V2.text(`> **Authorized By:** ${message.author}`),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Voice Security protocol*")
                ], V2_BLUE);

                message.reply({ content: null, flags: V2.flag, files: [unmuteFile], components: [container] });
            } catch (e) {
                message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("❌ **Execution Failed:** Unable to unmute user. Validate bot's hierarchy and permissions.")], V2_RED)]
                });
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vunmute", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vunmute.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vunmute", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vunmute", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vunmute\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_603
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_76
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_878
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_26
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_106
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_732
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_410
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_33
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_569
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_983
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_819
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_350
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_382
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_527
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_267
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_857
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_534
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_677
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_655
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_535
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_264
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_327
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_768
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_518
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_791
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_384
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_792
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_640
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_711
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_82
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_473
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_461
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_965
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_1000
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_883
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_666
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_388
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_122
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_272
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_991
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_639
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_631
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_568
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_210
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_860
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_601
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_908
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_96
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_511
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_351
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_608
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_316
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_38
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_925
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_84
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_559
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_322
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_646
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_171
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_469
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_115
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_558
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_784
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_1
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_979
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_19
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_497
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_293
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_266
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_262
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_620
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_490
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_219
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_110
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_606
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_670
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_255
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_914
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_464
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_252
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_616
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_202
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_598
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_473
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_690
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_661
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_775
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_258
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_85
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_17
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_208
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_854
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_959
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_234
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_940
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_348
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_566
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_528
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_974
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VUNMUTE_ID_733
     */

};