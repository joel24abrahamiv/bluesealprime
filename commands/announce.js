const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "announce",
    description: "Make an official server announcement",
    usage: "!announce <message>",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ANNOUNCE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("announce") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "announce", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("🚫 PERMISSION DENIED", 3), V2.text("I do not have permission to manage messages.")], "#0099ff")]
            });
        }

        if (args.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING CONTENT", 3), V2.text("Usage: `!announce <message>`")], "#0099ff")]
            });
        }

        // Delete command message
        message.delete().catch(() => { });

        const announcement = args.join(" ");

        const container = V2.container([
            V2.section([
                V2.heading("📢 SYSTEM WIDE BROADCAST", 2),
                V2.text("**Incoming Transmission:**")
            ], V2.botAvatar(message)), // Bot PFP as requested
            V2.separator(),
            V2.text("```fix\n" + announcement + "\n```"), // Keep fix block for color
            V2.separator(),
            V2.heading("ℹ️ TRANSMISSION DATA", 3),
            V2.text(`> **Origin:** \`${message.author.tag}\`\n> **Priority:** \`CRITICAL / HIGH\`\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:R>`),
            V2.separator(),
            V2.text(`*BlueSealPrime Global Systems • Verification: 0x${Math.floor(Math.random() * 10000).toString(16).toUpperCase()}*`)
        ], V2_BLUE); // Blue as requested

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "announce", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] announce.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "announce", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("announce", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`announce\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_8
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_531
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_139
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_56
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_55
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_329
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_269
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_232
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_26
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_306
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_680
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_33
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_235
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_753
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_414
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_919
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_335
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_152
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_348
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_882
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_218
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_982
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_679
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_100
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_366
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_278
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_993
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_277
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_592
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_663
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_166
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_7
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_858
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_150
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_153
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_410
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_757
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_186
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_983
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_472
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_22
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_393
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_371
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_4
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_382
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_473
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_825
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_152
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_677
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_91
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_784
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_902
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_197
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_882
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_855
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_190
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_112
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_98
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_939
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_513
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_36
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_378
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_911
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_102
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_993
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_434
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_765
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_158
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_725
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_185
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_965
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_626
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_58
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_524
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_771
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_292
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_858
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_311
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_898
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_391
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_218
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_962
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_171
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_523
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_641
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_859
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_67
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_873
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_82
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_636
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_658
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_131
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_621
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_77
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_366
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_14
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_41
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_721
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_679
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ANNOUNCE_ID_539
 */

};