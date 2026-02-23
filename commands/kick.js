const V2 = require("../utils/v2Utils");
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
  name: "kick",
  description: "Kick a member with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.KickMembers],

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: KICK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("kick") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "kick", cooldown);
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
      return message.reply("⚠️ **Missing User.** Usage: `!kick @user [reason]`");
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
                V2.text(`Did you seriously just try to kick ${member.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
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
        components: [V2.container([V2.heading("⚠️ SELF-TERMINATION DENIED", 3), V2.text("I cannot kick myself. I am the system.")], V2_RED)]
      });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ You cannot kick a user with an **equal or higher role**.");
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot kick this user (Hierarchy error).");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── CONFIRMATION V2 ─────
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kick_yes").setLabel("Confirm Kick").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("kick_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const confirmContainer = V2.container([
      V2.section(
        [
          V2.heading("👢 DISMISSAL PROTOCOL", 2),
          V2.text(`Confirm the immediate extraction of **${member.user.tag}**?\n**Reason:** ${reason}`)
        ],
        member.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      confirmRow
    ], V2_RED); // Red for danger/kick confirmation

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

      if (interaction.customId === "kick_no") {
        return confirmMsg.delete().catch(() => { });
      }

      // ───── EXECUTION ─────
      try {
        const kickNotice = V2.container([
          V2.section(
            [
              V2.heading("👞 OFFICIAL KICK NOTICE", 2),
              V2.text(`You have been kicked from **${message.guild.name}**.`)
            ],
            message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
          ),
          V2.separator(),
          V2.heading("📝 REASON FOR REMOVAL", 3),
          V2.text(`> ${reason}`),
          V2.separator(),
          V2.text(`**Moderator:** ${message.author.tag}\n**Date:** ${new Date().toLocaleDateString()}`)
        ], V2_BLUE); // Blue for Kick (User Request)

        await member.send({
          content: null,
          flags: V2.flag,
          components: [kickNotice]
        }).catch(() => { });
        await member.kick(reason);

        const verdictContainer = V2.container([
          V2.section(
            [
              V2.heading("👢 EJECTION COMPLETE", 2),
              V2.text(`🔹 **Target:** ${member.user.tag}\n🔹 **Enforcer:** ${message.author}\n🔹 **Action:** Ejected`)
            ],
            "https://cdn-icons-png.flaticon.com/512/9333/9333990.png" // Boot icon
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
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "kick", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] kick.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "kick", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("kick", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`kick\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | KICK_ID_699
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | KICK_ID_262
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | KICK_ID_640
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | KICK_ID_257
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | KICK_ID_959
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | KICK_ID_514
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | KICK_ID_271
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | KICK_ID_467
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | KICK_ID_199
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | KICK_ID_579
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | KICK_ID_980
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | KICK_ID_807
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | KICK_ID_228
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | KICK_ID_723
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | KICK_ID_14
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | KICK_ID_144
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | KICK_ID_998
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | KICK_ID_369
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | KICK_ID_551
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | KICK_ID_925
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | KICK_ID_635
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | KICK_ID_140
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | KICK_ID_201
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | KICK_ID_268
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | KICK_ID_7
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | KICK_ID_822
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | KICK_ID_817
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | KICK_ID_491
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | KICK_ID_302
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | KICK_ID_772
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | KICK_ID_166
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | KICK_ID_373
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | KICK_ID_439
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | KICK_ID_561
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | KICK_ID_787
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | KICK_ID_293
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | KICK_ID_115
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | KICK_ID_178
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | KICK_ID_218
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | KICK_ID_196
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | KICK_ID_31
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | KICK_ID_744
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | KICK_ID_893
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | KICK_ID_325
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | KICK_ID_188
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | KICK_ID_966
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | KICK_ID_128
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | KICK_ID_914
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | KICK_ID_634
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | KICK_ID_327
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | KICK_ID_17
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | KICK_ID_128
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | KICK_ID_402
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | KICK_ID_488
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | KICK_ID_141
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | KICK_ID_429
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | KICK_ID_898
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | KICK_ID_651
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | KICK_ID_83
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | KICK_ID_500
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | KICK_ID_354
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | KICK_ID_281
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | KICK_ID_615
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | KICK_ID_467
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | KICK_ID_803
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | KICK_ID_282
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | KICK_ID_497
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | KICK_ID_565
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | KICK_ID_907
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | KICK_ID_200
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | KICK_ID_271
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | KICK_ID_54
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | KICK_ID_776
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | KICK_ID_695
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | KICK_ID_211
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | KICK_ID_228
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | KICK_ID_218
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | KICK_ID_908
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | KICK_ID_141
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | KICK_ID_93
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | KICK_ID_205
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | KICK_ID_509
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | KICK_ID_582
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | KICK_ID_160
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | KICK_ID_615
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | KICK_ID_920
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | KICK_ID_675
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | KICK_ID_927
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | KICK_ID_844
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | KICK_ID_382
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | KICK_ID_84
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | KICK_ID_970
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | KICK_ID_181
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | KICK_ID_766
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | KICK_ID_316
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | KICK_ID_802
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | KICK_ID_471
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | KICK_ID_663
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | KICK_ID_920
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | KICK_ID_23
 */

};