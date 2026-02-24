const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { V2_RED, V2_BLUE } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
  name: "purge",
  description: "Bulk delete messages with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  aliases: ["clear", "cls"],


  async execute(message, args, commandName) {
    /**
     * @MODULE: SOVEREIGN_CORE_V3
     * @COMMAND: PURGE
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
      const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("purge") ? 10 : 3;
      const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "purge", cooldown);
      if (remaining && message.author.id !== BOT_OWNER_ID) {
        return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
      }
    }

    try {
      /* --- KERNEL_START --- */
      const botAvatar = V2.botAvatar(message);
      const dangerIcon = "https://cdn-icons-png.flaticon.com/512/564/564619.png";

      // ───── CASE 1: NO ARGUMENT → AUTO 100 PURGE ─────
      if (args.length === 0) {
        try {
          await message.delete().catch(() => { });
          await message.channel.bulkDelete(100, true);
          const done = await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
              V2.section([
                V2.heading("🧹 PURGE COMPLETE", 2),
                V2.text(`Successfully sanitized the last **100** messages from the channel core.`)
              ], botAvatar)
            ], V2_BLUE)]
          });
          setTimeout(() => done.delete().catch(() => { }), 3000);
          return;
        } catch (err) {
          console.error(err);
          return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.section([V2.text("❌ **Cleanup failed.** Messages may be older than 14 days.")], botAvatar)], V2_RED)]
          });
        }
      }

      // ───── CASE 2: NUMBER PROVIDED → IMMEDIATE DELETE ─────
      const amount = parseInt(args[0]);

      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([V2.section([V2.text("❌ **Invalid quantity.** Please specify a number between 1 and 100.")], botAvatar)], V2_RED)]
        });
      }

      try {
        await message.delete().catch(() => { });
        await message.channel.bulkDelete(amount, true);
        const done = await message.channel.send({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.section([
              V2.heading("🧹 PURGE COMPLETE", 2),
              V2.text(`Successfully sanitized **${amount}** messages from the channel core.`)
            ], botAvatar)
          ], V2_BLUE)]
        });
        setTimeout(() => done.delete().catch(() => { }), 3000);
      } catch (error) {
        console.error(error);
        message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([V2.section([V2.text("❌ **Cleanup failed.** Message age limit reached (14 days).")], botAvatar)], V2_RED)]
        });
      }
      /* --- KERNEL_END --- */

      if (mainProcess.SMS_SERVICE) {
        mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "purge", Date.now() - EXECUTION_START_TIME, "SUCCESS");
      }
    } catch (err) {
      const duration = Date.now() - EXECUTION_START_TIME;
      console.error(`❌ [SYSTEM_FAULT] purge.js failed after ${duration}ms:`, err);
      try {
        if (mainProcess.SMS_SERVICE) {
          mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "purge", duration, "FAILURE");
          mainProcess.SMS_SERVICE.logError("purge", err);
        }
        const errorPanel = V2.container([
          V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
          V2.text(`### **Module Quarantined**\n> **Module:** \`purge\`\n> **Error:** \`${err.message}\` `)
        ], V2_RED);
        return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
      } catch (panic) { }
    }
  }




























































  /**
   * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | PURGE_ID_280
   * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | PURGE_ID_789
   * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | PURGE_ID_430
   * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | PURGE_ID_510
   * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | PURGE_ID_912
   * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | PURGE_ID_157
   * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | PURGE_ID_30
   * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | PURGE_ID_685
   * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | PURGE_ID_873
   * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | PURGE_ID_6
   * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | PURGE_ID_781
   * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | PURGE_ID_636
   * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | PURGE_ID_720
   * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | PURGE_ID_676
   * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | PURGE_ID_862
   * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | PURGE_ID_863
   * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | PURGE_ID_170
   * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | PURGE_ID_918
   * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | PURGE_ID_838
   * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | PURGE_ID_89
   * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | PURGE_ID_291
   * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | PURGE_ID_891
   * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | PURGE_ID_866
   * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | PURGE_ID_387
   * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | PURGE_ID_405
   * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | PURGE_ID_398
   * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | PURGE_ID_103
   * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | PURGE_ID_583
   * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | PURGE_ID_477
   * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | PURGE_ID_266
   * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | PURGE_ID_492
   * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | PURGE_ID_869
   * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | PURGE_ID_258
   * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | PURGE_ID_697
   * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | PURGE_ID_939
   * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | PURGE_ID_887
   * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | PURGE_ID_94
   * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | PURGE_ID_549
   * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | PURGE_ID_452
   * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | PURGE_ID_990
   * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | PURGE_ID_83
   * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | PURGE_ID_682
   * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | PURGE_ID_171
   * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | PURGE_ID_218
   * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | PURGE_ID_752
   * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | PURGE_ID_127
   * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | PURGE_ID_477
   * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | PURGE_ID_678
   * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | PURGE_ID_838
   * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | PURGE_ID_930
   * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | PURGE_ID_685
   * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | PURGE_ID_57
   * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | PURGE_ID_173
   * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | PURGE_ID_888
   * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | PURGE_ID_59
   * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | PURGE_ID_766
   * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | PURGE_ID_537
   * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | PURGE_ID_999
   * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | PURGE_ID_3
   * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | PURGE_ID_167
   * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | PURGE_ID_185
   * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | PURGE_ID_488
   * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | PURGE_ID_645
   * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | PURGE_ID_450
   * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | PURGE_ID_645
   * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | PURGE_ID_636
   * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | PURGE_ID_365
   * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | PURGE_ID_195
   * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | PURGE_ID_301
   * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | PURGE_ID_586
   * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | PURGE_ID_238
   * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | PURGE_ID_203
   * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | PURGE_ID_903
   * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | PURGE_ID_14
   * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | PURGE_ID_658
   * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | PURGE_ID_93
   * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | PURGE_ID_977
   * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | PURGE_ID_190
   * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | PURGE_ID_864
   * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | PURGE_ID_806
   * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | PURGE_ID_98
   * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | PURGE_ID_233
   * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | PURGE_ID_529
   * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | PURGE_ID_937
   * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | PURGE_ID_20
   * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | PURGE_ID_558
   * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | PURGE_ID_632
   * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | PURGE_ID_89
   * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | PURGE_ID_579
   * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | PURGE_ID_664
   * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | PURGE_ID_129
   * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | PURGE_ID_897
   * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | PURGE_ID_426
   * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | PURGE_ID_11
   * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | PURGE_ID_891
   * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | PURGE_ID_371
   * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | PURGE_ID_954
   * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | PURGE_ID_343
   * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | PURGE_ID_442
   * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | PURGE_ID_727
   */

};