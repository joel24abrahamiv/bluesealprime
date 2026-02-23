const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField, ChannelType,
    SeparatorSpacingSize
} = require("discord.js");
const { BOT_OWNER_ID, V2_RED, V2_BLUE } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/quarantine.json");

function saveRoles(guildId, userId, roles) {
    let data = {};
    if (fs.existsSync(DB_PATH)) { try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { } }
    if (!data[guildId]) data[guildId] = {};
    data[guildId][userId] = roles;
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── SEPARATOR HELPER (explicit SeparatorBuilder) ───
function sep(large = false) {
    return V2.separator()
        .setSpacing(large ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small)
        .setDivider(true);
}

async function quarantineMember(guild, target, reason, enforcer) {
    // ── SETUP: Quarantined Role ──
    let qrRole = guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
    if (!qrRole) {
        try {
            qrRole = await guild.roles.create({ name: "Quarantined", color: "#FF0000", permissions: [], reason: "Quarantine System Setup" });
        } catch (e) {
            return { success: false, error: "Failed to create Quarantined role." };
        }
    }

    // ── SETUP: Quarantine Channel ──
    let qrChannel = guild.channels.cache.find(c => c.name === "quarantine-zone");
    if (!qrChannel) {
        try {
            qrChannel = await guild.channels.create({
                name: "quarantine-zone",
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: qrRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                ]
            });
        } catch (e) { console.error("Failed to create QR channel:", e); }
    }

    // ── CHANNEL LOCKDOWN: Deny quarantine role everywhere ──
    guild.channels.cache.forEach(async (channel) => {
        if (channel.name === "quarantine-zone") return;
        if (!channel.permissionOverwrites.cache.get(qrRole.id)) {
            try {
                await channel.permissionOverwrites.create(qrRole, {
                    SendMessages: false, SendMessagesInThreads: false, CreatePublicThreads: false,
                    CreatePrivateThreads: false, AddReactions: false, Connect: false,
                    Speak: false, Stream: false, UseApplicationCommands: false, RequestToSpeak: false
                }, { reason: "Quarantine Lockdown" });
            } catch (e) { }
        }
    });

    // ── APPLY QUARANTINE ──
    try {
        const currentRoleIds = target.roles.cache.map(r => r.id);
        saveRoles(guild.id, target.id, currentRoleIds);
        await target.roles.set([qrRole.id], `Quarantined by ${enforcer.tag}: ${reason}`);

        // Notify in quarantine zone
        if (qrChannel) {
            qrChannel.send({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.section([
                        V2.heading("☣️ SUBJECT QUARANTINED", 2),
                        V2.text(`${target}, you have been placed in isolation.\n\n> **Reason:** ${reason}\n> **Enforced by:** ${enforcer.tag}`)
                    ], target.displayAvatarURL({ dynamic: true, size: 256 })),
                    sep(),
                    V2.text("Await staff review. Unauthorized actions will result in further penalties."),
                    sep(true)
                ], "#FF0000")]
            });
        }
        return { success: true, channel: qrChannel };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
}

