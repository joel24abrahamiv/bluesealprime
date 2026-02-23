const V2 = require("../utils/v2Utils");
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

function parseDuration(input) {
  // Support "10m", "10 m", "10" (default m)
  const match = input.match(/^(\d+)\s*(m|h|d|s)?$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = (match[2] || "m").toLowerCase(); // Default to minutes if unit missing
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

module.exports = {
  name: "timeout",
  description: "Timeout a member with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.ModerateMembers],

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: TIMEOUT
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("timeout") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "timeout", cooldown);
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
      return message.reply("⚠️ **Missing User.** Usage: `!timeout @user <duration> [reason]`");
    }

    if (member.id === BOT_OWNER_ID || member.id === message.guild.ownerId) {
      return message.reply({
        content: null, flags: V2.flag,
        components: [
          V2.container([
            V2.section(
              [
                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                V2.text(`Did you seriously just try to timeout ${member.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
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
        components: [V2.container([V2.heading("⚠️ SELF-TERMINATION DENIED", 3), V2.text("I cannot timeout myself. I am the system.")], V2_RED)]
      });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ You cannot timeout a user with an **equal or higher role**.");
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot timeout this user (Hierarchy error).");
    }

    const durationInput = args[1];
    if (!durationInput) return message.reply("❌ **No duration provided.** Example: `10m`, `1h`, `1d`.");

    const durationMs = parseDuration(durationInput);
    if (!durationMs) return message.reply("❌ **Invalid duration format.** Use `m`, `h`, or `d`.");

    if (durationMs > 28 * 24 * 60 * 60 * 1000) return message.reply("❌ **Maximum timeout is 28 days.**");

    const reason = args.slice(2).join(" ") || "No reason provided";

    // ───── CONFIRMATION V2 ─────
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("timeout_yes").setLabel("Confirm Timeout").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("timeout_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const confirmContainer = V2.container([
      V2.section(
        [
          V2.heading("⏳ TEMPORARY CONTAINMENT", 2),
          V2.text(`Suspend communication for **${member.user.tag}**?\n**Duration:** ${durationInput}\n**Reason:** ${reason}`)
        ],
        member.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      confirmRow
    ], V2_RED);

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

      if (interaction.customId === "timeout_no") {
        return confirmMsg.delete().catch(() => { });
      }

      try {
        const timeoutNotice = V2.container([
          V2.section(
            [
              V2.heading("⏳ TEMPORARY SUSPENSION", 2),
              V2.text(`You have been placed in timeout in **${message.guild.name}**.`)
            ],
            message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
          ),
          V2.separator(),
          V2.heading("📋 SUSPENSION DETAILS", 3),
          V2.text(`> **Duration:** ${durationInput}\n> **Reason:** ${reason}`),
          V2.separator(),
          V2.text(`**Moderator:** ${message.author.tag}\n**Date:** ${new Date().toLocaleDateString()}\n**Expiry:** In ${durationInput}`)
        ], V2_BLUE);

        await member.send({
          content: null,
          flags: V2.flag,
          components: [timeoutNotice]
        }).catch(() => { });

        await member.timeout(durationMs, reason);

        const verdictContainer = V2.container([
          V2.section(
            [
              V2.heading("⏳ CONTAINMENT ACTIVE", 2),
              V2.text(`🔹 **Subject:** ${member.user.tag}\n🔹 **Duration:** ${durationInput}\n🔹 **Enforcer:** ${message.author}`)
            ],
            "https://cdn-icons-png.flaticon.com/512/2890/2890209.png" // Hourglass icon
          ),
          V2.separator(),
          V2.heading("📜 INCIDENT LOG", 3),
          V2.text(`> **Reason:** ${reason}\n> **Release:** In ${durationInput}`)
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
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "timeout", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] timeout.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "timeout", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("timeout", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`timeout\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_792
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_20
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_449
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_722
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_239
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_321
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_730
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_954
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_644
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_640
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_314
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_438
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_140
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_327
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_334
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_714
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_526
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_528
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_769
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_783
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_21
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_303
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_64
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_513
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_796
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_475
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_376
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_446
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_415
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_791
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_891
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_708
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_130
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_32
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_264
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_971
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_394
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_545
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_282
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_152
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_515
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_326
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_801
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_568
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_470
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_671
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_143
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_495
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_571
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_482
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_954
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_848
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_604
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_463
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_222
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_457
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_827
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_418
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_838
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_776
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_692
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_467
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_235
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_433
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_759
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_41
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_597
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_113
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_209
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_830
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_330
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_462
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_72
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_703
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_729
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_910
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_397
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_237
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_280
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_238
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_372
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_303
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_630
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_501
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_65
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_777
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_561
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_613
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_766
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_790
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_715
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_515
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_860
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_111
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_940
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_727
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_829
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_664
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_131
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | TIMEOUT_ID_725
 */

};