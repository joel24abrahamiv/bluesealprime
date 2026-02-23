const V2 = require("../utils/v2Utils");
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
  name: "ban",
  description: "Ban a member with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.BanMembers],

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: BAN
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("ban") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "ban", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply("⚠️ **Missing User.** Usage: `!ban @user [reason]`");
    }

    const V2 = require("../utils/v2Utils");

    if (member.id === BOT_OWNER_ID || member.id === message.guild.ownerId) {
      return message.reply({
        content: null, flags: V2.flag,
        components: [
          V2.container([
            V2.section(
              [
                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                V2.text(`Did you seriously just try to ban ${member.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
              ],
              member.user.displayAvatarURL({ dynamic: true, size: 512 })
            ),
            V2.separator(),
            V2.text(`> You have no power here, ${message.author}. Know your place and step back.`),
            V2.separator(),
            V2.text("*BlueSealPrime • Sovereign Protection*")
          ], "#FF0000")
        ]
      });
    }

    if (member.id === message.client.user.id) {
      return message.reply({
        content: null, flags: V2.flag,
        components: [V2.container([V2.heading("⚠️ SELF-TERMINATION DENIED", 3), V2.text("I cannot ban myself. I am the system.")], V2_RED)]
      });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ You cannot ban a user with an **equal or higher role**.");
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot ban this user (Hierarchy error).");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── CONFIRMATION V2 ─────
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ban_yes").setLabel("Confirm Ban").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("ban_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const confirmContainer = V2.container([
      V2.section(
        [
          V2.heading("⚖️ JUDICIAL REVIEW REQUIRED", 2),
          V2.text(`Are you sure you want to permanently expel **${member.user.tag}**?\n**Reason:** ${reason}`)
        ],
        member.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      confirmRow
    ], V2_RED); // Red for danger/ban confirmation

    const confirmMsg = await message.reply({
      content: null,
      flags: V2.flag,
      components: [confirmContainer]
    });

    const collector = confirmMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 20000,
      max: 1
    });

    collector.on("collect", async interaction => {
      await interaction.deferUpdate();

      if (interaction.customId === "ban_no") {
        return confirmMsg.delete().catch(() => { });
      }

      // ───── EXECUTION ─────
      try {
        const banNotice = V2.container([
          V2.section(
            [
              V2.heading("⛔ OFFICIAL BAN NOTICE", 2),
              V2.text(`You have been permanently banned from **${message.guild.name}**.`)
            ],
            message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
          ),
          V2.separator(),
          V2.heading("📝 REASON FOR TERMINATION", 3),
          V2.text(`> ${reason}`),
          V2.separator(),
          V2.text(`**Moderator:** ${message.author.tag}\n**Date:** ${new Date().toLocaleDateString()}`)
        ], V2_BLUE); // Blue for Ban (User Request)

        await member.send({
          content: null,
          flags: V2.flag,
          components: [banNotice]
        }).catch(() => { });
        await member.ban({ reason });

        const verdictContainer = V2.container([
          V2.section(
            [
              V2.heading("⚖️ VERDICT EXECUTED", 2),
              V2.text(`🔹 **Offender:** ${member.user.tag}\n🔹 **Magistrate:** ${message.author}\n🔹 **Status:** Terminated`)
            ],
            "https://cdn-icons-png.flaticon.com/512/9240/9240331.png"
          ),
          V2.separator(),
          V2.heading("📜 SYSTEM LOG", 3),
          V2.text(`> **Reason:** ${reason}\n> **Time:** ${new Date().toLocaleTimeString()}`)
        ], V2_RED);

        await message.channel.send({
          content: null,
          flags: V2.flag,
          components: [verdictContainer]
        });

      } catch (err) {
        console.error(err);
        await message.channel.send("❌ **Execution Failed:** Check bot permissions.");
      }

      confirmMsg.delete().catch(() => { });
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") confirmMsg.delete().catch(() => { });
    });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ban", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] ban.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ban", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("ban", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`ban\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | BAN_ID_233
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | BAN_ID_201
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | BAN_ID_820
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | BAN_ID_749
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | BAN_ID_795
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | BAN_ID_391
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | BAN_ID_132
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | BAN_ID_988
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | BAN_ID_269
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | BAN_ID_373
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | BAN_ID_808
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | BAN_ID_836
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | BAN_ID_192
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | BAN_ID_568
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | BAN_ID_794
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | BAN_ID_981
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | BAN_ID_115
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | BAN_ID_95
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | BAN_ID_67
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | BAN_ID_50
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | BAN_ID_73
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | BAN_ID_224
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | BAN_ID_890
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | BAN_ID_504
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | BAN_ID_142
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | BAN_ID_487
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | BAN_ID_343
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | BAN_ID_957
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | BAN_ID_377
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | BAN_ID_449
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | BAN_ID_855
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | BAN_ID_576
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | BAN_ID_856
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | BAN_ID_771
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | BAN_ID_262
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | BAN_ID_42
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | BAN_ID_219
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | BAN_ID_424
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | BAN_ID_39
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | BAN_ID_347
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | BAN_ID_720
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | BAN_ID_786
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | BAN_ID_111
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | BAN_ID_476
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | BAN_ID_408
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | BAN_ID_361
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | BAN_ID_495
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | BAN_ID_132
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | BAN_ID_900
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | BAN_ID_519
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | BAN_ID_701
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | BAN_ID_270
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | BAN_ID_476
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | BAN_ID_550
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | BAN_ID_466
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | BAN_ID_743
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | BAN_ID_388
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | BAN_ID_998
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | BAN_ID_817
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | BAN_ID_363
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | BAN_ID_54
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | BAN_ID_439
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | BAN_ID_537
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | BAN_ID_997
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | BAN_ID_358
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | BAN_ID_480
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | BAN_ID_926
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | BAN_ID_364
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | BAN_ID_286
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | BAN_ID_113
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | BAN_ID_279
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | BAN_ID_964
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | BAN_ID_856
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | BAN_ID_346
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | BAN_ID_986
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | BAN_ID_344
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | BAN_ID_755
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | BAN_ID_688
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | BAN_ID_483
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | BAN_ID_572
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | BAN_ID_985
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | BAN_ID_517
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | BAN_ID_68
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | BAN_ID_792
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | BAN_ID_629
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | BAN_ID_183
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | BAN_ID_426
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | BAN_ID_950
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | BAN_ID_214
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | BAN_ID_939
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | BAN_ID_643
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | BAN_ID_782
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | BAN_ID_474
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | BAN_ID_919
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | BAN_ID_67
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | BAN_ID_351
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | BAN_ID_215
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | BAN_ID_365
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | BAN_ID_921
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | BAN_ID_215
 */

};