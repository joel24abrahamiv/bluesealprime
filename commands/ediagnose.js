const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "ediagnose",
    description: "Run a full system diagnostic on all modules.",
    aliases: ["ediag", "auditmodules"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EDIAGNOSE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("ediagnose") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "ediagnose", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        const authContainer = V2.container([V2.text("🛰️ **Initializing Deep System Diagnostic...** Scanning command kernel.")], V2_BLUE);
        const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [authContainer] });

        let passed = 0;
        let failed = 0;
        let errors = [];

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (!command.name || !command.execute) {
                    failed++;
                    errors.push(`\`${file}\`: Missing properties`);
                } else {
                    passed++;
                }
            } catch (error) {
                failed++;
                errors.push(`\`${file}\`: Load Failure`);
            }
        }

        const errorLog = failed > 0
            ? `### **[ ERROR_LOG ]**\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n*+ ${errors.length - 5} more...*` : ''}`
            : `> 💎 **Status:** *All systems operational. Command hierarchy intact.*`;

        const diagContainer = V2.container([
            V2.section([
                V2.heading("🛡️ SYSTEM DIAGNOSTIC REPORT", 2),
                V2.text(
                    `### **[ KERNEL_INTEGRITY ]**\n` +
                    `> ✅ **Modules Passed:** \`${passed}\` / \`${commandFiles.length}\`\n` +
                    `> ❌ **Modules Failed:** \`${failed}\`\n\n` +
                    errorLog
                )
            ], V2.botAvatar(message)),
            V2.separator(),
            V2.text("*BlueSealPrime • Kernel Diagnostics Synced*")
        ], failed > 0 ? V2_RED : "#00FF7F");

        return statusMsg.edit({ content: null, components: [diagContainer] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ediagnose", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] ediagnose.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ediagnose", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("ediagnose", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`ediagnose\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_761
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_810
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_795
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_589
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_794
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_2
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_916
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_198
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_517
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_1000
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_433
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_178
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_959
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_866
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_534
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_564
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_626
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_12
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_6
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_837
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_486
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_435
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_651
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_246
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_469
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_368
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_893
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_152
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_123
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_733
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_734
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_566
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_685
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_261
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_411
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_549
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_923
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_496
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_521
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_66
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_799
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_444
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_333
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_869
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_231
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_911
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_249
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_205
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_996
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_21
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_253
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_473
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_422
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_301
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_815
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_41
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_454
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_173
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_113
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_963
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_273
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_3
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_737
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_205
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_643
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_277
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_354
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_182
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_549
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_877
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_260
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_773
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_947
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_139
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_893
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_635
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_178
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_233
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_64
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_223
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_609
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_451
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_753
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_238
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_359
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_487
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_252
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_982
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_798
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_470
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_901
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_19
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_908
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_248
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_555
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_484
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_342
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_925
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_45
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EDIAGNOSE_ID_909
 */

};