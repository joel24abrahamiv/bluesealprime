const V2 = require("../utils/v2Utils");

module.exports = {
  name: "avatar",
  description: "Displays a user's avatar with a premium reference-matched layout",

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: AVATAR
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("avatar") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "avatar", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
    const { BOT_OWNER_ID, V2_RED } = require("../config");
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    // Check if user is trying to SET an avatar
    const url = message.attachments.first()?.url || args.find(arg => arg.startsWith("http://") || arg.startsWith("https://"));

    if (url && (args[0] === "set" || (isBotOwner || isServerOwner))) {
      // If user provided a URL and is authorized, or used 'set' keyword
      // Forward to setguildavatar command
      const setCmd = message.client.commands.get("setguildavatar");
      if (setCmd && (isBotOwner || isServerOwner)) {
        return setCmd.execute(message, args);
      }
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    const user = member.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const pngURL = user.displayAvatarURL({ extension: 'png', size: 1024 });
    const jpgURL = user.displayAvatarURL({ extension: 'jpg', size: 1024 });
    const webpURL = user.displayAvatarURL({ extension: 'webp', size: 1024 });

    const container = V2.container([
      V2.section(
        [
          V2.text(`**Time:** ${new Date().toLocaleTimeString()}`),
          V2.text(`🔹 **Executed by:** <@${message.author.id}>`)
        ],
        botAvatar // Bot PFP here
      ),
      V2.separator(),
      V2.text(`🖼️ **${user.username}'s Avatar**`),
      V2.text(`**Avatar URL:**\n${avatarURL}`),
      V2.text(`🔗 **Download Links:**\n[PNG](${pngURL}) | [JPG](${jpgURL}) | [WEBP](${webpURL})`)
    ], "#0099ff");

    message.reply({
      content: null,
      flags: V2.flag,
      components: [container]
    });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "avatar", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] avatar.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "avatar", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("avatar", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`avatar\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | AVATAR_ID_763
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | AVATAR_ID_822
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | AVATAR_ID_104
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | AVATAR_ID_484
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | AVATAR_ID_323
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | AVATAR_ID_876
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | AVATAR_ID_947
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | AVATAR_ID_522
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | AVATAR_ID_235
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | AVATAR_ID_505
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | AVATAR_ID_589
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | AVATAR_ID_509
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | AVATAR_ID_328
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | AVATAR_ID_358
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | AVATAR_ID_103
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | AVATAR_ID_872
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | AVATAR_ID_903
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | AVATAR_ID_794
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | AVATAR_ID_777
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | AVATAR_ID_783
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | AVATAR_ID_510
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | AVATAR_ID_21
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | AVATAR_ID_65
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | AVATAR_ID_782
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | AVATAR_ID_764
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | AVATAR_ID_122
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | AVATAR_ID_283
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | AVATAR_ID_800
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | AVATAR_ID_754
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | AVATAR_ID_72
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | AVATAR_ID_127
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | AVATAR_ID_148
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | AVATAR_ID_799
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | AVATAR_ID_147
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | AVATAR_ID_510
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | AVATAR_ID_257
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | AVATAR_ID_151
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | AVATAR_ID_934
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | AVATAR_ID_699
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | AVATAR_ID_942
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | AVATAR_ID_942
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | AVATAR_ID_603
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | AVATAR_ID_290
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | AVATAR_ID_301
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | AVATAR_ID_927
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | AVATAR_ID_28
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | AVATAR_ID_139
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | AVATAR_ID_149
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | AVATAR_ID_114
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | AVATAR_ID_838
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | AVATAR_ID_607
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | AVATAR_ID_527
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | AVATAR_ID_173
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | AVATAR_ID_234
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | AVATAR_ID_426
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | AVATAR_ID_156
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | AVATAR_ID_208
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | AVATAR_ID_691
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | AVATAR_ID_885
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | AVATAR_ID_797
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | AVATAR_ID_773
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | AVATAR_ID_180
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | AVATAR_ID_533
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | AVATAR_ID_541
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | AVATAR_ID_398
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | AVATAR_ID_696
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | AVATAR_ID_250
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | AVATAR_ID_60
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | AVATAR_ID_505
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | AVATAR_ID_137
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | AVATAR_ID_251
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | AVATAR_ID_99
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | AVATAR_ID_837
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | AVATAR_ID_84
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | AVATAR_ID_869
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | AVATAR_ID_776
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | AVATAR_ID_737
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | AVATAR_ID_757
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | AVATAR_ID_581
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | AVATAR_ID_777
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | AVATAR_ID_457
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | AVATAR_ID_499
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | AVATAR_ID_420
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | AVATAR_ID_295
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | AVATAR_ID_865
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | AVATAR_ID_292
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | AVATAR_ID_232
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | AVATAR_ID_342
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | AVATAR_ID_718
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | AVATAR_ID_159
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | AVATAR_ID_152
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | AVATAR_ID_670
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | AVATAR_ID_762
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | AVATAR_ID_796
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | AVATAR_ID_695
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | AVATAR_ID_411
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | AVATAR_ID_353
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | AVATAR_ID_154
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | AVATAR_ID_389
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | AVATAR_ID_62
 */

};