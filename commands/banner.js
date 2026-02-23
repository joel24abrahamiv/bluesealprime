const V2 = require("../utils/v2Utils");

module.exports = {
    name: "banner",
    description: "Displays a user's banner with a premium reference-matched layout",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: BANNER
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("banner") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "banner", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
        const { BOT_OWNER_ID } = require("../config");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Check if user is trying to SET a banner
        const url = message.attachments.first()?.url || args.find(arg => arg.startsWith("http://") || arg.startsWith("https://"));

        if (url && (args[0] === "set" || (isBotOwner || isServerOwner))) {
            // Forward to setguildbanner command
            const setCmd = message.client.commands.get("setguildbanner");
            if (setCmd && (isBotOwner || isServerOwner)) {
                return setCmd.execute(message, args);
            }
        }

        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.member;

        const user = await member.user.fetch(); // Need to fetch user to get banner data
        const bannerURL = user.bannerURL({ size: 1024, dynamic: true });

        if (!bannerURL) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text(`⚠️ **${user.username}** does not have a banner.`)], "#ff0000")]
            });
        }

        const pngURL = user.bannerURL({ extension: 'png', size: 1024 });
        const jpgURL = user.bannerURL({ extension: 'jpg', size: 1024 });
        const webpURL = user.bannerURL({ extension: 'webp', size: 1024 });

        const container = V2.container([
            V2.section(
                [
                    V2.text(`**Time:** ${new Date().toLocaleTimeString()}`),
                    V2.text(`🔹 **Executed by:** <@${message.author.id}>`)
                ],
                botAvatar
            ),
            V2.separator(),
            V2.text(`🖼️ **${user.username}'s Banner**`),
            V2.text(`**Banner URL:**\n${bannerURL}`),
            V2.text(`🔗 **Download Links:**\n[PNG](${pngURL}) | [JPG](${jpgURL}) | [WEBP](${webpURL})`)
        ], "#0099ff");

        message.reply({
            content: null,
            flags: V2.flag,
            components: [container]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "banner", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] banner.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "banner", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("banner", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`banner\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | BANNER_ID_473
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | BANNER_ID_561
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | BANNER_ID_481
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | BANNER_ID_194
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | BANNER_ID_139
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | BANNER_ID_947
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | BANNER_ID_780
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | BANNER_ID_675
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | BANNER_ID_239
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | BANNER_ID_421
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | BANNER_ID_673
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | BANNER_ID_285
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | BANNER_ID_797
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | BANNER_ID_105
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | BANNER_ID_562
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | BANNER_ID_980
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | BANNER_ID_445
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | BANNER_ID_698
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | BANNER_ID_899
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | BANNER_ID_762
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | BANNER_ID_575
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | BANNER_ID_591
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | BANNER_ID_360
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | BANNER_ID_525
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | BANNER_ID_500
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | BANNER_ID_589
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | BANNER_ID_884
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | BANNER_ID_161
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | BANNER_ID_605
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | BANNER_ID_722
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | BANNER_ID_18
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | BANNER_ID_651
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | BANNER_ID_946
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | BANNER_ID_357
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | BANNER_ID_545
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | BANNER_ID_914
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | BANNER_ID_48
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | BANNER_ID_831
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | BANNER_ID_218
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | BANNER_ID_790
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | BANNER_ID_689
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | BANNER_ID_65
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | BANNER_ID_218
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | BANNER_ID_44
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | BANNER_ID_540
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | BANNER_ID_173
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | BANNER_ID_921
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | BANNER_ID_290
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | BANNER_ID_511
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | BANNER_ID_150
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | BANNER_ID_574
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | BANNER_ID_158
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | BANNER_ID_257
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | BANNER_ID_820
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | BANNER_ID_968
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | BANNER_ID_144
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | BANNER_ID_348
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | BANNER_ID_197
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | BANNER_ID_611
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | BANNER_ID_824
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | BANNER_ID_341
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | BANNER_ID_697
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | BANNER_ID_365
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | BANNER_ID_273
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | BANNER_ID_577
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | BANNER_ID_739
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | BANNER_ID_838
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | BANNER_ID_764
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | BANNER_ID_441
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | BANNER_ID_197
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | BANNER_ID_809
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | BANNER_ID_320
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | BANNER_ID_523
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | BANNER_ID_644
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | BANNER_ID_391
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | BANNER_ID_828
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | BANNER_ID_704
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | BANNER_ID_940
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | BANNER_ID_425
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | BANNER_ID_813
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | BANNER_ID_455
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | BANNER_ID_970
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | BANNER_ID_645
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | BANNER_ID_657
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | BANNER_ID_714
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | BANNER_ID_311
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | BANNER_ID_914
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | BANNER_ID_988
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | BANNER_ID_934
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | BANNER_ID_649
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | BANNER_ID_782
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | BANNER_ID_50
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | BANNER_ID_60
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | BANNER_ID_210
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | BANNER_ID_947
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | BANNER_ID_795
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | BANNER_ID_699
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | BANNER_ID_885
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | BANNER_ID_796
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | BANNER_ID_189
 */

};