const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/quarantine.json");

function saveRoles(guildId, userId, roles) {
    let data = {};
    if (fs.existsSync(DB_PATH)) {
        try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
    }
    if (!data[guildId]) data[guildId] = {};
    data[guildId][userId] = roles;
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function quarantineMember(guild, target, reason, enforcer) {
    // 1. Setup Quarantine Role & Channel (One-time setup)
    let qrRole = guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
    let qrChannel = guild.channels.cache.find(c => c.name === "quarantine-zone");

    if (!qrRole) {
        try {
            qrRole = await guild.roles.create({
                name: "Quarantined",
                color: "#FF0000", // Red
                permissions: [],
                reason: "Quarantine System Setup"
            });
        } catch (e) {
            console.error("Failed to create role:", e);
            return { success: false, error: "Failed to create Quarantined role." };
        }
    }

    if (!qrChannel) {
        try {
            qrChannel = await guild.channels.create({
                name: "quarantine-zone",
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: qrRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });
        } catch (e) {
            console.error("Failed to create channel:", e);
        }
    }

    // 1.5 LOCKDOWN: Update ALL channels to deny interaction for this role
    // This ensures they can SEE (inherit ViewChannel) but NOT interactions
    guild.channels.cache.forEach(async (channel) => {
        if (channel.name === "quarantine-zone") return; // Skip the zone itself

        // Define denied permissions
        const DENY_PERMS = [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.SendMessagesInThreads,
            PermissionsBitField.Flags.CreatePublicThreads,
            PermissionsBitField.Flags.CreatePrivateThreads,
            PermissionsBitField.Flags.AddReactions,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.Stream,
            PermissionsBitField.Flags.UseApplicationCommands,
            PermissionsBitField.Flags.RequestToSpeak
        ];

        // Check if we need to update
        const current = channel.permissionOverwrites.cache.get(qrRole.id);

        // If overwrite is missing or allows something, update it
        // We do a simple check: if no overwrite exists, add it.
        if (!current) {
            try {
                await channel.permissionOverwrites.create(qrRole, {
                    SendMessages: false,
                    SendMessagesInThreads: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    AddReactions: false,
                    Connect: false,
                    Speak: false,
                    Stream: false,
                    UseApplicationCommands: false,
                    RequestToSpeak: false
                }, { reason: "Quarantine Lockdown" });
            } catch (e) { }
        }
    });

    // 2. Apply Quarantine
    try {
        const currentRoleIds = target.roles.cache.map(r => r.id);
        saveRoles(guild.id, target.id, currentRoleIds);

        // Apply Quarantine: Set roles to ONLY Quarantined
        await target.roles.set([qrRole.id], `Quarantined by ${enforcer.tag}: ${reason}`);

        // Notify in quarantine channel
        if (qrChannel) {
            qrChannel.send({
                content: `${target}, you have been quarantined.\n**Reason:** ${reason}`, embeds: [
                    new EmbedBuilder().setDescription("Wait for staff to review your case.").setColor("#FF0000")
                ]
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
    usage: "!qr @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    quarantineMember, // Export for usage in other files

    async execute(message, args) {
        // 1. Permission Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Authorized Personnel Only.")] });
        }

        // 0. Manual Setup Mode
        if (args[0]?.toLowerCase() === "setup") {
            const qrCmd = require("./qr.js");
            // We pass a dummy member/reason just to trigger creation? 
            // Better to extract creation logic or just check/create here.

            // Re-use logic:
            let qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
            let qrChannel = message.guild.channels.cache.find(c => c.name === "quarantine-zone");
            let created = [];

            if (!qrRole) {
                try {
                    qrRole = await message.guild.roles.create({
                        name: "Quarantined",
                        color: "#FF0000",
                        permissions: [],
                        reason: "Quarantine Setup"
                    });
                    created.push("Role: Quarantined");
                } catch (e) { return message.reply("❌ Failed to create Role."); }
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
                    created.push("Channel: #quarantine-zone");
                } catch (e) { return message.reply("❌ Failed to create Channel."); }
            }

            if (created.length > 0) {
                // Trigger lockdown loop 
                const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
                if (qrRole) {
                    message.guild.channels.cache.forEach(async (channel) => {
                        if (channel.name === "quarantine-zone") return;
                        try {
                            await channel.permissionOverwrites.create(qrRole, {
                                SendMessages: false,
                                AddReactions: false,
                                Connect: false,
                                Speak: false
                            }, { reason: "Quarantine Setup" });
                        } catch (e) { }
                    });
                }
                return message.reply(`✅ **Setup Complete:** Created ${created.join(", ")} and applied lockdowns.`);
            } else {
                return message.reply("✅ **Already Setup:** Role and Channel already exist.");
            }
        }

        // 0.5 Manual Delete Mode
        if (args[0]?.toLowerCase() === "delete") {
            try {
                const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
                const qrChannel = message.guild.channels.cache.find(c => c.name === "quarantine-zone");

                let deleted = [];
                if (qrChannel) { await qrChannel.delete(); deleted.push("Channel"); }
                if (qrRole) { await qrRole.delete(); deleted.push("Role"); }

                // Remove from DB
                const data = {};
                // We don't read/write DB here yet for global reset, but if we did:
                // delete data[message.guild.id];

                return message.reply(`🗑️ **Quarantine System Deleted.** (${deleted.join(", ")})`);

            } catch (e) {
                return message.reply(`❌ **Error:** ${e.message}`);
            }
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ **User not found.** Usage: `!qr @user [reason]` or `!qr setup`");

        // Immunity Checks
        if (target.id === BOT_OWNER_ID) return message.reply("❌ The **Bot Owner** cannot be quarantined.");
        if (target.id === message.guild.ownerId) return message.reply("❌ The **Server Owner** cannot be quarantined.");

        // Hierarchy Check
        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("❌ Cannot quarantine user with equal/higher role.");
        }

        const reason = args.slice(1).join(" ") || "No reason provided";

        const result = await quarantineMember(message.guild, target, reason, message.author);

        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("☣️ SUBJECT QUARANTINED")
                .setDescription(`**${target.user.tag}** has been moved to isolation.\nAll previous roles have been stripped and saved.`)
                .addFields(
                    { name: "📝 Reason", value: reason },
                    { name: "👮 Enforcer", value: message.author.tag }
                )
                .setThumbnail(target.user.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        } else {
            message.reply(`❌ Failed to quarantine: ${result.error}`);
        }
    }
};
