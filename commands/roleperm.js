const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "roleperm",
    description: "Modify role permissions (add/remove)",
    aliases: ["rperm", "editrole"],
    usage: "!roleperm <@role/ID> <add|remove> <Permission>",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ROLEPERM
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("roleperm") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "roleperm", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (args.length < 3)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!roleperm <@role/ID> <add|remove> <Permission>`\n**Example:** `!roleperm @Mods add BanMembers`")], V2_RED)] });

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Role not found.**")], V2_RED)] });

        const action = args[1].toLowerCase();
        const permString = args[2];
        const targetPerm = PermissionsBitField.Flags[permString];

        if (!targetPerm)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ **Invalid Permission:** \`${permString}\`\nExamples: \`BanMembers\`, \`KickMembers\`, \`Administrator\`, \`ManageChannels\``)], V2_RED)] });

        if (role.position >= message.guild.members.me.roles.highest.position)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ I cannot modify this role — it's above my highest role.")], V2_RED)] });

        try {
            const currentPerms = new PermissionsBitField(role.permissions);
            let newPerms;

            if (action === "add" || action === "+") {
                if (currentPerms.has(targetPerm)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ This role **already has** that permission.")], V2_RED)] });
                newPerms = currentPerms.add(targetPerm);
            } else if (action === "remove" || action === "-") {
                if (!currentPerms.has(targetPerm)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ This role **does not have** that permission.")], V2_RED)] });
                newPerms = currentPerms.remove(targetPerm);
            } else {
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Invalid action. Use `add` or `remove`.")], V2_RED)] });
            }

            await role.setPermissions(newPerms);
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("💎 ROLE PERMISSIONS UPDATED", 2),
                    V2.text(`> **Role:** ${role}\n> **Action:** ${action === "add" ? "✅ Added" : "🔻 Removed"}\n> **Permission:** \`${permString}\`\n> **By:** ${message.author.tag}`)
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to update permissions.** Check my role hierarchy.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "roleperm", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] roleperm.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "roleperm", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("roleperm", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`roleperm\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_283
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_398
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_176
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_628
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_859
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_956
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_968
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_231
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_707
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_819
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_960
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_316
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_315
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_562
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_178
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_881
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_996
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_199
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_648
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_67
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_14
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_986
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_212
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_277
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_836
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_12
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_531
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_938
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_440
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_612
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_856
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_347
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_461
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_716
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_422
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_603
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_498
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_600
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_579
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_233
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_816
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_893
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_340
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_149
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_949
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_407
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_635
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_374
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_648
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_342
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_301
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_67
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_129
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_55
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_474
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_435
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_244
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_307
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_26
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_709
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_13
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_720
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_98
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_759
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_24
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_340
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_977
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_441
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_324
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_678
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_522
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_870
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_760
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_621
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_630
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_182
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_455
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_696
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_532
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_932
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_847
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_831
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_612
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_610
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_399
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_186
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_931
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_825
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_973
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_375
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_257
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_260
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_794
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_54
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_723
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_669
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_68
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_671
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_643
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ROLEPERM_ID_313
 */

};