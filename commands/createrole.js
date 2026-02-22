const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createrole",
    description: "Create a new role",
    usage: "!createrole <name> [color]",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **I do not have permission to manage roles.**")], V2_RED)] });
        }

        if (!args[0]) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!createrole <name> [color]`")], V2_RED)] });
        }

        let roleName = args.join(" ");
        let roleColor = "Default";

        const lastArg = args[args.length - 1];
        const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        const commonColors = ["red", "blue", "green", "yellow", "purple", "orange", "black", "white", "grey", "gray"];

        if (args.length > 1 && (colorRegex.test(lastArg) || commonColors.includes(lastArg.toLowerCase()))) {
            roleColor = lastArg;
            roleName = args.slice(0, -1).join(" ");
        }

        try {
            const role = await message.guild.roles.create({ name: roleName, color: roleColor, reason: `Created by ${message.author.tag}` });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("✨ ROLE CONSTRUCTED", 2),
                        V2.text(`**${role.name}** has been added to the registry.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Name:** \`${role.name}\`\n> **Color:** \`${role.hexColor}\`\n> **ID:** \`${role.id}\`\n> **Created by:** ${message.author}`)
                ], role.hexColor !== "#000000" ? role.hexColor : V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to create role.** Check hierarchy or permissions.")], V2_RED)] });
        }
    }
};
