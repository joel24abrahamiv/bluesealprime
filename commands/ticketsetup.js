const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "ticketsetup",
    description: "Deploy the Secure Ticket Panel",
    usage: "!ticketsetup [channel]",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 I do not have permission to setup tickets.")] });
        }

        // Delete command
        message.delete().catch(() => { });

        const embed = new EmbedBuilder()
            .setColor("#0099FF") // Cyber Blue
            .setTitle("🛡️ SECURE SUPPORT TERMINAL")
            .setDescription(
                "**Authenticate to open a private line.**\n" +
                "Click the button below to create a secure ticket channel.\n\n" +
                "> 📩 **Support**\n" +
                "> ⚠️ **Reports**\n" +
                "> 🤝 **Inquiries**"
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/1067/1067566.png") // Secure Folder
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934983938068/line-blue.gif") // Blue Line
            .setFooter({ text: "BlueSealPrime • Encrypted Connection Protocol", iconURL: message.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("ticket_category")
                .setPlaceholder("🔹 Select a Ticket Category")
                .addOptions([
                    {
                        label: "General Support",
                        description: "Get help with server issues or questions.",
                        emoji: "🎫",
                        value: "ticket_support"
                    },
                    {
                        label: "Report User/Bug",
                        description: "Report a rule breaker or bot bug.",
                        emoji: "⚠️",
                        value: "ticket_report"
                    },
                    {
                        label: "Staff Application",
                        description: "Apply to join the security team.",
                        emoji: "🛡️",
                        value: "ticket_apply"
                    }
                ])
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};

