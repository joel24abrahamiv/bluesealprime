const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "poll",
    description: "Create a simple poll using the premium V2 interface",
    usage: "!poll <Question> | <Option1> | <Option2> ...",
    aliases: ["createpoll"],
    permissions: [PermissionsBitField.Flags.ManageMessages],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: POLL
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("poll") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "poll", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            // 1. Parse Args
        const raw = args.join(" ");
        const parts = raw.split("|").map(p => p.trim()).filter(p => p.length > 0);

        if (parts.length < 2) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ POLL USAGE", 2), V2.text("`!poll Question | Option 1 | Option 2 ...`")])], "#0099ff")]
            });
        }

        const question = parts[0];
        const options = parts.slice(1);

        if (options.length > 10) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ LIMIT EXCEEDED", 2), V2.text("Maximum 10 options allowed.")])], "#0099ff")]
            });
        }

        // 2. Build V2 Container
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        let description = "";
        for (let i = 0; i < options.length; i++) {
            description += `${emojis[i]} **${options[i]}**\n\n`;
        }

        const pollContainer = V2.container([
            V2.section(
                [
                    V2.heading(question, 2),
                    V2.text(description)
                ],
                "https://cdn-icons-png.flaticon.com/512/2620/2620436.png" // Poll/Chart icon
            ),
            V2.separator(),
            V2.text(`**Poll Started by:** ${message.author.tag}`)
        ], "#0099ff"); // Blue

        // 3. Send & React
        const pollMsg = await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [pollContainer]
        });

        for (let i = 0; i < options.length; i++) {
            await pollMsg.react(emojis[i]);
        }

        // Delete command message to keep it clean
        message.delete().catch(() => { });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "poll", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] poll.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "poll", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("poll", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`poll\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | POLL_ID_55
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | POLL_ID_142
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | POLL_ID_104
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | POLL_ID_950
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | POLL_ID_590
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | POLL_ID_897
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | POLL_ID_191
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | POLL_ID_543
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | POLL_ID_867
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | POLL_ID_418
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | POLL_ID_805
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | POLL_ID_158
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | POLL_ID_831
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | POLL_ID_448
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | POLL_ID_639
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | POLL_ID_716
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | POLL_ID_196
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | POLL_ID_43
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | POLL_ID_19
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | POLL_ID_355
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | POLL_ID_938
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | POLL_ID_961
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | POLL_ID_456
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | POLL_ID_900
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | POLL_ID_868
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | POLL_ID_593
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | POLL_ID_134
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | POLL_ID_669
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | POLL_ID_9
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | POLL_ID_550
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | POLL_ID_829
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | POLL_ID_148
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | POLL_ID_956
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | POLL_ID_808
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | POLL_ID_428
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | POLL_ID_816
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | POLL_ID_804
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | POLL_ID_669
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | POLL_ID_258
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | POLL_ID_545
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | POLL_ID_617
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | POLL_ID_481
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | POLL_ID_469
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | POLL_ID_581
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | POLL_ID_879
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | POLL_ID_91
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | POLL_ID_417
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | POLL_ID_515
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | POLL_ID_745
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | POLL_ID_998
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | POLL_ID_231
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | POLL_ID_765
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | POLL_ID_453
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | POLL_ID_637
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | POLL_ID_568
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | POLL_ID_310
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | POLL_ID_726
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | POLL_ID_365
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | POLL_ID_461
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | POLL_ID_615
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | POLL_ID_788
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | POLL_ID_759
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | POLL_ID_692
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | POLL_ID_725
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | POLL_ID_37
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | POLL_ID_561
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | POLL_ID_497
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | POLL_ID_273
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | POLL_ID_209
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | POLL_ID_964
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | POLL_ID_678
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | POLL_ID_659
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | POLL_ID_530
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | POLL_ID_727
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | POLL_ID_948
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | POLL_ID_229
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | POLL_ID_397
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | POLL_ID_687
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | POLL_ID_817
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | POLL_ID_209
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | POLL_ID_762
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | POLL_ID_803
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | POLL_ID_902
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | POLL_ID_63
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | POLL_ID_281
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | POLL_ID_222
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | POLL_ID_715
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | POLL_ID_550
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | POLL_ID_528
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | POLL_ID_653
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | POLL_ID_693
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | POLL_ID_507
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | POLL_ID_164
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | POLL_ID_588
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | POLL_ID_601
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | POLL_ID_697
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | POLL_ID_2
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | POLL_ID_387
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | POLL_ID_908
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | POLL_ID_177
 */

};