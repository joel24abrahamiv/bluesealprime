const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "deleterole",
    description: "Delete a role",
    usage: "!deleterole <role>",
    permissions: [PermissionsBitField.Flags.ManageRoles],



    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to manage roles.")] });
        }

        if (!args[0]) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing Role.** Usage: `!deleterole <role>`")] });
        }

        const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("❌ **Role not found.**")] });
        }

        // Hierarchy Check
        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I cannot delete this role (Hierarchy too high).")] });
        }

        try {
            const roleName = role.name;
            await role.delete(`Deleted by ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(require("../config").SUCCESS_COLOR)
                .setTitle("🗑️ Role Deleted")
                .setDescription(`Successfully purged the role: **${roleName}**`)
                .setFooter({ text: `Action by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("❌ Failed to delete role.")] });
        }
    }
};
