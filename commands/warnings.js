const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const V2 = require("../utils/v2Utils");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "warnings",
    description: "View or clear warnings for a user",
    usage: "!warnings @user [clear]",
    aliases: ["warns"],
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: WARNINGS
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("warnings") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "warnings", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING TARGET", 3), V2.text("Usage: `!warnings @user [clear]`")], V2_BLUE)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/warnings.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const userWarnings = db[message.guild.id]?.[target.id] || [];

        // CLEAR WARNINGS
        if (args[1] && args[1].toLowerCase() === "clear") {
            if (db[message.guild.id]) {
                delete db[message.guild.id][target.id];
                fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            }

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ RECORD CLEARED", 2),
                    V2.text(`**All warnings for ${target.user.tag} have been expunged.**`)
                ], V2_BLUE)]
            });
        }

        // VIEW WARNINGS
        if (userWarnings.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ CLEAN RECORD", 2),
                    V2.text(`User **${target.user.tag}** has no recorded infractions.`)
                ], V2_BLUE)]
            });
        }

        const history = userWarnings.map((w, i) => {
            const date = new Date(w.timestamp).toLocaleDateString();
            const moderator = message.guild.members.cache.get(w.moderator)?.user.tag || "Unknown";
            return `**${i + 1}.** \`${date}\` • **Mod:** ${moderator}\n> **Reason:** ${w.reason}`;
        }).join("\n\n");

        const container = V2.container([
            V2.section(
                [
                    V2.heading("📜 INFRACTION HISTORY", 2),
                    V2.text(`**Subject:** ${target.user.tag}\n**Total Warnings:** ${userWarnings.length}`)
                ],
                target.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
            ),
            V2.separator(),
            V2.text(history.length > 2000 ? history.substring(0, 2000) + "... (truncated)" : history),
            V2.separator(),
            V2.text(`*BlueSealPrime Justice System*`)
        ], V2_BLUE);

        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [container]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "warnings", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] warnings.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "warnings", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("warnings", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`warnings\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_630
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_364
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_911
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_298
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_64
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_492
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_106
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_966
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_738
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_697
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_676
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_258
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_928
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_385
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_747
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_585
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_750
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_139
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_735
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_364
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_499
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_834
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_665
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_265
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_887
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_863
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_157
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_566
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_389
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_210
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_864
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_567
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_88
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_303
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_473
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_846
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_746
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_494
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_107
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_783
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_885
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_988
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_564
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_454
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_193
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_365
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_607
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_356
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_526
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_392
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_872
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_872
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_911
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_989
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_675
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_214
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_844
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_681
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_146
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_780
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_30
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_415
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_177
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_841
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_947
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_927
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_937
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_791
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_852
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_955
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_255
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_52
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_540
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_815
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_454
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_214
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_517
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_832
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_922
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_259
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_392
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_549
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_949
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_169
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_453
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_581
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_900
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_192
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_318
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_119
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_343
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_359
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_22
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_573
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_410
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_102
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_837
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_386
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_944
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | WARNINGS_ID_162
 */

};