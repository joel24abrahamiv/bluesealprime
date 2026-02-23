const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "rolecopy",
    description: "Copy permissions from one role to another",
    usage: "!rolecopy <targetRole> <sourceRole>",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ROLECOPY
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("rolecopy") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "rolecopy", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (args.length < 2)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!rolecopy <targetRole> <sourceRole>`")], V2_RED)] });

        const targetRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        const sourceRole = message.mentions.roles.filter(r => r.id !== targetRole?.id).first() || message.guild.roles.cache.get(args[1]);

        if (!targetRole || !sourceRole)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Role Not Found.** Ensure both roles are valid mentions or IDs.")], V2_RED)] });

        if (targetRole.position >= message.guild.members.me.roles.highest.position)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Hierarchy Error:** I cannot modify a role above my own.")], V2_RED)] });

        try {
            await targetRole.setPermissions(sourceRole.permissions.bitfield, `Permissions copied from ${sourceRole.name} by ${message.author.tag}`);
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🧬 PERMISSION SYNCHRONIZATION COMPLETE", 2),
                    V2.text(`**Permission matrix successfully replicated.**\n\n> 🎯 **Target Role:** ${targetRole} (\`${targetRole.id}\`)\n> 🧬 **Source Role:** ${sourceRole} (\`${sourceRole.id}\`)\n> ⚖️ **Bits Transferred:** \`${sourceRole.permissions.bitfield.toString()}\``),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Role Inheritance Manager*")
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to sync permissions. Check my role position.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "rolecopy", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] rolecopy.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "rolecopy", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("rolecopy", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`rolecopy\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_246
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_754
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_141
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_602
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_611
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_189
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_970
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_518
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_845
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_273
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_677
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_87
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_333
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_826
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_827
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_76
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_861
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_788
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_769
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_863
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_368
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_124
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_569
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_353
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_147
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_184
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_303
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_933
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_630
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_298
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_861
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_785
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_135
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_639
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_234
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_687
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_109
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_962
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_952
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_692
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_453
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_709
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_267
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_204
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_955
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_170
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_724
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_980
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_96
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_725
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_25
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_761
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_7
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_31
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_731
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_568
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_566
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_412
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_962
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_498
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_520
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_626
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_20
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_107
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_322
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_475
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_986
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_156
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_945
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_982
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_856
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_522
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_467
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_277
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_834
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_871
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_362
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_457
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_488
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_658
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_905
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_468
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_590
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_361
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_500
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_533
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_140
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_511
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_663
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_504
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_148
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_916
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_904
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_488
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_762
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_256
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_218
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_417
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_483
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ROLECOPY_ID_452
 */

};