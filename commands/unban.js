const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "unban",
  description: "Unban a user using mention, ID, or username",
  permissions: [PermissionsBitField.Flags.BanMembers],

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNBAN
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("unban") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "unban", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");

    if (!args.length) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([V2.heading("⚠️ MISSING USER", 3), V2.text("Usage: `!unban <userID | username> [reason]`")], "#0099ff")]
      });
    }

    let input = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── HANDLE MENTION ─────
    const mentionMatch = input.match(/^<@!?(\d{17,20})>$/);
    if (mentionMatch) {
      input = mentionMatch[1];
    }

    try {
      const bans = await message.guild.bans.fetch();

      if (!bans.size) {
        return message.reply({ components: [V2.container([V2.text("ℹ️ No users are currently banned.")], "#0099ff")] });
      }

      let targetBan = null;

      // ───── CASE 1: INPUT IS USER ID ─────
      if (/^\d{17,20}$/.test(input)) {
        targetBan = bans.get(input);
        if (!targetBan) {
          return message.reply({ components: [V2.container([V2.text("❌ **User ID not found in ban list.**")], "#0099ff")] });
        }
      }
      // ───── CASE 2: INPUT IS USERNAME ─────
      else {
        const matches = bans.filter(ban => {
          const username = ban.user.username.toLowerCase();
          const tag = ban.user.tag?.toLowerCase();
          const search = input.toLowerCase();
          return username === search || tag === search;
        });

        if (matches.size === 0) return message.reply({ components: [V2.container([V2.text("❌ **No banned user found with that name.**")], "#0099ff")] });
        if (matches.size > 1) return message.reply({ components: [V2.container([V2.text("⚠️ **Multiple matches found.** Use ID instead.")], require("../config").WARN_COLOR)] });

        targetBan = matches.first();
      }

      // ───── UNBAN USER ─────
      await message.guild.members.unban(targetBan.user.id, reason);

      // ───── PREMIUM V2 EMBED ─────
      const container = V2.container([
        V2.section([
          V2.heading("🔓 ACCESS RESTORED", 2),
          V2.text(`**Status:** \`UNBANNED\`\n**Target:** ${targetBan.user.tag}\n**ID:** \`${targetBan.user.id}\``)
        ], "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"), // Unlock Icon
        V2.separator(),
        V2.heading("📝 DETAILS", 3),
        V2.text(`> **Reason:** ${reason}\n> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
        V2.separator(),
        V2.text("*BlueSealPrime • Security Systems*")
      ], require("../config").SUCCESS_COLOR);

      await message.channel.send({ content: null, flags: V2.flag, components: [container] });

    } catch (err) {
      console.error(err);
      message.reply({ components: [V2.container([V2.text("❌ **Failed to unban.** Check permissions.")], require("../config").ERROR_COLOR)] });
    }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unban", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] unban.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unban", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("unban", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`unban\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNBAN_ID_891
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNBAN_ID_330
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNBAN_ID_769
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNBAN_ID_76
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNBAN_ID_13
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNBAN_ID_727
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNBAN_ID_52
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNBAN_ID_424
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNBAN_ID_933
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNBAN_ID_252
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNBAN_ID_842
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNBAN_ID_596
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNBAN_ID_873
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNBAN_ID_321
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNBAN_ID_46
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNBAN_ID_327
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNBAN_ID_766
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNBAN_ID_485
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNBAN_ID_804
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNBAN_ID_427
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNBAN_ID_645
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNBAN_ID_477
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNBAN_ID_28
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNBAN_ID_649
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNBAN_ID_319
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNBAN_ID_808
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNBAN_ID_698
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNBAN_ID_292
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNBAN_ID_155
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNBAN_ID_905
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNBAN_ID_452
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNBAN_ID_661
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNBAN_ID_545
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNBAN_ID_678
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNBAN_ID_975
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNBAN_ID_734
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNBAN_ID_876
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNBAN_ID_428
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNBAN_ID_334
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNBAN_ID_103
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNBAN_ID_240
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNBAN_ID_480
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNBAN_ID_253
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNBAN_ID_301
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNBAN_ID_247
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNBAN_ID_690
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNBAN_ID_990
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNBAN_ID_606
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNBAN_ID_263
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNBAN_ID_492
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNBAN_ID_891
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNBAN_ID_2
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNBAN_ID_387
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNBAN_ID_718
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNBAN_ID_488
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNBAN_ID_632
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNBAN_ID_525
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNBAN_ID_32
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNBAN_ID_458
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNBAN_ID_92
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNBAN_ID_903
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNBAN_ID_274
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNBAN_ID_740
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNBAN_ID_439
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNBAN_ID_140
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNBAN_ID_183
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNBAN_ID_757
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNBAN_ID_660
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNBAN_ID_972
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNBAN_ID_780
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNBAN_ID_629
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNBAN_ID_790
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNBAN_ID_582
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNBAN_ID_82
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNBAN_ID_340
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNBAN_ID_225
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNBAN_ID_502
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNBAN_ID_364
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNBAN_ID_177
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNBAN_ID_653
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNBAN_ID_721
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNBAN_ID_85
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNBAN_ID_45
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNBAN_ID_420
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNBAN_ID_587
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNBAN_ID_178
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNBAN_ID_856
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNBAN_ID_257
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNBAN_ID_713
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNBAN_ID_496
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNBAN_ID_774
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNBAN_ID_882
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNBAN_ID_401
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNBAN_ID_453
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNBAN_ID_925
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNBAN_ID_529
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNBAN_ID_952
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNBAN_ID_414
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNBAN_ID_719
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNBAN_ID_794
 */

};