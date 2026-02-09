const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "warn",
    description: "Warn a user (DMs them)",
    usage: "!warn @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [new EmbedBuilder().setColor("#FFA500").setDescription("⚠️ **Missing User.** Usage: `!warn @user [reason]`")] });

        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
            return message.reply("❌ **Immunity system active.** This user cannot be warned.");
        }

        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("❌ **Hierarchy Error:** You cannot warn someone with an equal or higher role.");
        }

        const reason = args.slice(1).join(" ") || "No reason provided.";

        const warnEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("⚠️ OFFICIAL REPRIMAND")
            .setDescription(`**${target.user.tag}** has been formally warned.`)
            .addFields(
                { name: "👤 User", value: `${target}`, inline: true },
                { name: "👮 Moderator", value: `${message.author}`, inline: true },
                { name: "📝 Reason", value: `\`${reason}\``, inline: false }
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/564/564619.png") // Warning Shield
            .setFooter({ text: "BlueSealPrime Moderation Unit" })
            .setTimestamp();

        try {
            await target.send({ embeds: [warnEmbed.setTitle(`⚠️ WARNING: ${message.guild.name}`)] }).catch(() => { });
            message.channel.send({ embeds: [warnEmbed] });
        } catch (e) {
            message.channel.send({ embeds: [warnEmbed.setFooter({ text: "BlueSealPrime Moderation Unit • DM Failed" })] });
        }
    }
};
