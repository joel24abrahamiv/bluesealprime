const { ChannelType, PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createvc",
    description: "Creates a new voice channel",
    usage: "!createvc <name>",
    aliases: ["mkvc"],
    permissions: [PermissionsBitField.Flags.ManageChannels],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: CREATEVC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("createvc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "createvc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Usage:** `!createvc <name>`")], V2_RED)]
            });
        }

        try {
            const name = args.join(" ");
            const vc = await message.guild.channels.create({
                name,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{ id: message.guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel] }]
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🔊 VOICE CHANNEL DEPLOYED", 2),
                        V2.text(`**\`${vc.name}\`** is now live.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **ID:** \`${vc.id}\`\n> **Created by:** ${message.author}`)
                ], V2_BLUE)]
            });
        } catch (e) {
            console.error(e);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Error:** Missing Permissions or Hierarchy issue.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createvc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] createvc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createvc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("createvc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`createvc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_847
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_447
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_108
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_806
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_45
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_886
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_37
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_439
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_56
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_841
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_473
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_959
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_2
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_445
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_696
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_528
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_116
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_545
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_809
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_564
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_988
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_551
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_923
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_253
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_920
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_988
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_848
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_709
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_771
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_559
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_710
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_900
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_418
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_20
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_426
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_612
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_831
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_466
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_877
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_905
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_13
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_980
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_140
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_291
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_489
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_972
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_246
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_273
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_429
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_889
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_239
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_292
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_522
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_53
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_505
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_835
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_135
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_346
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_569
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_71
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_118
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_95
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_438
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_212
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_680
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_640
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_747
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_490
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_562
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_190
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_706
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_349
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_317
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_579
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_787
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_398
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_791
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_889
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_761
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_414
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_837
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_610
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_629
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_142
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_245
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_619
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_158
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_530
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_915
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_154
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_566
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_834
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_129
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_554
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_390
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_994
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_618
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_406
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_147
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | CREATEVC_ID_333
 */

};