const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR, BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "autorole",
    description: "Automated role assignment for new members (Admin Only)",
    usage: "!autorole <set @role | off | status>",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: AUTOROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("autorole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "autorole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---\nconst _fs = require('fs');\nconst _path = require('path');\nconst OWNERS_DB = _path.join(__dirname, '../data/owners.json');\nlet _isExtraOwner = false;\nconst _isBotOwner = message.author.id === BOT_OWNER_ID;\nconst _isServerOwner = message.guild.ownerId === message.author.id;\nif (_fs.existsSync(OWNERS_DB)) {\n    try {\n        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\n        const raw = rawDb[message.guild.id] || [];\n        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\n        _isExtraOwner = extraIds.includes(message.author.id);\n    } catch (e) { }\n}\nif (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\n    return message.reply({\n        content: null,\n        flags: V2 ? V2.flag : undefined,\n        components: V2 ? [V2.container([\n            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\n            V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\nRole modifications are heavily monitored.')\n        ], V2_RED)] : undefined\n    }).catch(()=>{});\n}\n// ----------------------------------\n/* --- KERNEL_START --- */
            const DB_PATH = path.join(__dirname, "../data/autorole.json");

        // Ensure data directory exists
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try {
                data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
            } catch (e) {
                console.error("Error reading autorole DB:", e);
            }
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "set") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Missing Role.** Usage: `!autorole set @role`")] });
            }

            if (role.position >= message.guild.members.me.roles.highest.position) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **Hierarchy Error:** I cannot assign a role higher than my own.")] });
            }

            data[message.guild.id] = role.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const container = V2.container([
                V2.section([
                    V2.text(`**Autorole Activated**`),
                    V2.text(`Automatic onboarding sequence synchronized.`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`\u200b`),
                V2.text(`New members will be granted the **${role.name}** role upon entry.`),
                V2.text(`\u200b`),
                V2.text(`Architect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#00EEFF");

            return message.channel.send({ content: null, components: [container], flags: V2.flag });
        }

        if (sub === "off" || sub === "disable") {
            if (!data[message.guild.id]) {
                return message.reply("⚠️ Autorole is already disabled for this sector.");
            }

            delete data[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const container = V2.container([
                V2.text(`\u200b`),
                V2.text(`**Autorole Deactivated**`),
                V2.text(`Automation has been terminated for this sector.`),
                V2.text(`\u200b`)
            ], "#FF4500");

            return message.reply({ content: null, components: [container], flags: V2.flag });
        }

        if (sub === "status" || !sub) {
            const roleId = data[message.guild.id];
            const role = roleId ? message.guild.roles.cache.get(roleId) : null;

            const container = V2.container([
                V2.section([
                    V2.text(`**Autorole Status**`),
                    V2.text(`System Telemetry Logged`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`\u200b`),
                V2.text(`**Status:** ${role ? "Active" : "Inactive"}`),
                V2.text(`**Target:** ${role ? `${role.name} (${role.id})` : "None Set"}`),
                V2.text(`\u200b`),
                V2.text(`**Protocol Usage:**`),
                V2.text(`!autorole set @role`),
                V2.text(`!autorole off`),
                V2.text(`\u200b`),
                V2.text(`Architect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#00EEFF");

            return message.channel.send({ content: null, components: [container], flags: V2.flag });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "autorole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] autorole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "autorole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("autorole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`autorole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_556
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_933
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_951
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_416
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_297
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_999
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_38
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_121
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_203
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_301
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_91
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_822
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_98
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_949
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_618
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_447
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_276
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_38
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_84
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_943
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_868
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_756
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_951
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_913
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_151
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_728
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_467
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_78
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_292
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_113
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_899
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_653
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_301
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_585
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_506
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_932
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_393
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_16
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_216
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_746
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_746
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_616
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_406
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_179
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_752
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_588
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_202
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_691
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_901
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_23
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_527
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_933
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_245
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_260
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_645
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_708
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_49
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_280
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_907
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_901
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_88
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_309
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_272
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_3
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_377
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_543
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_639
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_947
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_230
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_23
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_19
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_793
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_939
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_699
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_359
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_865
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_804
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_136
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_487
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_806
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_169
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_925
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_258
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_670
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_510
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_22
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_926
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_435
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_797
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_292
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_412
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_923
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_158
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_709
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_99
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_928
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_871
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_135
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_785
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | AUTOROLE_ID_121
 */

};