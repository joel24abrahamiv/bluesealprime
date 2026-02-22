const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "roleperm",
    description: "Modify role permissions (add/remove)",
    aliases: ["rperm", "editrole"],
    usage: "!roleperm <@role/ID> <add|remove> <Permission>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (args.length < 3)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!roleperm <@role/ID> <add|remove> <Permission>`\n**Example:** `!roleperm @Mods add BanMembers`")], V2_RED)] });

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Role not found.**")], V2_RED)] });

        const action = args[1].toLowerCase();
        const permString = args[2];
        const targetPerm = PermissionsBitField.Flags[permString];

        if (!targetPerm)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ **Invalid Permission:** \`${permString}\`\nExamples: \`BanMembers\`, \`KickMembers\`, \`Administrator\`, \`ManageChannels\``)], V2_RED)] });

        if (role.position >= message.guild.members.me.roles.highest.position)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ I cannot modify this role — it's above my highest role.")], V2_RED)] });

        try {
            const currentPerms = new PermissionsBitField(role.permissions);
            let newPerms;

            if (action === "add" || action === "+") {
                if (currentPerms.has(targetPerm)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ This role **already has** that permission.")], V2_RED)] });
                newPerms = currentPerms.add(targetPerm);
            } else if (action === "remove" || action === "-") {
                if (!currentPerms.has(targetPerm)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ This role **does not have** that permission.")], V2_RED)] });
                newPerms = currentPerms.remove(targetPerm);
            } else {
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Invalid action. Use `add` or `remove`.")], V2_RED)] });
            }

            await role.setPermissions(newPerms);
            message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("💎 ROLE PERMISSIONS UPDATED", 2),
                    V2.text(`> **Role:** ${role}\n> **Action:** ${action === "add" ? "✅ Added" : "🔻 Removed"}\n> **Permission:** \`${permString}\`\n> **By:** ${message.author.tag}`)
                ], V2_BLUE)]
            });
        } catch (err) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to update permissions.** Check my role hierarchy.")], V2_RED)] });
        }
    }
};
