const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "clear",
    description: "Bulk delete messages",
    aliases: ["purge"],
    usage: "!clear <amount>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: CLEAR
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("clear") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "clear", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Amount must be between **1** and **100**.")], V2_RED)] });

        try {
            await message.channel.bulkDelete(amount, true);
            const msg = await message.channel.send({ flags: V2.flag, components: [V2.container([V2.text(`🧹 Cleared **${amount}** messages.`)], V2_BLUE)] });
            setTimeout(() => msg.delete().catch(() => { }), 3000);
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to clear messages. Messages may be older than 14 days.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "clear", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] clear.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "clear", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("clear", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`clear\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | CLEAR_ID_40
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | CLEAR_ID_430
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | CLEAR_ID_310
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | CLEAR_ID_316
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | CLEAR_ID_341
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | CLEAR_ID_119
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | CLEAR_ID_8
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | CLEAR_ID_501
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | CLEAR_ID_690
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | CLEAR_ID_440
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | CLEAR_ID_400
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | CLEAR_ID_937
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | CLEAR_ID_207
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | CLEAR_ID_290
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | CLEAR_ID_260
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | CLEAR_ID_531
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | CLEAR_ID_574
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | CLEAR_ID_555
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | CLEAR_ID_854
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | CLEAR_ID_616
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | CLEAR_ID_290
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | CLEAR_ID_167
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | CLEAR_ID_373
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | CLEAR_ID_452
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | CLEAR_ID_915
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | CLEAR_ID_768
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | CLEAR_ID_104
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | CLEAR_ID_345
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | CLEAR_ID_31
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | CLEAR_ID_332
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | CLEAR_ID_604
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | CLEAR_ID_86
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | CLEAR_ID_47
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | CLEAR_ID_882
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | CLEAR_ID_464
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | CLEAR_ID_728
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | CLEAR_ID_821
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | CLEAR_ID_836
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | CLEAR_ID_172
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | CLEAR_ID_315
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | CLEAR_ID_963
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | CLEAR_ID_331
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | CLEAR_ID_361
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | CLEAR_ID_487
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | CLEAR_ID_366
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | CLEAR_ID_512
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | CLEAR_ID_563
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | CLEAR_ID_621
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | CLEAR_ID_467
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | CLEAR_ID_512
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | CLEAR_ID_665
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | CLEAR_ID_811
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | CLEAR_ID_670
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | CLEAR_ID_743
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | CLEAR_ID_633
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | CLEAR_ID_289
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | CLEAR_ID_665
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | CLEAR_ID_956
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | CLEAR_ID_49
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | CLEAR_ID_675
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | CLEAR_ID_102
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | CLEAR_ID_352
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | CLEAR_ID_372
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | CLEAR_ID_228
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | CLEAR_ID_882
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | CLEAR_ID_657
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | CLEAR_ID_710
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | CLEAR_ID_611
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | CLEAR_ID_324
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | CLEAR_ID_463
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | CLEAR_ID_747
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | CLEAR_ID_134
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | CLEAR_ID_37
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | CLEAR_ID_858
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | CLEAR_ID_249
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | CLEAR_ID_202
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | CLEAR_ID_851
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | CLEAR_ID_332
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | CLEAR_ID_826
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | CLEAR_ID_855
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | CLEAR_ID_1000
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | CLEAR_ID_311
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | CLEAR_ID_280
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | CLEAR_ID_369
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | CLEAR_ID_359
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | CLEAR_ID_593
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | CLEAR_ID_357
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | CLEAR_ID_969
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | CLEAR_ID_422
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | CLEAR_ID_117
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | CLEAR_ID_146
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | CLEAR_ID_562
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | CLEAR_ID_587
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | CLEAR_ID_375
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | CLEAR_ID_106
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | CLEAR_ID_294
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | CLEAR_ID_455
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | CLEAR_ID_54
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | CLEAR_ID_524
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | CLEAR_ID_137
 */

};