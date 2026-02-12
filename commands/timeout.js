const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

// ───── TIME PARSER ─────
function parseDuration(input) {
  const match = input.match(/^(\d+)(m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

module.exports = {
  name: "timeout",
  description: "Timeout a member with confirmation",
  permissions: [PermissionsBitField.Flags.ModerateMembers],

  async execute(message, args) {
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing User.** Usage: `!timeout @user <duration> [reason]`")] });
    }

    // ───── IMMUNITY CHECKS ─────
    if (member.id === BOT_OWNER_ID) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ The **bot owner** cannot be timed out.")] });
    }

    if (member.id === message.guild.ownerId) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ The **server owner** cannot be timed out.")] });
    }

    if (member.id === message.client.user.id) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot timeout **myself**.")] });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ You cannot timeout a user with an **equal or higher role**.")] });
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ I cannot timeout this user because their role is **higher than mine**.")] });
    }

    const durationInput = args[1];
    if (!durationInput) {
      return message.reply(
        "❌ **No duration provided.**\nExample: `10m`, `1h`, `1d`"
      );
    }

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      return message.reply(
        "❌ **Invalid duration format.** Use `m`, `h`, or `d`."
      );
    }

    // Discord hard limit: 28 days
    const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;
    if (durationMs > MAX_TIMEOUT) {
      return message.reply(
        "❌ **Maximum timeout duration is 28 days.**"
      );
    }

    const reason =
      args.slice(2).join(" ") || "No reason provided";

    // ───── CONFIRMATION EMBED ─────
    const confirmEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("⏳ Confirm Timeout")
      .setDescription(
        `Are you sure you want to **timeout** this user?\n\n` +
        `👤 **User:** ${member.user.tag}\n` +
        `⏱️ **Duration:** ${durationInput}\n` +
        `📝 **Reason:** ${reason}`
      )
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("timeout_yes")
        .setLabel("Yes, Timeout")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("timeout_no")
        .setLabel("Cancel")
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

      if (interaction.customId === "timeout_no") {
        collector.stop();
        return confirmMsg.edit({
          content: "❌ **Timeout cancelled.**",
          embeds: [],
          components: []
        }).catch(() => { });
      }

      if (interaction.customId === "timeout_yes") {
        collector.stop();

        try {
          await member.timeout(durationMs, reason);

          const successEmbed = new EmbedBuilder()
            .setColor("#FFA500") // Amber/Orange for Warning/Timeout
            .setTitle("⏳ TEMPORARY CONTAINMENT")
            .setDescription(
              `**Subject has been isolated.**\nCommunication privileges have been suspended for the specified duration.`
            )
            .addFields(
              {
                name: "👤 Subject",
                value: `**${member.user.tag}**\n\`${member.user.id}\``,
                inline: true
              },
              {
                name: "⏱️ Duration",
                value: `\`${durationInput}\``,
                inline: true
              },
              {
                name: "🛡️ Enforcer",
                value: `${message.author}`,
                inline: true
              },
              {
                name: "📝 Containment Reason",
                value: `\`${reason}\``,
                inline: false
              }
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/2890/2890209.png") // Hourglass/Timer Icon
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
            .setFooter({
              text: `BlueSealPrime Containment Unit • ${new Date().toLocaleTimeString()}`,
              iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();

          await message.channel.send({ embeds: [successEmbed] });

        } catch (err) {
          console.error(err);
          await message.channel.send(
            "❌ **Failed to timeout the user.**"
          );
        }

        confirmMsg.delete().catch(() => { });
      }
    });
  }
};
