const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR, BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "removerole",
    description: "Remove a role from a user",
    usage: "!removerole @User @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],



    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to manage roles.")] });
        }

        const member = message.mentions.members.first();
        let role = message.mentions.roles.first();

        if (!role && args.length > 1) {
            const roleQuery = args.slice(1).join(" ");
            role = message.guild.roles.cache.get(roleQuery) ||
                message.guild.roles.cache.find(r => r.name.toLowerCase() === roleQuery.toLowerCase());
        }

        if (!member || !role) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Invalid Usage.** Usage: `!removerole @User @Role`")] });
        }

        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 Role hierarchy prevents this action.")] });
        }

        if (!member.roles.cache.has(role.id)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("ℹ️ User does not have this role.")] });
        }

        try {
            await member.roles.remove(role);

            const embed = new EmbedBuilder()
                .setColor(require("../config").ERROR_COLOR)
                .setTitle("⛔ CLEARANCE REVOKED")
                .setDescription(`**Access Privileges Retracted.**\nThe user **${member.user.username}** has been stripped of a role.`)
                .addFields(
                    { name: "👤 Operative", value: `${member}`, inline: true },
                    { name: "🚫 Revoked Role", value: `${role}`, inline: true },
                    { name: "🆔 Role ID", value: `\`${role.id}\``, inline: false }
                )
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/9208/9208006.png") // Access Denied / Shield with X
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
                .setTimestamp()
                .setFooter({ text: `BlueSealPrime Personnel Management • ${new Date().toLocaleTimeString()}`, iconURL: message.author.displayAvatarURL() });

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("❌ Failed to remove role.")] });
        }
    }
};
