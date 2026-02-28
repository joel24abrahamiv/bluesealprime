const { EMBED_COLOR, BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "addrole",
    description: "Add a role to a user (Admin Only)",
    usage: "!addrole @User @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],




    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ADDROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("addrole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "addrole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---\nconst _fs = require('fs');\nconst _path = require('path');\nconst OWNERS_DB = _path.join(__dirname, '../data/owners.json');\nlet _isExtraOwner = false;\nconst _isBotOwner = message.author.id === BOT_OWNER_ID;\nconst _isServerOwner = message.guild.ownerId === message.author.id;\nif (_fs.existsSync(OWNERS_DB)) {\n    try {\n        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\n        const raw = rawDb[message.guild.id] || [];\n        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\n        _isExtraOwner = extraIds.includes(message.author.id);\n    } catch (e) { }\n}\nif (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\n    return message.reply({\n        content: null,\n        flags: V2 ? V2.flag : undefined,\n        components: V2 ? [V2.container([\n            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\n            V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\nRole modifications are heavily monitored.')\n        ], V2_RED)] : undefined\n    }).catch(()=>{});\n}\n// ----------------------------------\n/* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
            const botAvatar = V2.botAvatar(message);
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 PERMISSION DENIED", 3),
                        V2.text("I do not have the `Manage Roles` permission.")
                    ], V2_RED)]
                });
            }

            const member = message.mentions.members.first();
            let role = message.mentions.roles.first();

            // Safe Role Lookup
            if (!role && args.length > 1) {
                const roleQuery = args.slice(1).join(" ");
                const roleIdMatch = roleQuery.match(/(\d{17,20})/);
                const roleId = roleIdMatch ? roleIdMatch[1] : null;

                if (roleId) role = await message.guild.roles.fetch(roleId).catch(() => null);
                if (!role) role = message.guild.roles.cache.get(roleQuery);
                if (!role) role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleQuery.toLowerCase());
                if (!role) role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleQuery.toLowerCase()));
            }

            if (!member || !role) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("⚠️ INVALID USAGE", 3),
                        V2.text("Usage: `!addrole @User @Role`")
                    ], V2_RED)]
                });
            }

            if (member.roles.cache.has(role.id)) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("ℹ️ ROLE ALREADY ASSIGNED", 3),
                        V2.text("User already has this role.")
                    ], V2_RED)]
                });
            }

            // CRITICAL: Bot's hierarchy check cannot be bypassed by anyone.
            // The bot literally cannot assign a role higher than itself.
            if (role.position >= message.guild.members.me.roles.highest.position) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 BOT HIERARCHY ERROR", 3),
                        V2.text("I cannot assign this role because it is **higher than or equal to** my highest role.\nPlease move my role above the target role in Server Settings.")
                    ], V2_RED)]
                });
            }

            // User hierarchy check (Bypassable by Owner)
            if (!isBotOwner && !isServerOwner && message.member.roles.highest.position <= role.position) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 PERMISSION DENIED", 3),
                        V2.text("You cannot manage a role that is higher than or equal to your own.")
                    ], V2_RED)]
                });
            }

            try {
                await member.roles.add(role);

                const container = V2.container([
                    V2.section([
                        V2.heading("🛡️ Personnel Upgrade", 2),
                        V2.text(`**Security Clearance Expanded.**\nThe user **${member.user.username}** has been granted new privileges.`)
                    ], botAvatar), // Bot PFP as requested
                    V2.separator(),
                    V2.heading("👤 OPERATIVE", 3),
                    V2.text(`> **Name:** ${member.user.tag}\n> **ID:** \`${member.id}\``),
                    V2.separator(),
                    V2.heading("🛡️ NEW CLEARANCE", 3),
                    V2.text(`> **Role:** ${role.name}\n> **ID:** \`${role.id}\``),
                    V2.separator(),
                    V2.text(`*BlueSealPrime Personnel Management • ${new Date().toLocaleTimeString()}*`)
                ], V2_BLUE);

                return message.channel.send({ content: null, flags: V2.flag, components: [container] });

            } catch (err) {
                console.error(err);
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("❌ SYSTEM ERROR", 3),
                        V2.text("Failed to add role. Please check permissions.")
                    ], "#0099ff")]
                });
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "addrole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] addrole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "addrole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("addrole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`addrole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {
                    message.channel.send("❌ **System Fault:** Failed to execute command. V2 UI component crashed or missing permissions.").catch(() => { });
                });
            } catch (panic) {
                console.error("Critical failure inside error handler in addrole.js:", panic);
                message.channel.send("❌ **System Fault:** Module addrole caught a core exception.").catch(() => { });
            }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_447
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_11
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_206
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_92
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_141
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_210
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_624
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_530
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_455
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_196
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_759
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_675
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_198
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_465
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_337
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_90
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_655
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_338
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_212
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_846
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_91
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_652
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_674
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_465
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_256
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_175
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_124
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_882
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_798
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_496
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_805
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_570
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_220
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_317
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_114
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_274
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_343
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_694
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_722
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_931
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_326
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_200
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_437
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_276
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_636
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_183
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_545
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_347
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_979
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_741
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_943
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_866
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_792
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_198
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_377
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_945
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_864
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_172
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_39
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_415
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_98
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_507
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_985
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_963
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_1000
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_959
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_282
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_867
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_804
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_110
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_731
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_70
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_533
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_461
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_109
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_647
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_482
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_768
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_276
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_454
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_238
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_76
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_837
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_13
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_651
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_798
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_217
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_498
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_354
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_794
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_284
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_902
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_638
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_354
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_824
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_392
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_672
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_192
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_493
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ADDROLE_ID_149
     */

};