module.exports = {
    name: "qr",
    description: "Quarantine a user (Admin/Owner Only)",
    aliases: ["quarantine"],
    usage: "!qr @user [reason] | !qr setup | !qr delete",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    quarantineMember,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: QR
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("qr") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "qr", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.text("🚫 **ACCESS DENIED** | Authorized Personnel Only."),
                    sep(true)
                ], V2_RED)]
            });
        }

        const sub = args[0]?.toLowerCase();

        // ──────────────────────────────────────────
        // !qr setup
        // ──────────────────────────────────────────
        if (sub === "setup") {
            let qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
            let qrChannel = message.guild.channels.cache.find(c => c.name === "quarantine-zone");
            const created = [];

            if (!qrRole) {
                try {
                    qrRole = await message.guild.roles.create({ name: "Quarantined", color: "#FF0000", permissions: [], reason: "Quarantine Setup" });
                    created.push("`@Quarantined` role");
                } catch (e) {
                    return message.reply({ flags: V2.flag, components: [V2.container([sep(), V2.text("❌ Failed to create Quarantined role."), sep()], V2_RED)] });
                }
            }

            if (!qrChannel) {
                try {
                    qrChannel = await message.guild.channels.create({
                        name: "quarantine-zone",
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: message.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: qrRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                        ]
                    });
                    created.push("`#quarantine-zone` channel");
                } catch (e) {
                    return message.reply({ flags: V2.flag, components: [V2.container([sep(), V2.text("❌ Failed to create quarantine-zone channel."), sep()], V2_RED)] });
                }
            }

            // Apply lockdown to all channels
            if (qrRole) {
                message.guild.channels.cache.forEach(async (ch) => {
                    if (ch.name === "quarantine-zone") return;
                    try {
                        await ch.permissionOverwrites.create(qrRole, {
                            SendMessages: false, AddReactions: false, Connect: false, Speak: false
                        }, { reason: "Quarantine Setup Lockdown" });
                    } catch (e) { }
                });
            }

            const statusText = created.length > 0
                ? `**Created:**\n${created.map(c => `> ✅ ${c}`).join("\n")}\n\nChannel lockdowns applied to all existing channels.`
                : `> ✅ **Role** and **Channel** already exist.\n> Lockdowns re-applied.`;

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.heading("☣️ QUARANTINE SYSTEM — INITIALIZED", 2),
                    sep(),
                    V2.text(statusText),
                    sep(true),
                    V2.text("*BlueSealPrime • Quarantine Protocol*")
                ], V2_BLUE)]
            });
        }

        // ──────────────────────────────────────────
        // !qr delete
        // ──────────────────────────────────────────
        if (sub === "delete") {
            try {
                const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
                const qrChannel = message.guild.channels.cache.find(c => c.name === "quarantine-zone");
                const deleted = [];

                if (qrChannel) { await qrChannel.delete(); deleted.push("`#quarantine-zone`"); }
                if (qrRole) { await qrRole.delete(); deleted.push("`@Quarantined`"); }

                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        sep(true),
                        V2.heading("🗑️ QUARANTINE SYSTEM — DISMANTLED", 2),
                        sep(),
                        V2.text(deleted.length > 0
                            ? `**Deleted:**\n${deleted.map(d => `> 🗑️ ${d}`).join("\n")}`
                            : "> ⚠️ No quarantine role or channel found."),
                        sep(true)
                    ], V2_BLUE)]
                });
            } catch (e) {
                return message.reply({ flags: V2.flag, components: [V2.container([sep(), V2.text(`❌ **Error:** ${e.message}`), sep()], V2_RED)] });
            }
        }

        // ──────────────────────────────────────────
        // !qr @user [reason]
        // ──────────────────────────────────────────
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.heading("☣️ QUARANTINE SYSTEM", 2),
                    sep(),
                    V2.text(
                        "**Usage:**\n" +
                        "> `!qr @user [reason]` — Isolate a member\n" +
                        "> `!qr setup` — Initialize the quarantine system\n" +
                        "> `!qr delete` — Dismantle the quarantine system\n" +
                        "> `!uq @user` — Release from quarantine"
                    ),
                    sep(true)
                ], V2_BLUE)]
            });
        }

        // ── IMMUNITY CHECKS ──
        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.section([
                        V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                        V2.text(
                            `Did you seriously just try to quarantine ${target.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?\n\n` +
                            `> You have no power here, ${message.author}. Know your place and step back.`
                        )
                    ], target.user.displayAvatarURL({ dynamic: true, size: 512 })),
                    sep(true),
                    V2.text("*BlueSealPrime • Sovereign Protection*")
                ], "#FF0000")]
            });
        }

        // ── HIERARCHY CHECK ──
        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(),
                    V2.text("❌ Cannot quarantine a user with an equal or higher role than yours."),
                    sep()
                ], V2_RED)]
            });
        }

        const reason = args.slice(1).join(" ") || "No reason provided";
        const result = await quarantineMember(message.guild, target, reason, message.author);

        if (result.success) {
            return message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    sep(true),
                    V2.section([
                        V2.heading("☣️ SUBJECT QUARANTINED", 1),
                        V2.text(`**${target.user.tag}** has been moved to isolation.\nAll previous roles have been stripped and saved.`)
                    ], target.user.displayAvatarURL({ dynamic: true, size: 512 })),
                    sep(true),
                    V2.heading("[ QUARANTINE RECORD ]", 3),
                    V2.text(`> 📝 **Reason:** ${reason}\n> 👮 **Enforcer:** ${message.author.tag}\n> 📍 **Zone:** ${result.channel || "quarantine-zone"}`),
                    sep(true),
                    V2.text("*BlueSealPrime • Quarantine Protocol Active*")
                ], "#1A0000")]
            });
        } else {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    sep(),
                    V2.text(`❌ **Failed to quarantine:** ${result.error}`),
                    sep()
                ], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "qr", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] qr.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "qr", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("qr", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`qr\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | QR_ID_901
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | QR_ID_43
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | QR_ID_572
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | QR_ID_368
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | QR_ID_110
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | QR_ID_550
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | QR_ID_232
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | QR_ID_528
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | QR_ID_493
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | QR_ID_579
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | QR_ID_5
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | QR_ID_219
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | QR_ID_376
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | QR_ID_718
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | QR_ID_83
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | QR_ID_87
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | QR_ID_389
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | QR_ID_6
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | QR_ID_876
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | QR_ID_131
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | QR_ID_519
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | QR_ID_666
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | QR_ID_772
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | QR_ID_439
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | QR_ID_177
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | QR_ID_173
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | QR_ID_718
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | QR_ID_429
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | QR_ID_338
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | QR_ID_550
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | QR_ID_781
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | QR_ID_509
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | QR_ID_884
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | QR_ID_494
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | QR_ID_306
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | QR_ID_752
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | QR_ID_548
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | QR_ID_205
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | QR_ID_940
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | QR_ID_473
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | QR_ID_563
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | QR_ID_838
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | QR_ID_488
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | QR_ID_689
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | QR_ID_935
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | QR_ID_954
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | QR_ID_708
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | QR_ID_984
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | QR_ID_822
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | QR_ID_94
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | QR_ID_925
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | QR_ID_206
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | QR_ID_695
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | QR_ID_537
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | QR_ID_134
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | QR_ID_748
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | QR_ID_482
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | QR_ID_318
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | QR_ID_574
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | QR_ID_873
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | QR_ID_9
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | QR_ID_432
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | QR_ID_622
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | QR_ID_108
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | QR_ID_382
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | QR_ID_772
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | QR_ID_757
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | QR_ID_565
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | QR_ID_914
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | QR_ID_621
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | QR_ID_96
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | QR_ID_366
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | QR_ID_963
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | QR_ID_954
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | QR_ID_628
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | QR_ID_828
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | QR_ID_596
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | QR_ID_87
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | QR_ID_614
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | QR_ID_737
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | QR_ID_265
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | QR_ID_735
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | QR_ID_103
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | QR_ID_939
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | QR_ID_683
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | QR_ID_115
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | QR_ID_432
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | QR_ID_710
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | QR_ID_834
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | QR_ID_302
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | QR_ID_474
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | QR_ID_618
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | QR_ID_210
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | QR_ID_710
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | QR_ID_410
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | QR_ID_413
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | QR_ID_549
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | QR_ID_809
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | QR_ID_222
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | QR_ID_858
 */

};