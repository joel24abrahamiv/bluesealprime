const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "log",
    description: "Setup or disable server logging channels.",
    aliases: ["logs", "logging", "logset"],
    permissions: [PermissionsBitField.Flags.ManageGuild],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LOG
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("log") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "log", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const DB_PATH = path.join(__dirname, "../data/logs.json");
        const dataDir = path.join(__dirname, "../data");
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        let data = {};
        if (fs.existsSync(DB_PATH)) { try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { } }

        const type = args[0]?.toLowerCase();
        const subCommand = args[1]?.toLowerCase();
        const validTypes = ["message", "mod", "verify", "whitelist", "security", "server", "role", "file", "voice", "member", "action", "channel", "invite", "ticket", "admin", "quark", "raid", "misuse"];

        if (!type || !validTypes.includes(type) || (subCommand !== "set" && subCommand !== "off")) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("📋 UNIVERSAL LOGGING SYSTEM", 2),
                    V2.text("Configure separate channels for specific server activities."),
                    V2.separator(),
                    V2.heading("📝 Usage", 3),
                    V2.text(
                        `> **Set:** \`!log <type> set #channel\`\n> **Off:** \`!log <type> off\`\n\n` +
                        `**Available Types:**\n> \`message\` \`mod\` \`server\` \`role\` \`file\` \`voice\`\n> \`member\` \`action\` \`channel\` \`invite\` \`ticket\` \`admin\`\n> \`quark\` \`raid\` \`verify\` \`whitelist\` \`security\` \`misuse\``
                    ),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Logging Module*")
                ], V2_BLUE)]
            });
        }

        if (!data[message.guild.id]) data[message.guild.id] = {};

        if (subCommand === "set") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channel || channel.type !== 0)
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Invalid Channel:** Please mention a valid text channel.")], V2_RED)] });

            data[message.guild.id][type] = channel.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading(`✅ ${type.toUpperCase()} LOGGING ENABLED`, 2),
                    V2.text(`${type.charAt(0).toUpperCase() + type.slice(1)} logs will now be sent to ${channel}.`)
                ], V2_BLUE)]
            });
        }

        if (subCommand === "off") {
            if (data[message.guild.id]?.[type]) {
                delete data[message.guild.id][type];
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🔒 **${type.toUpperCase()} Logging** has been disabled.`)], V2_BLUE)] });
            }
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`⚠️ **${type.toUpperCase()} logging is already disabled.**`)], V2_BLUE)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "log", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] log.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "log", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("log", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`log\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LOG_ID_975
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LOG_ID_73
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LOG_ID_468
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LOG_ID_722
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LOG_ID_392
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LOG_ID_133
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LOG_ID_406
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LOG_ID_633
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LOG_ID_531
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LOG_ID_242
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LOG_ID_681
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LOG_ID_647
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LOG_ID_230
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LOG_ID_958
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LOG_ID_628
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LOG_ID_328
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LOG_ID_489
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LOG_ID_948
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LOG_ID_519
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LOG_ID_846
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LOG_ID_254
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LOG_ID_830
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LOG_ID_313
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LOG_ID_511
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LOG_ID_90
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LOG_ID_476
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LOG_ID_618
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LOG_ID_775
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LOG_ID_370
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LOG_ID_343
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LOG_ID_84
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LOG_ID_401
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LOG_ID_421
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LOG_ID_685
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LOG_ID_215
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LOG_ID_921
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LOG_ID_431
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LOG_ID_884
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LOG_ID_281
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LOG_ID_680
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LOG_ID_663
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LOG_ID_41
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LOG_ID_486
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LOG_ID_626
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LOG_ID_860
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LOG_ID_367
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LOG_ID_441
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LOG_ID_253
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LOG_ID_358
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LOG_ID_100
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LOG_ID_781
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LOG_ID_386
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LOG_ID_35
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LOG_ID_980
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LOG_ID_993
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LOG_ID_43
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LOG_ID_411
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LOG_ID_514
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LOG_ID_750
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LOG_ID_704
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LOG_ID_339
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LOG_ID_447
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LOG_ID_846
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LOG_ID_163
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LOG_ID_410
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LOG_ID_200
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LOG_ID_979
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LOG_ID_519
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LOG_ID_470
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LOG_ID_71
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LOG_ID_81
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LOG_ID_943
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LOG_ID_536
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LOG_ID_344
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LOG_ID_349
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LOG_ID_198
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LOG_ID_170
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LOG_ID_599
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LOG_ID_936
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LOG_ID_109
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LOG_ID_386
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LOG_ID_857
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LOG_ID_222
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LOG_ID_877
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LOG_ID_587
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LOG_ID_718
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LOG_ID_558
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LOG_ID_651
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LOG_ID_633
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LOG_ID_560
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LOG_ID_12
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LOG_ID_355
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LOG_ID_745
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LOG_ID_603
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LOG_ID_632
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LOG_ID_887
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LOG_ID_260
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LOG_ID_432
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LOG_ID_201
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LOG_ID_605
 */

};