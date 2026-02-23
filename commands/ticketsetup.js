const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "ticketsetup",
    description: "Deploy the Secure Ticket Panel",
    usage: "!ticketsetup",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: TICKETSETUP
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("ticketsetup") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "ticketsetup", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission Check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🚫 ACCESS DENIED", 3),
                    V2.text("You require Administrator privileges to deploy this terminal.")
                ], V2_RED)]
            });
        }

        // Clean up command message
        message.delete().catch(() => { });

        // Create Select Menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🔹 Initiate Secure Connection")
            .addOptions([
                {
                    label: "General Support",
                    description: "Request assistance with server matters.",
                    emoji: "🎫",
                    value: "ticket_support"
                },
                {
                    label: "Incident Report",
                    description: "Report a rule violation or technical anomaly.",
                    emoji: "⚠️",
                    value: "ticket_report"
                },
                {
                    label: "Security Application",
                    description: "Apply to join the Sovereign Security Team.",
                    emoji: "🛡️",
                    value: "ticket_apply"
                }
            ]);

        // Wrap in ActionRow
        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Build V2 Container
        const container = V2.container([
            V2.section([
                V2.heading("🛡️ SOVEREIGN SUPPORT TERMINAL", 2),
                V2.text("**Authenticate to establish a private channel.**\n> Select an issue classification below to initiate a secure data line with active personnel.")
            ], message.guild.iconURL({ dynamic: true, size: 512 })),
            V2.separator(),
            V2.heading("📂 CLASSIFICATIONS", 3),
            V2.text("> 📩 **General Support**\n> ⚠️ **Incident Reports**\n> 🤝 **Security Applications**"),
            V2.text("\n\n*A staff member will arrive shortly after connection.*"),
            V2.separator(),
            row, // Embedded ActionRow
            V2.separator(),
            V2.text("*BlueSealPrime • Encrypted Support Protocol*")
        ], V2_BLUE);

        // Send Panel
        await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [container]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ticketsetup", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] ticketsetup.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ticketsetup", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("ticketsetup", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`ticketsetup\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_63
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_652
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_537
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_327
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_393
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_150
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_533
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_173
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_310
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_904
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_625
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_223
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_100
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_519
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_330
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_450
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_714
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_822
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_778
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_403
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_929
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_97
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_437
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_35
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_268
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_805
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_136
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_28
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_835
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_478
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_306
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_349
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_106
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_617
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_776
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_274
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_49
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_773
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_791
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_958
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_661
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_859
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_226
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_483
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_406
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_20
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_694
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_139
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_977
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_168
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_969
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_523
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_134
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_836
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_311
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_191
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_441
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_238
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_461
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_447
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_881
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_232
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_21
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_478
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_210
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_294
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_887
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_352
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_526
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_25
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_47
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_94
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_236
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_19
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_335
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_602
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_516
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_568
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_476
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_728
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_927
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_984
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_534
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_817
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_721
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_102
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_308
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_108
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_121
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_355
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_733
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_590
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_344
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_478
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_133
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_593
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_841
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_291
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_863
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | TICKETSETUP_ID_567
 */

};