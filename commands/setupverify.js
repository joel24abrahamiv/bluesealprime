const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "setupverify",
    description: "Setup the premium verification panel",
    usage: "!setupverify #channel @role",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SETUPVERIFY
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("setupverify") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "setupverify", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== BOT_OWNER_ID) return;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!channel || !role)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!setupverify #channel @role`")], V2_RED)] });

        // ───── PREMIUM DESIGN CONSTRUCTION ─────
        // (1) ActionRowBuilder for the Verify Button
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_${role.id}`)
                .setLabel("✅ Verify Membership")
                .setStyle(ButtonStyle.Success)
        );

        // (2) Builder Ensemble: Container, Section, Heading, Text, Separator, Thumbnail
        const verifyPanel = V2.container([
            // Header Section with Thumbnail
            V2.section([
                V2.heading("🛡️ SOVEREIGN GATEWAY", 1),
                V2.text("Biometric & Identity Authentication Required")
            ], V2.thumbnail(message.guild.iconURL({ dynamic: true, size: 512 }) || V2.botAvatar(message))),

            V2.separator(),

            // Info Section
            V2.text("To access the restricted sectors of this dominion, you must verify your identity. This process ensures the integrity and security of the Sovereign network.\n\n> **Authorized Access Only**"),

            V2.separator(),

            // Guidelines Section
            V2.text("**Identity Registry:** You will be granted the role: " + role.name + "\n**Security Protocol:** By verifying, you commit to honoring all Imperial Statutes."),

            // Final Action Row (7th Builder usage)
            row
        ], V2_BLUE);

        try {
            await channel.send({
                flags: V2.flag,
                components: [verifyPanel]
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(`💎 **Sovereign Gateway synchronized with ${channel}.**\nRegistry Role: ${role}`)], V2_BLUE)]
            });
        } catch (e) {
            console.error("SetupVerify Error:", e);
            return message.reply({ content: "❌ Failed to send panel. Ensure the bot has permissions in that channel." });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setupverify", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] setupverify.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setupverify", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("setupverify", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`setupverify\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_103
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_392
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_789
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_612
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_569
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_491
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_52
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_48
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_309
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_301
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_419
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_607
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_516
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_781
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_575
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_835
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_536
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_27
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_43
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_116
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_654
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_704
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_936
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_14
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_428
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_80
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_714
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_274
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_900
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_516
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_572
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_700
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_19
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_106
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_312
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_216
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_88
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_292
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_600
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_913
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_392
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_155
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_11
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_406
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_249
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_705
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_34
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_969
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_712
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_465
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_923
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_133
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_741
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_48
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_288
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_547
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_571
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_299
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_958
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_335
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_499
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_770
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_510
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_24
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_416
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_774
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_455
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_707
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_695
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_998
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_591
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_172
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_276
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_414
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_806
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_605
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_78
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_887
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_765
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_686
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_55
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_350
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_94
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_426
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_534
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_278
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_432
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_411
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_954
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_515
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_46
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_349
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_214
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_94
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_444
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_336
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_595
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_462
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_131
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SETUPVERIFY_ID_551
 */

};