const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_RED, V2_BLUE } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deleterole",
    description: "Delete a role",
    usage: "!deleterole <@role | name | id>",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🚫 MISSING PERMISSIONS", 2), V2.text("> I do not have ManageRoles permission.")], botAvatar)
                ], V2_RED)]
            });
        }

        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("⚠️ MISSING ARGUMENT", 2), V2.text("> **Usage:** `!deleterole <@role | name | id>`")], botAvatar)
                ], V2_RED)]
            });
        }

        const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("❌ ROLE NOT FOUND", 2), V2.text("> No role matched your input.")], botAvatar)
                ], V2_RED)]
            });
        }

        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🚫 HIERARCHY CONFLICT", 2), V2.text(`> \`${role.name}\` is above my highest role.`)], botAvatar)
                ], V2_RED)]
            });
        }

        try {
            const roleName = role.name;
            await role.delete(`Deleted by ${message.author.tag}`);

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🗑️ ROLE PURGED", 2),
                        V2.text(`**Dissolved:** \`${roleName}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                ], V2_RED)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("❌ FAILED", 2), V2.text("> Could not delete the role.")], botAvatar)
                ], V2_RED)]
            });
        }
    }
};
