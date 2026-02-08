const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "purge",
  description: "Deletes messages with optional confirmation",
  permissions: [PermissionsBitField.Flags.ManageMessages],

  async execute(message, args) {
    // Permission check handled globally
    // We still keep the logic clean

    // ───── CASE 1: NO ARGUMENT → CONFIRMATION EMBED ─────
    if (args.length === 0) {
      const confirmEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("⚠️ Confirm Purge")
        .setDescription(
          "**No number was provided.**\n\n" +
          "This will delete **ALL recent messages** in this channel (up to Discord limits).\n\n" +
          "**Do you want to continue?**"
        )
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("purge_yes")
          .setLabel("Yes, delete")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("purge_no")
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
        // Only the command author can interact
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: "❌ You cannot interact with this confirmation.",
            ephemeral: true
          });
        }

        await interaction.deferUpdate();

        if (interaction.customId === "purge_no") {
          collector.stop();
          return confirmMsg.edit({
            content: "❌ **Purge cancelled.**",
            embeds: [],
            components: []
          }).catch(() => { });
        }

        if (interaction.customId === "purge_yes") {
          collector.stop();

          try {
            const messages = await message.channel.messages.fetch({ limit: 100 });
            await message.channel.bulkDelete(messages, true);

            await message.channel.send(
              "🧹 **All recent messages deleted.**"
            );
          } catch (err) {
            console.error(err);
            await message.channel.send(
              "❌ **Failed to delete messages.** Some messages may be older than 14 days."
            );
          }

          confirmMsg.delete().catch(() => { });
        }
      });

      collector.on("end", (_, reason) => {
        if (reason === "time") {
          confirmMsg.edit({
            content: "⌛ **Confirmation timed out.**",
            embeds: [],
            components: []
          }).catch(() => { });
        }
      });

      return;
    }

    // ───── CASE 2: NUMBER PROVIDED → IMMEDIATE DELETE ─────
    const amount = parseInt(args[0]);

    if (isNaN(amount)) {
      return message.reply(
        "❌ **Invalid number.**\nUsage: `!purge 10`"
      );
    }

    if (amount < 1 || amount > 100) {
      return message.reply(
        "❌ **You can delete between 1 and 100 messages only.**"
      );
    }

    try {
      await message.channel.bulkDelete(amount, true);

      const done = await message.channel.send(
        `🧹 **Successfully deleted ${amount} messages.**`
      );

      setTimeout(() => {
        done.delete().catch(() => { });
      }, 3000);
    } catch (error) {
      console.error(error);
      message.reply(
        "❌ **Failed to delete messages.** Messages older than 14 days cannot be deleted."
      );
    }
  }
};
