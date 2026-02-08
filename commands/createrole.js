const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "createrole",
    description: "Create a new role",
    usage: "!createrole <name> [color]",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        const { BOT_OWNER_ID } = require("../config");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to manage roles.")] });
        }

        if (!args[0]) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing Name.** Usage: `!createrole <name> [color]`")] });
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
            const role = await message.guild.roles.create({
                name: roleName,
                color: roleColor,
                reason: `Created by ${message.author.tag}`
            });

            const embed = new EmbedBuilder()
                .setColor(role.hexColor)
                .setTitle("✨ NEW ROLE CONSTRUCTED")
                .setDescription(`**A new power level has been established.**\nThe role **${role.name}** is now available in the registry.`)
                .addFields(
                    { name: "🏷️ Role Name", value: `**${role.name}**`, inline: true },
                    { name: "🎨 Color Code", value: `\`${role.hexColor}\``, inline: true },
                    { name: "🆔 Role Identity", value: `\`${role.id}\``, inline: false }
                )
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/3616/3616929.png") // Paint/Role Icon
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
                .setFooter({ text: `BlueSealPrime Role Manager • ${new Date().toLocaleTimeString()}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("❌ Failed to create role. Check my hierarchy or permissions.")] });
        }
    }
};
