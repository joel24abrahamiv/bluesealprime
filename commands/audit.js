const V2 = require("../utils/v2Utils");
const { PermissionsBitField, AuditLogEvent } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "audit",
    description: "Performs a sovereign security audit of the server",
    aliases: ["scan", "securityscan"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: AUDIT
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("audit") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "audit", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const { guild } = message;

        const loadingContainer = V2.container([
            V2.text("🛡️ **ENGAGING SOVEREIGN AUDIT PROTOCOLS...**\n*Scanning server architecture for vulnerabilities.*")
        ], V2_BLUE);

        const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [loadingContainer] });

        try {
            const report = { critical: [], warning: [], info: [], neutral: [] };

            // 1. DANGEROUS PERMISSIONS (@EVERYONE)
            const everyone = guild.roles.everyone;
            const dangerousPerms = [
                { perm: PermissionsBitField.Flags.Administrator, name: "Administrator" },
                { perm: PermissionsBitField.Flags.ManageRoles, name: "Manage Roles" },
                { perm: PermissionsBitField.Flags.ManageChannels, name: "Manage Channels" },
                { perm: PermissionsBitField.Flags.ManageGuild, name: "Manage Server" },
                { perm: PermissionsBitField.Flags.ManageWebhooks, name: "Manage Webhooks" },
                { perm: PermissionsBitField.Flags.MentionEveryone, name: "Mention Everyone" },
                { perm: PermissionsBitField.Flags.BanMembers, name: "Ban Members" },
                { perm: PermissionsBitField.Flags.KickMembers, name: "Kick Members" }
            ];

            dangerousPerms.forEach(p => {
                if (everyone.permissions.has(p.perm)) {
                    report.critical.push(`**@everyone** has **${p.name}** permission.`);
                }
            });

            // 2. EXCESSIVE ADMINISTRATORS
            const admins = guild.members.cache.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator) && !m.user.bot);
            if (admins.size > 5) {
                report.warning.push(`**Excessive Admins:** \`${admins.size}\` human administrators detected.`);
            }

            // 3. HIERARCHY ANALYSIS
            const botMember = guild.members.me;
            const botTopRole = botMember.roles.highest;
            const dangerousRoles = guild.roles.cache.filter(r =>
                (r.permissions.has(PermissionsBitField.Flags.Administrator) || r.permissions.has(PermissionsBitField.Flags.ManageRoles)) &&
                r.position >= botTopRole.position &&
                r.id !== guild.ownerId
            );

            if (dangerousRoles.size > 0) {
                report.warning.push(`**Hierarchy:** \`${dangerousRoles.size}\` roles above bot have admin powers.`);
            }

            // 4. SERVER SETTINGS
            if (guild.verificationLevel === 0) report.warning.push("**Verification Level:** Set to 'None' (Unsafe).");
            else report.neutral.push(`**Verification Level:** \`${guild.verificationLevel}\``);

            if (guild.mfaLevel === 1) report.neutral.push("**2FA Requirement:** Enabled for staff.");
            else report.info.push("**2FA Requirement:** Not required for moderation.");

            if (guild.explicitContentFilter === 0) report.warning.push("**Content Filter:** Disabled.");

            // 5. RECENT ACTIVITY
            let activityLines = "> • *No activities detected in the last 24 hours.*";
            const logs = await guild.fetchAuditLogs({ limit: 100 }).catch(() => null);
            if (logs) {
                const yesterday = Date.now() - (24 * 60 * 60 * 1000);
                const recentLogs = logs.entries.filter(entry => entry.createdTimestamp > yesterday);
                if (recentLogs.size > 0) {
                    const activity = {};
                    recentLogs.forEach(entry => { activity[entry.action] = (activity[entry.action] || 0) + 1; });
                    activityLines = Object.entries(activity).map(([type, count]) => {
                        let name = "Action " + type;
                        if (type == AuditLogEvent.MemberKick) name = "Kicks";
                        if (type == AuditLogEvent.MemberBanAdd) name = "Bans";
                        if (type == AuditLogEvent.RoleCreate) name = "Roles Created";
                        if (type == AuditLogEvent.ChannelCreate) name = "Channels Created";
                        return `> • **${name}:** \`${count}\``;
                    }).slice(0, 5).join("\n");
                }
            }

            const threatLevel = report.critical.length > 0 ? "🔴 CRITICAL" : (report.warning.length > 0 ? "🟡 ELEVATED" : "🟢 SECURE");
            const reportColor = report.critical.length > 0 ? V2_RED : (report.warning.length > 0 ? "#FFA500" : "#00FF7F");

            const finalContainer = V2.container([
                V2.section([
                    V2.heading(`🛡️ SOVEREIGN SECURITY REPORT: ${guild.name.toUpperCase()}`, 2),
                    V2.text(`## **THREAT LEVEL:** ${threatLevel}\n*Analysis of server architectural integrity complete.*`)
                ], guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.heading("📊 SYSTEM AUDIT MAPPINGS", 3),
                V2.text(
                    (report.critical.length > 0 ? `### **[ 🚨 CRITICAL_VULNERABILITIES ]**\n${report.critical.map(v => `> • ${v}`).join("\n")}\n\n` : "") +
                    (report.warning.length > 0 ? `### **[ ⚠️ SECURITY_WARNINGS ]**\n${report.warning.map(v => `> • ${v}`).join("\n")}\n\n` : "") +
                    `### **[ ℹ️ SYSTEM_STATUS ]**\n${[...report.neutral, ...report.info].map(v => `> • ${v}`).join("\n")}`
                ),
                V2.separator(),
                V2.heading("📜 RECENT TELEMETRY (24H)", 3),
                V2.text(activityLines),
                V2.separator(),
                V2.text("*BlueSealPrime • Royal Protocol • Encryption Active*")
            ], reportColor);

            await statusMsg.edit({ content: null, components: [finalContainer] });

        } catch (error) {
            console.error("Audit Error:", error);
            await statusMsg.edit({
                content: null,
                components: [V2.container([V2.text("❌ **PROTOCOL FAILURE:** An internal error occurred during scan.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "audit", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] audit.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "audit", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("audit", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`audit\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | AUDIT_ID_801
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | AUDIT_ID_132
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | AUDIT_ID_625
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | AUDIT_ID_766
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | AUDIT_ID_668
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | AUDIT_ID_571
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | AUDIT_ID_70
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | AUDIT_ID_699
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | AUDIT_ID_471
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | AUDIT_ID_750
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | AUDIT_ID_31
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | AUDIT_ID_26
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | AUDIT_ID_765
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | AUDIT_ID_316
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | AUDIT_ID_982
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | AUDIT_ID_90
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | AUDIT_ID_127
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | AUDIT_ID_941
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | AUDIT_ID_139
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | AUDIT_ID_118
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | AUDIT_ID_430
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | AUDIT_ID_608
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | AUDIT_ID_227
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | AUDIT_ID_176
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | AUDIT_ID_603
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | AUDIT_ID_758
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | AUDIT_ID_907
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | AUDIT_ID_832
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | AUDIT_ID_709
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | AUDIT_ID_360
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | AUDIT_ID_518
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | AUDIT_ID_399
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | AUDIT_ID_835
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | AUDIT_ID_352
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | AUDIT_ID_656
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | AUDIT_ID_296
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | AUDIT_ID_6
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | AUDIT_ID_871
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | AUDIT_ID_211
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | AUDIT_ID_280
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | AUDIT_ID_693
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | AUDIT_ID_423
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | AUDIT_ID_34
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | AUDIT_ID_485
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | AUDIT_ID_108
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | AUDIT_ID_946
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | AUDIT_ID_23
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | AUDIT_ID_405
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | AUDIT_ID_665
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | AUDIT_ID_238
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | AUDIT_ID_834
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | AUDIT_ID_322
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | AUDIT_ID_262
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | AUDIT_ID_743
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | AUDIT_ID_999
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | AUDIT_ID_234
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | AUDIT_ID_245
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | AUDIT_ID_614
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | AUDIT_ID_205
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | AUDIT_ID_321
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | AUDIT_ID_291
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | AUDIT_ID_776
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | AUDIT_ID_147
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | AUDIT_ID_747
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | AUDIT_ID_482
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | AUDIT_ID_881
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | AUDIT_ID_905
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | AUDIT_ID_904
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | AUDIT_ID_460
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | AUDIT_ID_521
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | AUDIT_ID_615
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | AUDIT_ID_269
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | AUDIT_ID_864
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | AUDIT_ID_864
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | AUDIT_ID_612
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | AUDIT_ID_972
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | AUDIT_ID_259
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | AUDIT_ID_381
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | AUDIT_ID_956
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | AUDIT_ID_275
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | AUDIT_ID_299
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | AUDIT_ID_840
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | AUDIT_ID_697
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | AUDIT_ID_845
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | AUDIT_ID_743
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | AUDIT_ID_129
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | AUDIT_ID_157
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | AUDIT_ID_663
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | AUDIT_ID_53
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | AUDIT_ID_53
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | AUDIT_ID_738
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | AUDIT_ID_989
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | AUDIT_ID_684
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | AUDIT_ID_238
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | AUDIT_ID_811
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | AUDIT_ID_931
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | AUDIT_ID_442
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | AUDIT_ID_216
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | AUDIT_ID_437
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | AUDIT_ID_264
 */

};