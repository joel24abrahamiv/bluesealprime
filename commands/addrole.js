const { EMBED_COLOR, BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "addrole",
    description: "Add a role to a user",
    usage: "!addrole @User @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],



    async execute(message, args) {
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
    }
};
