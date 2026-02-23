const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "show",
    description: "Unhides the current channel for @everyone",
    aliases: ["showchannel", "view", "unlockview"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SHOW
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("show") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "show", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                ViewChannel: true
            });

            const { AttachmentBuilder } = require("discord.js");
            const showIcon = new AttachmentBuilder("./assets/show.png", { name: "show.png" });

            // Using global V2
            const container = V2.container([
                V2.section([
                    V2.heading("👀 CHANNEL VISIBLE", 2),
                    V2.text(`** Status:** \`VISIBLE\`\n**Target:** \`@everyone\`\n**Access:** \`Public Access Restored\``)
                ], "attachment://show.png"), // Premium Blue Eye
                V2.separator(),
                V2.text(`> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Visibility Protocol*")
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, files: [showIcon], components: [container] });

        } catch (e) {
            console.error(e);
            // Using global V2
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Error: Missing Permissions or Hierarchy issue.**")], "#FF0000")]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "show", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] show.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "show", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("show", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`show\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SHOW_ID_426
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SHOW_ID_810
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SHOW_ID_973
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SHOW_ID_837
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SHOW_ID_979
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SHOW_ID_535
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SHOW_ID_934
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SHOW_ID_140
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SHOW_ID_754
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SHOW_ID_16
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SHOW_ID_761
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SHOW_ID_797
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SHOW_ID_80
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SHOW_ID_942
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SHOW_ID_655
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SHOW_ID_398
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SHOW_ID_471
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SHOW_ID_126
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SHOW_ID_660
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SHOW_ID_720
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SHOW_ID_177
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SHOW_ID_110
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SHOW_ID_779
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SHOW_ID_991
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SHOW_ID_371
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SHOW_ID_664
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SHOW_ID_899
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SHOW_ID_39
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SHOW_ID_524
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SHOW_ID_545
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SHOW_ID_338
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SHOW_ID_68
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SHOW_ID_731
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SHOW_ID_425
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SHOW_ID_797
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SHOW_ID_499
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SHOW_ID_927
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SHOW_ID_483
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SHOW_ID_745
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SHOW_ID_737
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SHOW_ID_699
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SHOW_ID_583
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SHOW_ID_154
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SHOW_ID_851
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SHOW_ID_177
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SHOW_ID_516
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SHOW_ID_968
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SHOW_ID_840
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SHOW_ID_135
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SHOW_ID_61
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SHOW_ID_165
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SHOW_ID_674
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SHOW_ID_587
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SHOW_ID_411
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SHOW_ID_180
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SHOW_ID_348
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SHOW_ID_905
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SHOW_ID_666
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SHOW_ID_229
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SHOW_ID_200
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SHOW_ID_660
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SHOW_ID_742
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SHOW_ID_673
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SHOW_ID_938
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SHOW_ID_846
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SHOW_ID_80
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SHOW_ID_464
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SHOW_ID_172
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SHOW_ID_782
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SHOW_ID_642
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SHOW_ID_38
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SHOW_ID_908
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SHOW_ID_472
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SHOW_ID_613
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SHOW_ID_900
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SHOW_ID_755
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SHOW_ID_104
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SHOW_ID_758
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SHOW_ID_395
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SHOW_ID_633
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SHOW_ID_529
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SHOW_ID_557
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SHOW_ID_452
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SHOW_ID_507
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SHOW_ID_958
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SHOW_ID_656
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SHOW_ID_237
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SHOW_ID_938
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SHOW_ID_982
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SHOW_ID_380
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SHOW_ID_706
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SHOW_ID_687
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SHOW_ID_471
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SHOW_ID_599
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SHOW_ID_112
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SHOW_ID_668
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SHOW_ID_638
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SHOW_ID_896
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SHOW_ID_142
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SHOW_ID_992
 */

};