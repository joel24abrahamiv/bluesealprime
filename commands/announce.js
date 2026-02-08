const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "announce",
    description: "Make an official server announcement",
    usage: "!announce <message>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to manage messages.")] });
        }

        if (args.length === 0) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing Content.** Usage: `!announce <message>`")] });
        }

        // Delete command message
        message.delete().catch(() => { });

        const announcement = args.join(" ");

        const embed = new EmbedBuilder()
            .setColor("#FFD700") // Cyber Gold
            .setTitle("📢 SYSTEM WIDE BROADCAST")
            .setDescription(
                "**Incoming Transmission:**\n" +
                "```fix\n" + announcement + "\n```" +  // 'fix' highlights it in yellow/gold in dark mode
                "\n> *This is an official communication from server command.*"
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/3029/3029337.png") // High tech megaphone
            .addFields(
                { name: "📡 Origin", value: `\`${message.author.tag}\``, inline: true },
                { name: "📶 Priority", value: "`CRITICAL / HIGH`", inline: true },
                { name: "📅 Timestamp", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885933683720232/line-yellow.gif") // Gold Line
            .setFooter({ text: `BlueSealPrime Global Systems • Verification: 0x${Math.floor(Math.random() * 10000).toString(16).toUpperCase()}`, iconURL: message.client.user.displayAvatarURL() });

        return message.channel.send({ embeds: [embed] });
    }
};
