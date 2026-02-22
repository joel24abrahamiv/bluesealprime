const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField, ChannelType,
    SeparatorBuilder, SeparatorSpacingSize
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
    return new SeparatorBuilder()
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

    async execute(message, args) {
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
    }
};
