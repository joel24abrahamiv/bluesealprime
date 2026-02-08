const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR, ERROR_COLOR, WARN_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "audit",
    description: "Performs a sovereign security audit of the server",
    aliases: ["scan", "securityscan"],
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const { guild } = message;
        const loadingEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription("🛡️ **ENGAGING SOVEREIGN AUDIT PROTOCOLS...**\n*Scanning server architecture for vulnerabilities.*")
            .setFooter({ text: "BlueSealPrime • Security Systems" });

        const statusMsg = await message.reply({ embeds: [loadingEmbed] });

        try {
            const report = {
                critical: [],
                warning: [],
                info: [],
                neutral: []
            };

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
                    report.critical.push(`**@everyone** has **${p.name}** permission. This is a severe vulnerability.`);
                }
            });

            // 2. EXCESSIVE ADMINISTRATORS
            const admins = guild.members.cache.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator) && !m.user.bot);
            if (admins.size > 5) {
                report.warning.push(`**Excessive Administrators:** There are \`${admins.size}\` human administrators. Restrict this to trusted staff only.`);
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
                report.warning.push(`**Hierarchy Warning:** There are \`${dangerousRoles.size}\` roles above me that have administrative powers. I cannot moderate members with these roles.`);
            }

            // 4. SERVER SETTINGS
            if (guild.verificationLevel === 0) { // NONE
                report.warning.push("**Verification Level:** Set to 'None'. Recommended to set to 'Medium' or higher to prevent raids.");
            } else {
                report.neutral.push(`**Verification Level:** \`${guild.verificationLevel}\` (Standard)`);
            }

            if (guild.mfaLevel === 1) { // 2FA Required for mod
                report.neutral.push("**2FA Requirement:** Enabled for staff.");
            } else {
                report.info.push("**2FA Requirement:** Not required for moderation. Recommended to enable in Server Settings.");
            }

            const explicitFilter = guild.explicitContentFilter;
            if (explicitFilter === 0) {
                report.warning.push("**Explicit Content Filter:** Disabled. Recommended to enable to protect members.");
            }

            // 5. CHANNEL PRIVACY SCAN (TOP 5 CHECK)
            const privateChannels = guild.channels.cache.filter(c => c.type === 0 && !c.permissionsFor(guild.roles.everyone).has(PermissionsBitField.Flags.ViewChannel));
            report.neutral.push(`**Private Infrastructure:** \`${privateChannels.size}\` secure channels detected.`);

            // BUILD FINAL EMBED
            const auditEmbed = new EmbedBuilder()
                .setColor(report.critical.length > 0 ? ERROR_COLOR : (report.warning.length > 0 ? WARN_COLOR : SUCCESS_COLOR))
                .setTitle(`🛡️ SOVEREIGN SECURITY REPORT: ${guild.name.toUpperCase()}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(
                    `## **OVERALL THREAT LEVEL:** ${report.critical.length > 0 ? "🔴 CRITICAL" : (report.warning.length > 0 ? "🟡 ELEVATED" : "🟢 SECURE")}\n` +
                    `*The Crown has concluded the analysis of server security protocols.*`
                );

            if (report.critical.length > 0) {
                auditEmbed.addFields({
                    name: "🚨 CRITICAL VULNERABILITIES",
                    value: report.critical.map(v => `> • ${v}`).join("\n")
                });
            }

            if (report.warning.length > 0) {
                auditEmbed.addFields({
                    name: "⚠️ SECURITY WARNINGS",
                    value: report.warning.map(v => `> • ${v}`).join("\n")
                });
            }

            const statusValue = [
                ...report.neutral.map(v => `> • ${v}`),
                ...report.info.map(v => `> • ${v}`)
            ].join("\n");

            if (statusValue) {
                auditEmbed.addFields({
                    name: "ℹ️ SYSTEM STATUS",
                    value: statusValue
                });
            }

            // 6. RECENT ACTIVITY (LAST 24 HOURS)
            const { AuditLogEvent } = require("discord.js");
            const logs = await guild.fetchAuditLogs({ limit: 100 }).catch(() => null);
            if (logs) {
                const yesterday = Date.now() - (24 * 60 * 60 * 1000);
                const recentLogs = logs.entries.filter(entry => entry.createdTimestamp > yesterday);

                if (recentLogs.size > 0) {
                    const activity = {};
                    recentLogs.forEach(entry => {
                        const type = entry.action;
                        activity[type] = (activity[type] || 0) + 1;
                    });

                    const activityLines = Object.entries(activity).map(([type, count]) => {
                        let name = "Unknown Action";
                        // Mapping some common ones
                        if (type == AuditLogEvent.MemberKick) name = "Members Kicked";
                        if (type == AuditLogEvent.MemberBanAdd) name = "Members Banned";
                        if (type == AuditLogEvent.MemberBanRemove) name = "Members Unbanned";
                        if (type == AuditLogEvent.RoleCreate) name = "Roles Created";
                        if (type == AuditLogEvent.RoleDelete) name = "Roles Deleted";
                        if (type == AuditLogEvent.RoleUpdate) name = "Roles Updated";
                        if (type == AuditLogEvent.ChannelCreate) name = "Channels Created";
                        if (type == AuditLogEvent.ChannelDelete) name = "Channels Deleted";
                        if (type == AuditLogEvent.ChannelUpdate) name = "Channels Updated";
                        if (type == AuditLogEvent.InviteCreate) name = "Invites Created";
                        if (type == AuditLogEvent.MessageDelete) name = "Messages Deleted";
                        if (type == AuditLogEvent.EmojiCreate) name = "Emojis Created";
                        if (type == AuditLogEvent.EmojiDelete) name = "Emojis Deleted";
                        if (type == AuditLogEvent.MemberUpdate) name = "Member Profiles Updated";

                        return `> • **${name}:** \`${count}\``;
                    });

                    auditEmbed.addFields({
                        name: "📜 RECENT ACTIVITY (LAST 24H)",
                        value: activityLines.slice(0, 10).join("\n") || "> • *No significant activities detected.*"
                    });
                } else {
                    auditEmbed.addFields({
                        name: "📜 RECENT ACTIVITY (LAST 24H)",
                        value: "> • *No activities detected in the last 24 hours.*"
                    });
                }
            }


            auditEmbed.setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Royal Protocol • Analysis Complete" })
                .setTimestamp();

            await statusMsg.edit({ embeds: [auditEmbed] });

        } catch (error) {
            console.error("Audit Error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(ERROR_COLOR)
                .setTitle("❌ PROTOCOL FAILURE")
                .setDescription("An internal error occurred during the security scan. Ensure the bot has full Administrator permissions to audit the infrastructure.");
            await statusMsg.edit({ embeds: [errorEmbed] });
        }
    }
};
