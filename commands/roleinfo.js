const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
    name: "roleinfo",
    aliases: ["rinfo", "role"],
    description: "Get information about a specific role",
    usage: "!roleinfo @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(require("../config").ERROR_COLOR)
                        .setDescription("❌ **Role not found.** Please specify a valid role (mention, ID, or name).")
                ]
            });
        }

        const perms = role.permissions.toArray().map(p => p.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()));
        const permString = perms.length > 0 ? (perms.length > 8 ? `${perms.slice(0, 8).join(", ")} + ${perms.length - 8} more` : perms.join(", ")) : "None";

        const embed = new EmbedBuilder()
            .setColor(role.color || "Default")
            .setAuthor({ name: `Role Information: ${role.name}`, iconURL: message.guild.iconURL() })
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/681/681392.png") // Placeholder Shield Icon
            .addFields(
                { name: "🆔 ID", value: `\`${role.id}\``, inline: true },
                { name: "🎨 Color", value: `\`${role.hexColor}\``, inline: true },
                { name: "📅 Created", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
                { name: "👥 Members", value: `**${role.members.size}** users`, inline: true },
                { name: "✨ Hoisted", value: role.hoist ? "✅ Yes" : "❌ No", inline: true },
                { name: "🤖 Managed", value: role.managed ? "✅ Yes" : "❌ No", inline: true },
                { name: "📜 Key Permissions", value: `\`\`\`${permString}\`\`\``, inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};
