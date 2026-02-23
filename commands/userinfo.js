const V2 = require("../utils/v2Utils");

module.exports = {
  name: "userinfo",
  description: "Shows a detailed and spacious user profile using Components V2",

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: USERINFO
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("userinfo") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "userinfo", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      (args[0] ? null : message.member);

    if (!member) return message.reply("❌ **User not found.** Please mention a valid user or provide a valid ID.");

    const user = member.user;

    const statusMap = {
      online: "🟢 Online",
      idle: "🌙 Idle",
      dnd: "⛔ Do Not Disturb",
      offline: "⚫ Offline"
    };

    const status = member.presence?.status ? statusMap[member.presence.status] : "⚫ Offline";

    const memberType =
      message.guild.ownerId === user.id
        ? "👑 Server Owner"
        : member.permissions.has("Administrator")
          ? "🛡 Administrator"
          : "👤 Member";

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position);

    const roleList = roles.map(r => r.name).join(", ") || "None";

    const createdRelative = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedRelative = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
    const joinedFull = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;

    const container = V2.container([
      V2.section(
        [
          V2.heading("👤 USER PROFILE", 2),
          V2.text(`**User:** ${user.tag}\n**ID:** \`${user.id}\`\n**Status:** ${status}`)
        ],
        user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      V2.heading("🧩 CORE INFORMATION", 3),
      V2.text(`> **Member Type:** ${memberType}\n> **Total Roles:** ${roles.size}`),
      V2.separator(),
      V2.heading("🕒 TIMELINE", 3),
      V2.text(`> **Created:** ${createdRelative}\n> **Joined:** ${joinedRelative}\n> **Joined Full:** ${joinedFull}`),
      V2.separator(),
      V2.heading(`🎭 ROLES (${roles.size})`, 3),
      V2.text(roleList.length > 500 ? roleList.slice(0, 500) + "..." : roleList)
    ], "#0099ff");

    message.reply({
      content: null,
      flags: V2.flag,
      components: [container]
    });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "userinfo", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] userinfo.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "userinfo", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("userinfo", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`userinfo\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | USERINFO_ID_349
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | USERINFO_ID_301
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | USERINFO_ID_357
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | USERINFO_ID_184
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | USERINFO_ID_274
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | USERINFO_ID_637
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | USERINFO_ID_921
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | USERINFO_ID_488
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | USERINFO_ID_218
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | USERINFO_ID_909
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | USERINFO_ID_621
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | USERINFO_ID_498
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | USERINFO_ID_472
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | USERINFO_ID_698
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | USERINFO_ID_867
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | USERINFO_ID_267
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | USERINFO_ID_553
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | USERINFO_ID_466
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | USERINFO_ID_730
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | USERINFO_ID_105
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | USERINFO_ID_611
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | USERINFO_ID_154
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | USERINFO_ID_665
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | USERINFO_ID_575
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | USERINFO_ID_992
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | USERINFO_ID_334
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | USERINFO_ID_298
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | USERINFO_ID_483
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | USERINFO_ID_821
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | USERINFO_ID_19
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | USERINFO_ID_113
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | USERINFO_ID_222
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | USERINFO_ID_34
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | USERINFO_ID_862
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | USERINFO_ID_944
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | USERINFO_ID_438
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | USERINFO_ID_435
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | USERINFO_ID_719
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | USERINFO_ID_425
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | USERINFO_ID_236
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | USERINFO_ID_755
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | USERINFO_ID_963
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | USERINFO_ID_516
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | USERINFO_ID_607
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | USERINFO_ID_957
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | USERINFO_ID_134
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | USERINFO_ID_540
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | USERINFO_ID_201
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | USERINFO_ID_866
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | USERINFO_ID_630
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | USERINFO_ID_720
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | USERINFO_ID_849
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | USERINFO_ID_367
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | USERINFO_ID_826
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | USERINFO_ID_551
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | USERINFO_ID_36
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | USERINFO_ID_36
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | USERINFO_ID_486
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | USERINFO_ID_234
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | USERINFO_ID_631
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | USERINFO_ID_989
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | USERINFO_ID_505
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | USERINFO_ID_472
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | USERINFO_ID_1000
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | USERINFO_ID_978
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | USERINFO_ID_550
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | USERINFO_ID_872
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | USERINFO_ID_603
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | USERINFO_ID_438
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | USERINFO_ID_389
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | USERINFO_ID_127
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | USERINFO_ID_931
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | USERINFO_ID_34
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | USERINFO_ID_126
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | USERINFO_ID_645
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | USERINFO_ID_107
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | USERINFO_ID_922
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | USERINFO_ID_70
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | USERINFO_ID_424
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | USERINFO_ID_693
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | USERINFO_ID_402
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | USERINFO_ID_239
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | USERINFO_ID_136
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | USERINFO_ID_672
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | USERINFO_ID_646
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | USERINFO_ID_145
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | USERINFO_ID_333
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | USERINFO_ID_338
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | USERINFO_ID_36
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | USERINFO_ID_856
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | USERINFO_ID_703
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | USERINFO_ID_241
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | USERINFO_ID_412
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | USERINFO_ID_775
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | USERINFO_ID_966
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | USERINFO_ID_899
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | USERINFO_ID_529
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | USERINFO_ID_762
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | USERINFO_ID_970
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | USERINFO_ID_775
 */

};