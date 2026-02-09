const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, EMBED_COLOR } = require("../config");

module.exports = {
  name: "enuke",
  description: "Elite Extreme Nuke (Protocol 0). Multi-stage verified destruction.",
  aliases: ["exnuke", "extreme-nuke"],
  async execute(message, args) {
    if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) return;

    // STAGE 1: INITIAL AUTHORIZATION
    const authEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("☣️ CRITICAL AUTHORIZATION: PROTOCOL 0")
      .setDescription("You are initiating a full server sanitize. This will purge all channels, roles, and emojis.\n\n**Do you wish to proceed with the annihilation?**")
      .setFooter({ text: "Standard security timeouts applied (30s)." });

    const authRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enuke_auth_proceed").setLabel("Confirm Annihilation").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("enuke_auth_cancel").setLabel("Abort").setStyle(ButtonStyle.Secondary)
    );

    const initialMsg = await message.channel.send({ embeds: [authEmbed], components: [authRow] });

    const authCollector = initialMsg.createMessageComponentCollector({ time: 30000, max: 1 });

    authCollector.on("collect", async i => {
      if (i.user.id !== message.author.id) return i.reply({ content: "🚫 Logic restricted to owner.", ephemeral: true });

      if (i.customId === "enuke_auth_cancel") {
        return i.update({ content: "❌ **Protocol Aborted.** System standing down.", embeds: [], components: [] });
      }

      // STAGE 2: STRATEGY SELECTION
      const strategyEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("🛠️ RECONSTRUCTION STRATEGY")
        .setDescription("Phase 1 verified. Choose your post-annihilation strategy:\n\n**Option A:** Purge everything and leave the server empty.\n**Option B:** Purge everything and immediately reconstruct custom channels.")
        .setFooter({ text: "Select a strategy to begin the sequence." });

      const strategyRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("enuke_strat_rebuild").setLabel("Purge + Rebuild").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("enuke_strat_only").setLabel("Purge Only").setStyle(ButtonStyle.Danger)
      );

      const stratMsg = await i.update({ embeds: [strategyEmbed], components: [strategyRow], fetchReply: true });

      const stratCollector = stratMsg.createMessageComponentCollector({ time: 30000, max: 1 });

      stratCollector.on("collect", async i2 => {
        if (i2.user.id !== message.author.id) return i2.reply({ content: "🚫 Logic restricted.", ephemeral: true });

        const strategy = i2.customId;

        if (strategy === "enuke_strat_only") {
          await runEnuke(i2, false);
        } else {
          // STAGE 3: MODAL FOR PARAMETERS
          const modal = new ModalBuilder()
            .setCustomId("enuke_rebuild_modal")
            .setTitle("Reconstruction Parameters");

          const nameInput = new TextInputBuilder()
            .setCustomId("rebuild_name")
            .setLabel("What should the new channels be named?")
            .setPlaceholder("e.g. general")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const countInput = new TextInputBuilder()
            .setCustomId("rebuild_count")
            .setLabel("How many channels should be created?")
            .setPlaceholder("e.g. 10")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(countInput));

          await i2.showModal(modal);

          try {
            const submitted = await i2.awaitModalSubmit({ time: 60000, filter: mi => mi.user.id === i2.user.id });

            const chanName = submitted.fields.getTextInputValue("rebuild_name");
            const chanCount = parseInt(submitted.fields.getTextInputValue("rebuild_count"));

            if (isNaN(chanCount) || chanCount < 1 || chanCount > 100) {
              return submitted.reply({ content: "❌ **Invalid Count:** Please specify a number between 1 and 100.", ephemeral: true });
            }

            await runEnuke(submitted, true, { name: chanName, count: chanCount });
          } catch (e) {
            // Modal timed out or closed
          }
        }
      });
    });

    async function runEnuke(interaction, rebuild, params = {}) {
      const statusEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("☣️ PROTOCOL 0: HYPER-PULSE ACTIVATED")
        .setDescription("```diff\n- INITIALIZING FULL SERVER SANITIZATION\n- TARGETING: CHANNELS, ROLES, EMOJIS, STICKERS, WEBHOOKS\n```")
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934983938068/line-blue.gif")
        .setFooter({ text: "BlueSealPrime • Annihilation Sequence" });

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [statusEmbed], components: [] });
      } else {
        await interaction.update({ embeds: [statusEmbed], components: [] });
      }

      const guild = message.guild;

      try {
        // HYPER-WAVE DELETION (PARALLEL)
        const channels = guild.channels.cache.filter(c => c.id !== message.channel.id);
        const roles = guild.roles.cache.filter(r => r.editable && r.id !== guild.id);
        const emojis = guild.emojis.cache;
        const stickers = guild.stickers.cache;
        const webhooks = await guild.fetchWebhooks().catch(() => []);

        const allItems = [
          ...Array.from(channels.values()),
          ...Array.from(roles.values()),
          ...Array.from(emojis.values()),
          ...Array.from(stickers.values()),
          ...Array.from(webhooks.values())
        ];

        // Pulse Update
        statusEmbed.addFields({ name: "📊 WAVE STATUS", value: `\`\`\`fix\nPurging ${allItems.length} entities...\n\`\`\`` });
        if (interaction.deferred || interaction.replied) await interaction.editReply({ embeds: [statusEmbed] });

        await Promise.allSettled(allItems.map(item => item.delete().catch(() => { })));

        if (rebuild) {
          statusEmbed.setDescription("```diff\n+ SANITIZATION COMPLETE\n+ INITIALIZING RECONSTRUCTION PHASE\n```");
          if (interaction.deferred || interaction.replied) await interaction.editReply({ embeds: [statusEmbed] });

          const channelTasks = [];
          for (let i = 0; i < params.count; i++) {
            channelTasks.push(
              guild.channels.create({
                name: params.name,
                type: ChannelType.GuildText,
                reason: "Protocol 0: Rebuild"
              }).catch(() => { })
            );
          }
          await Promise.allSettled(channelTasks);

          await message.channel.send({
            embeds: [new EmbedBuilder()
              .setColor(SUCCESS_COLOR)
              .setTitle("✅ ANNIHILATION & REBUILD COMPLETE")
              .setDescription(`Deployed \`${params.count}\` sectors named \`${params.name}\`.\nServer is now sanitized and structured.`)
              .setFooter({ text: "BlueSealPrime • Priority Alpha Success" })]
          });
        } else {
          await message.channel.send({
            embeds: [new EmbedBuilder()
              .setColor(SUCCESS_COLOR)
              .setTitle("✅ ANNIHILATION COMPLETE")
              .setDescription("The server has been fully sanitized. All sectors purged.")
              .setFooter({ text: "BlueSealPrime • Priority Alpha Success" })]
          });
        }
      } catch (err) {
        console.error(err);
        message.channel.send("❌ **Critical Failure during Protocol 0.**");
      }
    }
  },
};
