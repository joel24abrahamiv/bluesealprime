const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "temproles.json");

// Define duration multipliers explicitly
const TIME_MULTIPLIERS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};

// ───── HELPERS ─────
function loadTempRoles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return [];
    }
}

function saveTempRoles(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function parseDuration(str) {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    return value * TIME_MULTIPLIERS[unit];
}

module.exports = {
    name: "temprole",
    description: "Give a user a temporary role",
    usage: "!temprole @User @Role <duration> (e.g. 1h, 30m)",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    // ───── BACKGROUND MONITORING ─────
    init(client) {
        console.log("⏱️ TempRole monitoring started...");

        // Check every minute
        setInterval(async () => {
            const activeRoles = loadTempRoles();
            const now = Date.now();
            let changed = false;
            const remainingRoles = [];

            for (const entry of activeRoles) {
                if (now >= entry.expiresAt) {
                    // Expired - Remove Role
                    try {
                        const guild = client.guilds.cache.get(entry.guildId);
                        if (!guild) continue; // Guild unavailable? skip removal but don't keep in DB? actually drop it.

                        const member = await guild.members.fetch(entry.userId).catch(() => null);
                        const role = guild.roles.cache.get(entry.roleId);

                        if (member && role) {
                            await member.roles.remove(role);
                            console.log(`[TempRole] Removed expired role ${role.name} from ${member.user.tag}`);
                        }
                        changed = true;
                    } catch (err) {
                        console.error(`[TempRole] Failed to remove role for ${entry.userId}:`, err);
                        // If we failed (e.g. missing perms), should we keep trying? 
                        // For simplicity, we drop it to avoid infinite retries if persistent error.
                        changed = true;
                    }
                } else {
                    remainingRoles.push(entry);
                }
            }

            if (changed) {
                saveTempRoles(remainingRoles);
            }
        }, 60 * 1000); // 1 minute interval
    },

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: TEMPROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("temprole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "temprole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission check (Bypass for owner)
        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.container([V2.text("🚫 I do not have permission to manage roles.")], require("../config").ERROR_COLOR)])]
            });
        }

        // ───── ARGS VALIDATION ─────
        // Usage: !temprole @User <RoleName|RoleID|@Role> <duration>

        const member = message.mentions.members.first();

        // Find Duration first (regex)
        const durationArg = args.find(a => /^\d+[smhd]$/.test(a));

        // Find Role: 
        // 1. Mention?
        // 2. ID?
        // 3. Name search?
        // We must exclude the User arg and the Duration arg to find the Role arg string.
        let role = message.mentions.roles.first();

        if (!role) {
            // Filter out the duration arg and the user mention from args to get the role string
            const otherArgs = args.filter(a => a !== durationArg && !a.startsWith("<@") && !a.match(/^\d{17,19}$/)); // Basic filter

            // Actually, a better way is:
            // The user arg is usually args[0], duration can be anywhere.
            // Let's try to find a role matching any remaining arg if we didn't find a mention.

            // If we have a duration arg, remove it from consideration
            const filteredArgs = args.filter(a => a !== durationArg);

            // Assume member is one of them.
            // But we already have 'member' object.

            // Let's try to find the role by ID or Name from the arguments that are NOT the duration.
            // We join remaining args to search by name if needed, but 'temprole' syntax is specific.
            // Usage: !temprole @User <role> <duration>

            // Attempt 1: Check if there's a Role ID in args
            const potentialId = args.find(a => /^\d{17,19}$/.test(a) && a !== member?.id);
            if (potentialId) {
                role = message.guild.roles.cache.get(potentialId);
            }

            // Attempt 2: Search by name (fuzzy)
            if (!role) {
                const query = args.filter(a => a !== durationArg && !a.includes(member?.id) && !a.startsWith("<@")).join(" ");
                if (query) {
                    role = message.guild.roles.cache.find(r => r.name.toLowerCase() === query.toLowerCase()) ||
                        message.guild.roles.cache.find(r => r.name.toLowerCase().includes(query.toLowerCase()));
                }
            }
        }

        if (!member) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Missing User.** Please mention a user.")], require("../config").WARN_COLOR)]
            });
        }

        if (!durationArg) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Missing Duration.** Example: `1h`, `30m`.")], require("../config").WARN_COLOR)]
            });
        }

        if (!role) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Missing Role.** Please mention a role or provide a valid name/ID.")], require("../config").WARN_COLOR)]
            });
        }

        // ───── HIERARCHY CHECK ─────
        // Owner bypasses everything. Everyone else gets checked.
        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 Role hierarchy prevents this action.")], require("../config").ERROR_COLOR)]
            });
        }

        const durationMs = parseDuration(durationArg);
        if (!durationMs) return message.reply("❌ Invalid duration format.");

        const expiresAt = Date.now() + durationMs;

        try {
            await member.roles.add(role);

            // Save to DB
            const db = loadTempRoles();
            db.push({
                guildId: message.guild.id,
                userId: member.id,
                roleId: role.id,
                expiresAt: expiresAt,
                addedAt: Date.now()
            });
            saveTempRoles(db);

            const container = V2.container([
                V2.section([
                    V2.text(`**Temporary Assignment**`),
                    V2.text(`Provisional access granted.`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`\u200b`),
                V2.text(`Operative **${member.user.username}** has been granted temporary clearance.`),
                V2.text(`\u200b`),
                V2.text(`**Role:** ${role.name}`),
                V2.text(`**Duration:** ${durationArg}`),
                V2.text(`**Expiration:** <t:${Math.floor(expiresAt / 1000)}:R>`),
                V2.text(`\u200b`),
                V2.text(`Architect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#0099ff"); // Blue for creation/success

            return message.channel.send({ content: null, components: [container], flags: V2.flag });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Failed to assign role.");
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "temprole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] temprole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "temprole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("temprole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`temprole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_600
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_716
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_750
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_944
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_47
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_205
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_669
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_7
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_715
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_178
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_785
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_898
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_958
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_738
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_638
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_896
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_647
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_92
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_529
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_860
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_96
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_289
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_815
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_855
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_156
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_834
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_989
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_578
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_817
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_855
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_683
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_330
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_197
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_892
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_758
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_5
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_503
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_492
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_342
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_84
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_872
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_954
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_754
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_624
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_734
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_954
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_65
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_148
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_595
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_193
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_573
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_486
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_778
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_630
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_21
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_398
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_1
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_373
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_9
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_691
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_106
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_312
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_551
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_970
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_773
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_716
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_566
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_834
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_74
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_958
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_939
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_23
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_736
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_851
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_405
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_129
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_771
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_932
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_322
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_645
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_754
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_455
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_894
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_924
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_677
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_462
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_551
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_549
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_813
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_154
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_706
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_565
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_787
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_217
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_309
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_922
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_589
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_456
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_674
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | TEMPROLE_ID_938
 */

};