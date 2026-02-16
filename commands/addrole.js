const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR, BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "addrole",
    description: "Add a role to a user",
    usage: "!addrole @User @Role",
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
            // Try to find by ID if it's a number, then by name
            const roleIdMatch = roleQuery.match(/(\d{17,20})/);
            const roleId = roleIdMatch ? roleIdMatch[1] : null;

            role = (roleId ? await message.guild.roles.fetch(roleId).catch(() => null) : null) ||
                message.guild.roles.cache.get(roleQuery) ||
                message.guild.roles.cache.find(r => r.name.toLowerCase() === roleQuery.toLowerCase()) ||
                message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleQuery.toLowerCase()));
        }

        if (!member || !role) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Invalid Usage.** Usage: `!addrole @User @Role`")] });
        }

        if (!isBotOwner && !isServerOwner && role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 Role hierarchy prevents this action.")] });
        }

        if (member.roles.cache.has(role.id)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("ℹ️ User already has this role.")] });
        }

        try {
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor(require("../config").SUCCESS_COLOR)
                .setTitle("✅ PERSONNEL UPGRADE")
                .setDescription(`**Security Clearance Expanded.**\nThe user **${member.user.username}** has been granted new privileges.`)
                .addFields(
                    { name: "👤 Operative", value: `${member}`, inline: true },
                    { name: "🛡️ New Clearance", value: `${role}`, inline: true },
                    { name: "🆔 Role ID", value: `\`${role.id}\``, inline: false }
                )
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/942/942748.png") // Badge/ID Card Icon
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
                .setFooter({ text: `BlueSealPrime Personnel Management • ${new Date().toLocaleTimeString()}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("❌ Failed to add role.")] });
        }
    }
};
