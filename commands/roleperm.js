const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "roleperm",
    description: "Modify role permissions (Admin/Whitelist Only)",
    aliases: ["rperm", "editrole"],
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // Usage: !roleperm <role> <add|remove> <permission>
        if (args.length < 3) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(ERROR_COLOR)
                    .setTitle("⚠️ Inspect Syntax")
                    .setDescription("Usage: `!roleperm <@role/ID> <add|remove> <Permission>`\nExample: `!roleperm @Mods add BanMembers`")
                ]
            });
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply("❌ **Role not found.**");

        const action = args[1].toLowerCase();
        const permString = args[2];
        const targetPerm = PermissionsBitField.Flags[permString];

        if (!targetPerm) {
            return message.reply(`❌ **Invalid Permission.**\nAvailable examples: \`BanMembers\`, \`KickMembers\`, \`Administrator\`, \`ManageChannels\`.`);
        }

        // High level safety check - prevent modifying bot's own highest role or roles higher than bot
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ **I cannot modify this role** because it is higher than or equal to my highest role.");
        }

        try {
            const currentPerms = new PermissionsBitField(role.permissions);
            let newPerms;

            if (action === "add" || action === "+") {
                if (currentPerms.has(targetPerm)) {
                    return message.reply("⚠️ This role **already has** that permission.");
                }
                newPerms = currentPerms.add(targetPerm);
            } else if (action === "remove" || action === "-") {
                if (!currentPerms.has(targetPerm)) {
                    return message.reply("⚠️ This role **does not have** that permission.");
                }
                newPerms = currentPerms.remove(targetPerm);
            } else {
                return message.reply("❌ Invalid action. Use `add` or `remove`.");
            }

            await role.setPermissions(newPerms);

            const successEmbed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("💎 ROLE PERMISSIONS UPDATED")
                .setDescription(
                    `**Role:** ${role}\n` +
                    `**Action:** ${action === "add" ? "✅ Added" : "🔻 Removed"}\n` +
                    `**Permission:** \`${permString}\``
                )
                .setFooter({ text: `Updated by ${message.author.tag}` })
                .setTimestamp();

            message.reply({ embeds: [successEmbed] });

        } catch (err) {
            console.error(err);
            message.reply("❌ **Failed to update permissions.** Check my role hierarchy.");
        }
    }
};
