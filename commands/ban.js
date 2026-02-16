const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "ban",
  description: "Ban a member from the server with confirmation",
  permissions: [PermissionsBitField.Flags.BanMembers],

  async execute(message, args) {
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    // ───── TARGET CHECK ─────
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing User.** Usage: `!ban @user [reason]`")] });
    }

    if (member.id === BOT_OWNER_ID) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ The **bot owner** is invincible and cannot be banned.")] });
    }

    if (member.id === message.guild.ownerId) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ You cannot ban the **server owner**.")] });
    }

    if (member.id === message.client.user.id) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot ban **myself**.")] });
    }

    // Role hierarchy checks (Owner bypasses user hierarchy check, but bot must still be higher)
    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ You cannot ban a user with an **equal or higher role**.")] });
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot ban this user because their role is **higher than mine**.")] });
    }

    const reason =
      args.slice(1).join(" ") || "No reason provided";

    // ───── CONFIRMATION EMBED ─────
    const confirmEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("⚠️ Confirm Ban")
      .setDescription(
        `Are you sure you want to **ban** this user?\n\n` +
        `👤 **User:** ${member.user.tag}\n` +
        `📝 **Reason:** ${reason}`
      )
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ban_yes")
        .setLabel("Yes, Ban")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("ban_no")
        .setLabel("No, Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    const confirmMsg = await message.reply({
      embeds: [confirmEmbed],
      components: [row]
    });

    const collector = confirmMsg.createMessageComponentCollector({
      time: 20000
    });

    collector.on("collect", async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "❌ You cannot interact with this confirmation.",
          ephemeral: true
        });
      }

      await interaction.deferUpdate();

      if (interaction.customId === "ban_no") {
        collector.stop();
        return confirmMsg.edit({
          content: "❌ **Ban cancelled.**",
          embeds: [],
          components: []
        }).catch(() => { });
      }

      if (interaction.customId === "ban_yes") {
        collector.stop();

        // ───── DM USER BEFORE BAN ─────
        try {
          const owner = message.client.users.cache.get(message.guild.ownerId) || await message.guild.fetchOwner();

          await member.send(
            `👋 Hello,\n\n` +
            `You have been **banned from the server** **${message.guild.name}**.\n\n` +
            `📝 **Reason:** ${reason}\n\n` +
            `If you believe this was a mistake, you may contact the **server owner**:\n` +
            `👑 ${owner.user.tag}\n\n` +
            `We wish you the best going forward.`
          );
        } catch (_) {
          // DM closed – ignore safely
        }

        // ───── BAN USER ─────
        try {
          await member.ban({ reason });

          const banEmbed = new EmbedBuilder()
            .setColor("#990000") // Dark Crimson for Judgement
            .setTitle("⚖️ JUDGMENT EXECUTED")
            .setDescription(
              `**The verdict has been delivered.**\nUser **${member.user.tag}** has been removed from the server.`
            )
            .addFields(
              {
                name: "👤 Offender",
                value: `**${member.user.tag}**\n\`${member.user.id}\``,
                inline: true
              },
              {
                name: "⚖️ Magistrate",
                value: `${message.author}\n\`${message.author.id}\``,
                inline: true
              },
              {
                name: "📜 Verdict Reason",
                value: `\`${reason}\``,
                inline: false
              }
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/9240/9240331.png") // Gavel Icon
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
            .setFooter({
              text: `BlueSealPrime Justice System • ${new Date().toLocaleTimeString()}`,
              iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();

          await message.channel.send({ embeds: [banEmbed] });

        } catch (err) {
          console.error(err);
          await message.channel.send(
            "❌ **Failed to ban the user.**"
          );
        }

        confirmMsg.delete().catch(() => { });
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") {
        confirmMsg.edit({
          content: "⌛ **Ban confirmation timed out.**",
          embeds: [],
          components: []
        }).catch(() => { });
      }
    });
  }
};
