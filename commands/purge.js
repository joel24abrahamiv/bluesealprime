const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { V2_RED, V2_BLUE } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
  name: "purge",
  description: "Bulk delete messages with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  aliases: ["clear", "cls"],

  async execute(message, args) {
    const botAvatar = V2.botAvatar(message);
    const dangerIcon = "https://cdn-icons-png.flaticon.com/512/564/564619.png";

    // ───── CASE 1: NO ARGUMENT → CONFIRMATION V2 ─────
    if (args.length === 0) {
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("purge_yes").setLabel("Confirm Wipe").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("purge_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
      );

      const confirmContainer = V2.container([
        V2.section(
          [
            V2.heading("🧨 CHANNEL WIPE PROTOCOL", 2),
            V2.text("No quantity specified. Initiate full purge of all recent cached messages (up to 100)?\n\n**Warning:** This action is irreversible.")
          ],
          dangerIcon
        ),
        V2.separator(),
        confirmRow
      ], V2_RED);

      const confirmMsg = await message.reply({
        content: null,
        flags: V2.flag,
        components: [confirmContainer]
      });

      const collector = confirmMsg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 20000,
        max: 1
      });

      collector.on("collect", async interaction => {
        await interaction.deferUpdate();

        if (interaction.customId === "purge_no") {
          return confirmMsg.delete().catch(() => { });
        }

        try {
          const messages = await message.channel.messages.fetch({ limit: 100 });
          await message.channel.bulkDelete(messages, true);

          const done = await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
              V2.section([
                V2.heading("🧹 PURGE COMPLETE", 2),
                V2.text(`Successfully sanitized the channel core.`)
              ], botAvatar)
            ], V2_BLUE)]
          });
          setTimeout(() => done.delete().catch(() => { }), 3000);

        } catch (err) {
          console.error(err);
          await message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.section([V2.text("❌ **Cleanup Interrupted:** Some messages may be too old for bulk deletion.")], botAvatar)], V2_RED)]
          });
        }

        confirmMsg.delete().catch(() => { });
      });

      collector.on("end", (_, reason) => {
        if (reason === "time") confirmMsg.delete().catch(() => { });
      });

      return;
    }

    // ───── CASE 2: NUMBER PROVIDED → IMMEDIATE DELETE ─────
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([V2.section([V2.text("❌ **Invalid quantity.** Please specify a number between 1 and 100.")], botAvatar)], V2_RED)]
      });
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const done = await message.channel.send({
        content: null,
        flags: V2.flag,
        components: [V2.container([
          V2.section([
            V2.heading("🧹 PURGE COMPLETE", 2),
            V2.text(`Successfully cleared **${amount}** messages.`)
          ], botAvatar)
        ], V2_BLUE)]
      });
      setTimeout(() => done.delete().catch(() => { }), 3000);
    } catch (error) {
      console.error(error);
      message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([V2.section([V2.text("❌ **Cleanup failed.** Message age limit reached (14 days).")], botAvatar)], V2_RED)]
      });
    }
  }
};
