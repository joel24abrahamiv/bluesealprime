const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "kick",
  description: "Kicks a member from the server with confirmation",
  permissions: [PermissionsBitField.Flags.KickMembers],
  whitelistOnly: true,

  async execute(message, args) {
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    // ───── TARGET CHECK ─────
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing User.** Usage: `!kick @user [reason]`")] });
    }

    if (member.id === BOT_OWNER_ID) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ The **bot owner** is invincible and cannot be kicked.")] });
    }

    if (member.id === message.guild.ownerId) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ You cannot kick the **server owner**.")] });
    }

    if (member.id === message.client.user.id) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot kick **myself**.")] });
    }

    // Role hierarchy checks
    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ You cannot kick a user with an **equal or higher role**.")] });
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot kick this user because their role is **higher than mine**.")] });
    }

    // Reason
    const reason =
      args.slice(1).join(" ") || "No reason provided by moderator";

    // ───── CONFIRMATION EMBED ─────
    const confirmEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("⚠️ Confirm Kick")
      .setDescription(
        `Are you sure you want to **kick** the following user?\n\n` +
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
        .setCustomId("kick_yes")
        .setLabel("Yes, kick")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("kick_no")
        .setLabel("No, cancel")
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

      if (interaction.customId === "kick_no") {
        collector.stop();
        return confirmMsg.edit({
          content: "❌ **Kick cancelled.**",
          embeds: [],
          components: []
        }).catch(() => { });
      }

      if (interaction.customId === "kick_yes") {
        collector.stop();

        // ───── DM USER BEFORE KICK ─────
        try {
          const owner = await message.guild.fetchOwner();

          await member.send(
            `👋 Hello,\n\n` +
            `You have been **removed from the server** **${message.guild.name}**.\n\n` +
            `📝 **Reason:** ${reason}\n\n` +
            `If you believe this was a mistake, you may contact the **server owner**:\n` +
            `👑 ${owner.user.tag}\n\n` +
            `We wish you the best going forward !`
          );
        } catch (_) {
          // DM failed — continue silently
        }

        // ───── KICK USER ─────
        try {
          await member.kick(reason);

          await message.channel.send(
            `👢 **${member.user.tag} has been kicked.**\n` +
            `📝 Reason: ${reason}`
          );
        } catch (err) {
          console.error(err);
          await message.channel.send(
            "❌ **Failed to kick the user.**"
          );
        }

        confirmMsg.delete().catch(() => { });
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") {
        confirmMsg.edit({
          content: "⌛ **Kick confirmation timed out.**",
          embeds: [],
          components: []
        }).catch(() => { });
      }
    });
  }
};
