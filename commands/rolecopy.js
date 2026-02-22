const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "rolecopy",
    description: "Copy permissions from one role to another",
    usage: "!rolecopy <targetRole> <sourceRole>",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        if (args.length < 2)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!rolecopy <targetRole> <sourceRole>`")], V2_RED)] });

        const targetRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        const sourceRole = message.mentions.roles.filter(r => r.id !== targetRole?.id).first() || message.guild.roles.cache.get(args[1]);

        if (!targetRole || !sourceRole)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Role Not Found.** Ensure both roles are valid mentions or IDs.")], V2_RED)] });

        if (targetRole.position >= message.guild.members.me.roles.highest.position)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Hierarchy Error:** I cannot modify a role above my own.")], V2_RED)] });

        try {
            await targetRole.setPermissions(sourceRole.permissions.bitfield, `Permissions copied from ${sourceRole.name} by ${message.author.tag}`);
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🧬 PERMISSION SYNCHRONIZATION COMPLETE", 2),
                    V2.text(`**Permission matrix successfully replicated.**\n\n> 🎯 **Target Role:** ${targetRole} (\`${targetRole.id}\`)\n> 🧬 **Source Role:** ${sourceRole} (\`${sourceRole.id}\`)\n> ⚖️ **Bits Transferred:** \`${sourceRole.permissions.bitfield.toString()}\``),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Role Inheritance Manager*")
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to sync permissions. Check my role position.")], V2_RED)] });
        }
    }
};
