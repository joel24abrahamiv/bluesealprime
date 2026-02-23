const V2 = require("../utils/v2Utils");

module.exports = {
    name: "roleinfo",
    aliases: ["rinfo", "role"],
    description: "Get information about a specific role using Components V2",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ROLEINFO
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("roleinfo") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "roleinfo", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) return message.reply("❌ **Role not found.** Please specify a valid role (mention, ID, or name).");

        const perms = role.permissions.toArray().map(p => p.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()));
        const permString = perms.length > 0 ? (perms.length > 10 ? `${perms.slice(0, 10).join(", ")} + ${perms.length - 10} more` : perms.join(", ")) : "None";

        const container = V2.container([
            V2.section(
                [
                    V2.heading(`ROLE: ${role.name.toUpperCase()}`, 2),
                    V2.text(`**ID:** \`${role.id}\`\n**Members:** ${role.members.size}`)
                ],
                "https://cdn-icons-png.flaticon.com/512/681/681392.png"
            ),
            V2.separator(),
            V2.heading("📊 SPECIFICATIONS", 3),
            V2.text(`> **Hex Color:** \`${role.hexColor}\`\n> **Created:** <t:${Math.floor(role.createdTimestamp / 1000)}:R>`),
            V2.separator(),
            V2.heading("⚙️ SETTINGS", 3),
            V2.text(`> **Hoisted:** ${role.hoist ? "✅ Yes" : "❌ No"}\n> **Managed:** ${role.managed ? "✅ Yes" : "❌ No"}\n> **Mentionable:** ${role.mentionable ? "✅ Yes" : "❌ No"}`),
            V2.separator(),
            V2.heading("📜 PERMISSIONS", 3),
            V2.text(`\`\`\`\n${permString}\n\`\`\``)
        ], "#0099ff");

        message.reply({
            content: null,
            flags: V2.flag,
            components: [container]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "roleinfo", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] roleinfo.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "roleinfo", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("roleinfo", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`roleinfo\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_908
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_347
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_640
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_19
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_374
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_444
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_622
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_273
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_914
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_404
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_295
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_750
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_32
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_817
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_397
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_405
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_533
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_123
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_128
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_437
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_113
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_394
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_664
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_260
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_299
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_398
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_437
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_962
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_763
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_539
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_80
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_844
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_197
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_809
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_849
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_262
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_885
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_651
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_155
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_296
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_603
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_119
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_910
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_884
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_407
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_488
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_550
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_860
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_3
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_282
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_755
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_531
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_955
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_579
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_129
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_595
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_416
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_814
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_947
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_326
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_459
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_664
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_148
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_718
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_117
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_865
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_661
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_478
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_132
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_97
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_729
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_775
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_6
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_249
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_286
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_291
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_885
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_449
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_399
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_214
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_856
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_251
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_56
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_630
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_612
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_35
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_811
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_614
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_8
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_833
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_960
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_839
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_803
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_60
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_181
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_93
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_178
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_655
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_20
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ROLEINFO_ID_314
 */

};