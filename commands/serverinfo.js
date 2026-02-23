const V2 = require("../utils/v2Utils");

module.exports = {
  name: "serverinfo",
  description: "Displays detailed information about this server",

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SERVERINFO
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("serverinfo") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "serverinfo", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const guild = message.guild;

    // Owner (Cache First)
    const ownerId = guild.ownerId;
    const ownerMember = await guild.fetchOwner().catch(() => null);
    const ownerUser = ownerMember ? ownerMember.user : await message.client.users.fetch(ownerId).catch(() => null);
    const ownerTag = ownerUser ? ownerUser.tag : "Unknown#0000";

    // Members
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;

    // Channels
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;

    // Boosts
    const boostCount = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier;

    // Timestamps
    const createdFull = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
    const createdRelative = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    message.reply({
      content: null,
      flags: V2.flag,
      components: [
        V2.container([
          V2.section(
            [
              V2.heading(`📊 ${guild.name.toUpperCase()}`, 2),
              V2.text(`**ID:** \`${guild.id}\`\n**Created:** ${createdFull}`)
            ],
            guild.iconURL({ forceStatic: true, extension: 'png' }) || "https://cdn.discordapp.com/embed/avatars/0.png"
          ),
          V2.section([V2.text("🛡️ **System Protection:** Active")], V2.botAvatar(message)),
          V2.separator(),
          V2.heading("👑 TOP AUTHORITY", 3),
          V2.text(`> **Owner:** ${ownerTag}\n> **ID:** \`${ownerId}\``),
          V2.separator(),
          V2.heading("👥 POPULATION", 3),
          V2.text(`> **Total:** \`${totalMembers}\`\n> **Humans:** \`${humans}\`\n> **Bots:** \`${bots}\``),
          V2.separator(),
          V2.heading("💬 INFRASTRUCTURE", 3),
          V2.text(`> **Text Channels:** \`${textChannels}\`\n> **Voice Channels:** \`${voiceChannels}\`\n> **Total:** \`${textChannels + voiceChannels}\``),
          V2.separator(),
          V2.heading("🚀 BOOST STATUS", 3),
          V2.text(`> **Level:** \`${boostLevel}\`\n> **Count:** \`${boostCount}\``),
          V2.separator(),
          V2.text(`*Requested by ${message.author.tag}*`)
        ], "#0099ff")
      ]
    });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverinfo", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] serverinfo.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverinfo", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("serverinfo", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`serverinfo\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_44
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_305
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_166
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_838
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_653
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_914
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_751
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_937
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_961
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_167
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_287
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_935
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_699
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_466
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_99
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_730
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_561
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_469
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_405
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_490
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_984
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_935
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_273
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_407
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_94
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_311
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_877
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_188
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_49
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_187
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_614
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_873
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_29
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_484
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_39
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_75
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_938
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_861
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_489
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_800
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_906
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_136
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_845
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_552
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_334
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_927
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_556
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_60
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_940
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_506
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_1000
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_10
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_331
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_111
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_939
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_748
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_889
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_412
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_216
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_861
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_6
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_257
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_498
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_36
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_289
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_316
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_704
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_398
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_34
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_657
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_814
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_1000
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_301
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_775
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_774
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_142
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_125
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_149
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_638
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_111
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_256
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_620
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_251
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_93
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_676
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_581
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_543
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_620
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_76
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_502
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_703
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_882
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_162
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_169
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_226
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_174
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_552
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_949
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_350
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SERVERINFO_ID_322
 */

};