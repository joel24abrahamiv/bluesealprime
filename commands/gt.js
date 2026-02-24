const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { inspect } = require("util");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "gt",
    description: "Evaluates arbitrary JavaScript code. (Dev Only)",
    aliases: ["eval", "js", "e"],

    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EVAL
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
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("eval") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "eval", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

            const code = args.join(" ");

            // GOD MODE TOGGLE (If no code is provided)
            if (!code) {
                global.GOD_MODE = !global.GOD_MODE;
                const status = global.GOD_MODE ? "ENABLED" : "DISABLED";
                const color = global.GOD_MODE ? "#00FF7F" : "#FF3030";

                const SYSTEM_DB = path.join(__dirname, "../data/system.json");
                try {
                    if (!fs.existsSync(path.dirname(SYSTEM_DB))) fs.mkdirSync(path.dirname(SYSTEM_DB), { recursive: true });
                    fs.writeFileSync(SYSTEM_DB, JSON.stringify({ GOD_MODE: global.GOD_MODE }, null, 2));
                } catch (e) { console.error("Failed to save system state:", e); }

                const godModeContainer = V2.container([
                    V2.section([
                        V2.heading(`🚨 KERNEL OVERRIDE: ${status}`, 2),
                        V2.text(
                            `### **[ ROOT_ACCESS_${status} ]**\n` +
                            `System Level Protocols have been **${global.GOD_MODE ? "FULLY DEPLOYED" : "RESTRICTED"}**.\n\n` +
                            `> • **!ehelp** - Full God Mode Manifest\n` +
                            `> • **!elog** - Universal Log Stream\n` +
                            `> • **!enuke** - Protocol Alpha Access\n\n` +
                            `**Current Layer:** \`root@blueseal-kernel\``
                        )
                    ], message.client.user.displayAvatarURL({ dynamic: true })),
                    V2.separator(),
                    V2.text(`*BlueSealPrime Security Matrix • Version Elite*`)
                ], color);

                return message.reply({ content: null, flags: V2.flag, components: [godModeContainer] });
            }

            // ACTUAL EVAL EXECUTION
            try {
                let evaled = eval(code);
                if (evaled instanceof Promise) evaled = await evaled;
                let output = typeof evaled !== "string" ? inspect(evaled, { depth: 0 }) : evaled;
                output = output.replace(new RegExp(message.client.token, "gi"), "[TOKEN]");
                if (output.length > 2000) output = output.slice(0, 1900) + "...";

                const resultContainer = V2.container([
                    V2.section([
                        V2.heading("💻 KERNEL EXECUTION: SUCCESS", 2),
                        V2.text(`\`\`\`js\n${output}\n\`\`\``)
                    ])
                ], V2_BLUE);

                return message.channel.send({ content: null, flags: V2.flag, components: [resultContainer] });
            } catch (err) {
                const errorContainer = V2.container([
                    V2.section([
                        V2.heading("⚠️ KERNEL EXECUTION: FAULT", 2),
                        V2.text(`\`\`\`js\n${err}\n\`\`\``)
                    ])
                ], V2_RED);
                return message.channel.send({ content: null, flags: V2.flag, components: [errorContainer] });
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "eval", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] eval.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "eval", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("eval", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`eval\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EVAL_ID_946
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EVAL_ID_678
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EVAL_ID_609
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EVAL_ID_876
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EVAL_ID_886
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EVAL_ID_7
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EVAL_ID_787
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EVAL_ID_790
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EVAL_ID_543
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EVAL_ID_775
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EVAL_ID_771
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EVAL_ID_219
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EVAL_ID_11
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EVAL_ID_416
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EVAL_ID_766
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EVAL_ID_178
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EVAL_ID_136
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EVAL_ID_144
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EVAL_ID_35
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EVAL_ID_610
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EVAL_ID_120
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EVAL_ID_318
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EVAL_ID_568
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EVAL_ID_187
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EVAL_ID_787
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EVAL_ID_623
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EVAL_ID_226
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EVAL_ID_873
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EVAL_ID_133
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EVAL_ID_392
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EVAL_ID_702
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EVAL_ID_742
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EVAL_ID_641
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EVAL_ID_7
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EVAL_ID_551
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EVAL_ID_386
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EVAL_ID_391
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EVAL_ID_860
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EVAL_ID_803
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EVAL_ID_843
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EVAL_ID_377
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EVAL_ID_526
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EVAL_ID_144
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EVAL_ID_75
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EVAL_ID_96
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EVAL_ID_451
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EVAL_ID_607
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EVAL_ID_813
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EVAL_ID_554
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EVAL_ID_336
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EVAL_ID_344
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EVAL_ID_110
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EVAL_ID_51
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EVAL_ID_875
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EVAL_ID_47
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EVAL_ID_228
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EVAL_ID_971
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EVAL_ID_271
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EVAL_ID_198
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EVAL_ID_98
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EVAL_ID_799
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EVAL_ID_530
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EVAL_ID_608
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EVAL_ID_676
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EVAL_ID_418
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EVAL_ID_222
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EVAL_ID_771
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EVAL_ID_231
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EVAL_ID_910
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EVAL_ID_616
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EVAL_ID_572
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EVAL_ID_262
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EVAL_ID_266
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EVAL_ID_69
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EVAL_ID_533
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EVAL_ID_503
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EVAL_ID_907
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EVAL_ID_193
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EVAL_ID_819
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EVAL_ID_344
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EVAL_ID_704
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EVAL_ID_526
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EVAL_ID_450
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EVAL_ID_931
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EVAL_ID_1000
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EVAL_ID_964
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EVAL_ID_851
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EVAL_ID_293
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EVAL_ID_87
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EVAL_ID_321
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EVAL_ID_128
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EVAL_ID_676
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EVAL_ID_44
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EVAL_ID_269
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EVAL_ID_246
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EVAL_ID_457
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EVAL_ID_269
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EVAL_ID_446
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EVAL_ID_409
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EVAL_ID_798
     */

};