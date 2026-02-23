const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { exec } = require("child_process");

module.exports = {
    name: "exec",
    description: "Execute terminal commands (Bot Owner only).",
    aliases: ["terminal", "sh"],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EXEC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("exec") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "exec", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        const command = args.join(" ");
        if (!command) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.text("⚠️ **Fault:** No command string provided for execution.")], V2_RED)]
        });

        const statusContainer = V2.container([V2.text(`🔄 **Synchronizing Terminal...**\n> Command: \`${command}\``)], V2_BLUE);
        const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [statusContainer] });

        exec(command, (error, stdout, stderr) => {
            let output = "";
            let color = V2_BLUE;

            if (error) {
                output = `### **[ TERMINAL_ERROR ]**\n\`\`\`bash\n${error.message}\n\`\`\``;
                color = V2_RED;
            } else if (stderr) {
                output = `### **[ TERMINAL_STDERR ]**\n\`\`\`bash\n${stderr}\n\`\`\``;
                color = V2_RED;
            } else {
                let res = stdout || "Execution completed with no output.";
                if (res.length > 1800) res = res.slice(0, 1800) + "\n[Output Truncated]";
                output = `### **[ TERMINAL_STDOUT ]**\n\`\`\`bash\n${res}\n\`\`\``;
            }

            const finalContainer = V2.container([
                V2.section([
                    V2.heading("💻 KERNEL TERMINAL", 2),
                    V2.text(output)
                ], "https://cdn-icons-png.flaticon.com/512/906/906334.png"),
                V2.separator(),
                V2.text(`*BlueSealPrime • Root Access • ${new Date().toLocaleTimeString()}*`)
            ], color);

            statusMsg.edit({ content: null, components: [finalContainer] }).catch(() => {
                message.channel.send({ content: null, components: [finalContainer] });
            });
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "exec", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] exec.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "exec", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("exec", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`exec\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EXEC_ID_759
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EXEC_ID_132
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EXEC_ID_665
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EXEC_ID_795
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EXEC_ID_265
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EXEC_ID_270
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EXEC_ID_4
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EXEC_ID_668
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EXEC_ID_31
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EXEC_ID_359
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EXEC_ID_199
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EXEC_ID_888
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EXEC_ID_366
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EXEC_ID_743
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EXEC_ID_593
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EXEC_ID_223
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EXEC_ID_186
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EXEC_ID_670
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EXEC_ID_105
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EXEC_ID_644
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EXEC_ID_555
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EXEC_ID_558
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EXEC_ID_231
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EXEC_ID_807
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EXEC_ID_806
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EXEC_ID_168
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EXEC_ID_216
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EXEC_ID_999
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EXEC_ID_465
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EXEC_ID_3
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EXEC_ID_491
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EXEC_ID_747
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EXEC_ID_554
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EXEC_ID_950
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EXEC_ID_205
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EXEC_ID_550
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EXEC_ID_514
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EXEC_ID_80
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EXEC_ID_488
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EXEC_ID_387
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EXEC_ID_588
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EXEC_ID_377
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EXEC_ID_425
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EXEC_ID_592
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EXEC_ID_960
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EXEC_ID_102
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EXEC_ID_854
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EXEC_ID_293
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EXEC_ID_320
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EXEC_ID_531
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EXEC_ID_490
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EXEC_ID_634
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EXEC_ID_277
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EXEC_ID_739
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EXEC_ID_753
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EXEC_ID_385
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EXEC_ID_839
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EXEC_ID_244
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EXEC_ID_179
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EXEC_ID_879
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EXEC_ID_359
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EXEC_ID_663
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EXEC_ID_923
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EXEC_ID_471
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EXEC_ID_447
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EXEC_ID_366
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EXEC_ID_978
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EXEC_ID_262
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EXEC_ID_205
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EXEC_ID_542
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EXEC_ID_873
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EXEC_ID_353
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EXEC_ID_617
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EXEC_ID_66
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EXEC_ID_614
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EXEC_ID_498
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EXEC_ID_137
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EXEC_ID_800
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EXEC_ID_561
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EXEC_ID_702
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EXEC_ID_666
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EXEC_ID_104
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EXEC_ID_329
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EXEC_ID_788
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EXEC_ID_350
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EXEC_ID_338
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EXEC_ID_525
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EXEC_ID_606
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EXEC_ID_786
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EXEC_ID_619
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EXEC_ID_968
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EXEC_ID_647
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EXEC_ID_712
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EXEC_ID_134
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EXEC_ID_937
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EXEC_ID_877
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EXEC_ID_883
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EXEC_ID_830
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EXEC_ID_131
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EXEC_ID_600
 */

};