const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "say",
    description: "Broadcast a message using the premium V2 interface",
    usage: "!say <message> OR !say <Title> | <Description> | <Color>",
    permissions: [PermissionsBitField.Flags.ManageMessages],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SAY
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("say") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "say", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("🚫 PERMISSION DENIED", 2), V2.text("I do not have permission to manage messages.")])], V2_RED)]
            });
        }

        if (args.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ MISSING CONTENT", 2), V2.text("**Usage:**\n`!say Hello`\n`!say Title | Description | Color`")])], V2_RED)]
            });
        }

        // Delete user message to make it look like bot is speaking
        message.delete().catch(() => { });

        const rawContent = args.join(" ");

        // Check for pipe | splitting for Advanced Mode
        if (rawContent.includes("|")) {
            const parts = rawContent.split("|").map(p => p.trim());
            const title = parts[0];
            const desc = parts[1];
            const color = parts[2] || V2_BLUE; // Default Blue if not provided

            const announcementContainer = V2.container([
                V2.section(
                    [
                        V2.heading(title, 2),
                        V2.text(desc)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/1246/1246358.png" // Megaphone
                ),
                V2.separator(),
                V2.text(`**Broadcast by:** ${message.author.tag}`)
            ], color); // Keep user color if provided, else default

            return message.channel.send({
                content: null,
                flags: V2.flag,
                components: [announcementContainer]
            });
        } else {
            // Simple Text Mode
            const simpleContainer = V2.container([
                V2.heading("📢 ANNOUNCEMENT", 2),
                        V2.text(rawContent),
                V2.separator(),
                V2.text(`**Broadcast by:** ${message.author.tag}`)
            ], V2_BLUE);

            return message.channel.send({
                content: null,
                flags: V2.flag,
                components: [simpleContainer]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "say", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] say.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "say", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("say", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`say\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SAY_ID_650
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SAY_ID_166
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SAY_ID_621
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SAY_ID_475
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SAY_ID_108
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SAY_ID_320
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SAY_ID_335
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SAY_ID_120
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SAY_ID_958
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SAY_ID_530
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SAY_ID_540
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SAY_ID_121
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SAY_ID_577
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SAY_ID_430
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SAY_ID_818
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SAY_ID_212
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SAY_ID_780
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SAY_ID_876
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SAY_ID_42
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SAY_ID_215
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SAY_ID_533
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SAY_ID_551
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SAY_ID_659
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SAY_ID_71
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SAY_ID_952
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SAY_ID_205
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SAY_ID_38
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SAY_ID_561
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SAY_ID_347
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SAY_ID_846
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SAY_ID_620
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SAY_ID_14
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SAY_ID_747
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SAY_ID_854
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SAY_ID_607
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SAY_ID_99
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SAY_ID_909
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SAY_ID_311
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SAY_ID_587
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SAY_ID_420
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SAY_ID_568
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SAY_ID_261
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SAY_ID_619
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SAY_ID_220
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SAY_ID_949
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SAY_ID_938
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SAY_ID_830
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SAY_ID_904
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SAY_ID_574
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SAY_ID_538
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SAY_ID_46
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SAY_ID_823
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SAY_ID_187
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SAY_ID_191
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SAY_ID_26
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SAY_ID_572
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SAY_ID_710
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SAY_ID_301
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SAY_ID_217
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SAY_ID_300
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SAY_ID_561
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SAY_ID_959
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SAY_ID_571
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SAY_ID_281
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SAY_ID_608
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SAY_ID_462
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SAY_ID_952
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SAY_ID_227
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SAY_ID_992
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SAY_ID_132
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SAY_ID_953
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SAY_ID_550
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SAY_ID_580
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SAY_ID_537
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SAY_ID_376
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SAY_ID_811
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SAY_ID_383
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SAY_ID_268
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SAY_ID_684
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SAY_ID_433
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SAY_ID_216
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SAY_ID_421
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SAY_ID_297
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SAY_ID_274
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SAY_ID_912
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SAY_ID_898
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SAY_ID_341
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SAY_ID_822
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SAY_ID_164
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SAY_ID_589
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SAY_ID_3
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SAY_ID_121
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SAY_ID_265
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SAY_ID_438
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SAY_ID_828
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SAY_ID_799
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SAY_ID_371
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SAY_ID_473
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SAY_ID_630
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SAY_ID_992
 */

};