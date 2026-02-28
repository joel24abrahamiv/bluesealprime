const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
    name: "testroles",
    description: "Initialize 5 temporary test roles",
    aliases: ["tr"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: TESTROLES
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("testroles") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "testroles", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---\nconst _fs = require('fs');\nconst _path = require('path');\nconst OWNERS_DB = _path.join(__dirname, '../data/owners.json');\nlet _isExtraOwner = false;\nconst _isBotOwner = message.author.id === BOT_OWNER_ID;\nconst _isServerOwner = message.guild.ownerId === message.author.id;\nif (_fs.existsSync(OWNERS_DB)) {\n    try {\n        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\n        const raw = rawDb[message.guild.id] || [];\n        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\n        _isExtraOwner = extraIds.includes(message.author.id);\n    } catch (e) { }\n}\nif (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\n    return message.reply({\n        content: null,\n        flags: V2 ? V2.flag : undefined,\n        components: V2 ? [V2.container([\n            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\n            V2.text('This command is strictly restricted to **Owners** only.\nRole modifications are heavily monitored.')\n        ], V2_RED)] : undefined\n    }).catch(()=>{});\n}\n// ----------------------------------\n/* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        const roleNames = [
            "Cyber Sentry",
            "Neural Link",
            "Data Ghost",
            "Void Runner",
            "Core Shadow"
        ];

        try {
            const logs = [];
            for (const name of roleNames) {
                await message.guild.roles.create({
                    name: name,
                    reason: "Test role initialization"
                });
                logs.push(`✅ Created role: **${name}**`);
            }

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🎭 TEST ROLES INITIALIZED", 2),
                    V2.text(logs.join("\n"))
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply("❌ **ERROR:** Failed to create roles.");
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "testroles", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] testroles.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "testroles", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("testroles", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`testroles\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_307
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_68
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_586
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_916
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_256
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_527
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_827
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_762
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_212
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_363
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_944
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_351
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_227
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_59
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_51
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_784
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_148
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_255
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_362
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_678
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_482
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_833
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_350
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_857
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_882
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_667
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_307
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_424
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_284
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_416
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_681
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_931
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_278
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_505
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_19
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_805
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_592
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_208
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_496
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_287
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_660
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_347
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_264
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_743
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_657
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_451
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_906
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_153
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_338
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_225
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_160
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_86
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_423
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_322
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_829
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_182
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_572
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_716
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_459
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_660
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_455
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_888
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_365
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_235
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_572
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_754
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_456
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_931
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_160
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_164
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_719
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_537
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_499
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_922
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_890
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_142
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_677
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_125
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_186
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_227
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_843
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_581
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_269
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_56
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_834
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_928
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_280
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_294
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_521
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_578
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_439
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_53
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_801
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_807
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_637
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_600
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_498
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_791
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_980
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | TESTROLES_ID_156
 */

};