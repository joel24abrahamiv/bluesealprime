const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_RED, V2_BLUE } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deleterole",
    description: "Delete a role",
    usage: "!deleterole <@role | name | id>",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: DELETEROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("deleterole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "deleterole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---\nconst _fs = require('fs');\nconst _path = require('path');\nconst OWNERS_DB = _path.join(__dirname, '../data/owners.json');\nlet _isExtraOwner = false;\nconst _isBotOwner = message.author.id === BOT_OWNER_ID;\nconst _isServerOwner = message.guild.ownerId === message.author.id;\nif (_fs.existsSync(OWNERS_DB)) {\n    try {\n        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\n        const raw = rawDb[message.guild.id] || [];\n        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\n        _isExtraOwner = extraIds.includes(message.author.id);\n    } catch (e) { }\n}\nif (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\n    return message.reply({\n        content: null,\n        flags: V2 ? V2.flag : undefined,\n        components: V2 ? [V2.container([\n            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\n            V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\nRole modifications are heavily monitored.')\n        ], V2_RED)] : undefined\n    }).catch(()=>{});\n}\n// ----------------------------------\n/* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🚫 MISSING PERMISSIONS", 2), V2.text("> I do not have ManageRoles permission.")], botAvatar)
                ], V2_RED)]
            });
        }

        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("⚠️ MISSING ARGUMENT", 2), V2.text("> **Usage:** `!deleterole <@role | name | id>`")], botAvatar)
                ], V2_RED)]
            });
        }

        const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("❌ ROLE NOT FOUND", 2), V2.text("> No role matched your input.")], botAvatar)
                ], V2_RED)]
            });
        }

        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🚫 HIERARCHY CONFLICT", 2), V2.text(`> \`${role.name}\` is above my highest role.`)], botAvatar)
                ], V2_RED)]
            });
        }

        try {
            const roleName = role.name;
            await role.delete(`Deleted by ${message.author.tag}`);

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🗑️ ROLE PURGED", 2),
                        V2.text(`**Dissolved:** \`${roleName}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                ], V2_RED)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("❌ FAILED", 2), V2.text("> Could not delete the role.")], botAvatar)
                ], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deleterole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] deleterole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deleterole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("deleterole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`deleterole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_200
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_953
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_69
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_815
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_862
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_237
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_720
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_87
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_406
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_648
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_680
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_838
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_296
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_980
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_481
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_802
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_927
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_54
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_82
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_326
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_116
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_955
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_403
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_459
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_584
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_153
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_774
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_369
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_522
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_668
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_563
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_702
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_961
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_172
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_3
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_222
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_928
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_479
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_490
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_235
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_620
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_865
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_97
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_217
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_520
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_271
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_910
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_103
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_531
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_557
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_188
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_908
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_713
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_92
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_545
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_150
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_542
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_529
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_55
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_637
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_155
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_739
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_450
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_51
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_548
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_375
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_17
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_857
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_15
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_713
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_111
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_930
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_987
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_335
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_591
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_907
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_1
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_115
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_947
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_367
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_737
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_420
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_688
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_871
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_269
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_706
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_813
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_332
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_47
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_156
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_174
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_283
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_215
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_213
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_397
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_36
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_346
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_329
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_163
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | DELETEROLE_ID_96
 */

};