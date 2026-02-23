const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "warn",
    description: "Issue a formal reprimand using the V2 interface",
    usage: "!warn @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: WARN
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("warn") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "warn", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const fs = require("fs");
        const path = require("path");
        const V2 = require("../utils/v2Utils");

        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.heading("⚠️ MISSING TARGET", 3), V2.text("Usage: `!warn @user [reason]`")], V2_BLUE)]
        });

        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [
                    V2.container([
                        V2.section(
                            [
                                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                                V2.text(`Did you seriously just try to warn ${target.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
                            ],
                            target.user.displayAvatarURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text(`> You have no power here, ${message.author}. Know your place.`),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Sovereign Protection*")
                    ], "#FF0000")
                ]
            });
        }

        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("🚫 HIERARCHY ERROR", 3), V2.text("You cannot warn a superior/equal.")], V2_RED)]
            });
        }

        const reason = args.slice(1).join(" ") || "No reason provided.";
        const DB_PATH = path.join(__dirname, "../data/warnings.json");

        // LOAD DB
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }
        if (!db[message.guild.id]) db[message.guild.id] = {};
        if (!db[message.guild.id][target.id]) db[message.guild.id][target.id] = [];

        // ADD WARNING
        const warning = {
            id: Date.now().toString(36),
            reason: reason,
            moderator: message.author.id,
            timestamp: Date.now()
        };
        db[message.guild.id][target.id].push(warning);
        const count = db[message.guild.id][target.id].length;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        // V2 WARNING CONTAINER
        const warnContainer = V2.container([
            V2.section(
                [
                    V2.heading("⚠️ OFFICIAL REPRIMAND", 2),
                    V2.text(`**Subject:** ${target.user.tag}\n**Moderator:** ${message.author}\n**Status:** Recorded (Warn #${count})`)
                ],
                "https://cdn-icons-png.flaticon.com/512/564/564619.png"
            ),
            V2.separator(),
            V2.heading("📜 CITATION DETAILS", 3),
            V2.text(`> **Reason:** ${reason}\n> **Domain:** ${message.guild.name}`),
            V2.separator(),
            V2.text(`*BlueSealPrime Justice System*`)
        ], V2_RED);

        // DM THE USER
        try {
            const warnNotice = V2.container([
                V2.section(
                    [
                        V2.heading("⚠️ OFFICIAL REPRIMAND", 2),
                        V2.text(`You have received a formal warning in **${message.guild.name}**.`)
                    ],
                    message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
                ),
                V2.separator(),
                V2.heading("📝 CITATION DETAILS", 3),
                V2.text(`> ${reason}`),
                V2.separator(),
                V2.text(`**Moderator:** ${message.author.tag}\n**Total Warnings:** ${count}\n\n*Accumulating warnings will result in automatic expulsion.*`)
            ], V2_BLUE);
            await target.send({ content: null, flags: V2.flag, components: [warnNotice] }).catch(() => { });
        } catch (e) { }

        await message.channel.send({ content: null, flags: V2.flag, components: [warnContainer] });

        // AUTO-PUNISHMENT
        if (count >= 5) {
            if (target.bannable) {
                await target.ban({ reason: "Auto-Ban: Accumulated 5 Warnings" });
                const banEmbed = V2.container([
                    V2.heading("⛔ AUTOMATIC BAN", 2),
                    V2.text(`**Threshold Reached (5 Warnings)**\nUser **${target.user.tag}** has been permanently banned.`)
                ], V2_RED);
                message.channel.send({ content: null, flags: V2.flag, components: [banEmbed] });
                // Reset warns? Usually we keep them for record, or archive. Let's keep them.
            }
        } else if (count >= 3) {
            if (target.kickable) {
                await target.kick("Auto-Kick: Accumulated 3 Warnings");
                const kickEmbed = V2.container([
                    V2.heading("👢 AUTOMATIC KICK", 2),
                    V2.text(`**Threshold Reached (3 Warnings)**\nUser **${target.user.tag}** has been kicked.`)
                ], V2_RED);
                message.channel.send({ content: null, flags: V2.flag, components: [kickEmbed] });
            }
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "warn", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] warn.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "warn", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("warn", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`warn\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | WARN_ID_530
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | WARN_ID_259
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | WARN_ID_373
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | WARN_ID_738
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | WARN_ID_575
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | WARN_ID_364
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | WARN_ID_537
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | WARN_ID_336
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | WARN_ID_499
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | WARN_ID_249
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | WARN_ID_525
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | WARN_ID_57
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | WARN_ID_251
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | WARN_ID_989
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | WARN_ID_633
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | WARN_ID_445
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | WARN_ID_311
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | WARN_ID_989
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | WARN_ID_703
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | WARN_ID_439
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | WARN_ID_745
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | WARN_ID_417
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | WARN_ID_754
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | WARN_ID_237
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | WARN_ID_896
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | WARN_ID_232
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | WARN_ID_126
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | WARN_ID_808
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | WARN_ID_589
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | WARN_ID_406
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | WARN_ID_61
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | WARN_ID_957
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | WARN_ID_124
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | WARN_ID_583
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | WARN_ID_810
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | WARN_ID_369
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | WARN_ID_896
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | WARN_ID_480
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | WARN_ID_121
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | WARN_ID_498
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | WARN_ID_134
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | WARN_ID_738
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | WARN_ID_957
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | WARN_ID_74
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | WARN_ID_800
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | WARN_ID_563
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | WARN_ID_755
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | WARN_ID_959
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | WARN_ID_926
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | WARN_ID_810
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | WARN_ID_453
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | WARN_ID_730
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | WARN_ID_672
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | WARN_ID_580
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | WARN_ID_802
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | WARN_ID_289
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | WARN_ID_512
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | WARN_ID_23
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | WARN_ID_681
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | WARN_ID_366
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | WARN_ID_913
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | WARN_ID_674
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | WARN_ID_536
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | WARN_ID_822
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | WARN_ID_509
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | WARN_ID_209
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | WARN_ID_703
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | WARN_ID_9
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | WARN_ID_617
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | WARN_ID_843
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | WARN_ID_754
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | WARN_ID_145
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | WARN_ID_454
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | WARN_ID_194
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | WARN_ID_251
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | WARN_ID_815
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | WARN_ID_55
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | WARN_ID_447
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | WARN_ID_576
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | WARN_ID_192
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | WARN_ID_468
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | WARN_ID_963
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | WARN_ID_551
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | WARN_ID_764
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | WARN_ID_566
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | WARN_ID_412
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | WARN_ID_479
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | WARN_ID_168
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | WARN_ID_127
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | WARN_ID_428
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | WARN_ID_215
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | WARN_ID_588
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | WARN_ID_746
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | WARN_ID_656
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | WARN_ID_698
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | WARN_ID_842
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | WARN_ID_827
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | WARN_ID_342
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | WARN_ID_22
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | WARN_ID_966
 */

};