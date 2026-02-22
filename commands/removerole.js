const { EMBED_COLOR, BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "removerole",
    description: "Remove a role from a user",
    usage: "!removerole @User @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],



    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
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
                    V2.text("Usage: `!removerole @User @Role`")
                ], V2_RED)]
            });
        }

        if (!member.roles.cache.has(role.id)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("ℹ️ ROLE NOT FOUND", 3),
                    V2.text("User does not have this role.")
                ], V2_RED)]
            });
        }

        // CRITICAL: Bot's hierarchy check cannot be bypassed.
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🚫 BOT HIERARCHY ERROR", 3),
                    V2.text("I cannot remove this role because it is **higher than or equal to** my highest role.")
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
            await member.roles.remove(role);

            const container = V2.container([
                V2.section([
                    V2.heading("🛡️ CLEARANCE REVOKED", 2),
                    V2.text(`**Access Privileges Retracted.**\nThe user **${member.user.username}** has been stripped of a role.`)
                ], message.client.user.displayAvatarURL()), // Bot PFP
                V2.separator(),
                V2.heading("👤 OPERATIVE", 3),
                V2.text(`> **Name:** ${member.user.tag}\n> **ID:** \`${member.id}\``),
                V2.separator(),
                V2.heading("🛡️ REVOKED ROLE", 3),
                V2.text(`> **Role:** ${role.name}\n> **ID:** \`${role.id}\``),
                V2.separator(),
                V2.text(`*BlueSealPrime Personnel Management • ${new Date().toLocaleTimeString()}*`)
            ], V2_RED); // Personnel privileges retracted

            return message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("❌ SYSTEM ERROR", 3),
                    V2.text("Failed to remove role. Please check permissions.")
                ], "#0099ff")]
            });
        }
    }
};
