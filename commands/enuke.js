const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, EMBED_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
  name: "enuke",
  description: "Elite Extreme Nuke (Protocol 0). Multi-stage verified destruction.",
  async execute(message, args) {
    // 0. Permission Check
    const isOwner = message.author.id === BOT_OWNER_ID;
    const isGuildOwner = message.guild.ownerId === message.author.id;

    if (!isOwner && !isGuildOwner) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **Access Denied:** You are not authorized to use Protocol 0.")]
      });
    }

    // STAGE 1: INITIAL AUTHORIZATION
    const authEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("☣️ CRITICAL AUTHORIZATION: PROTOCOL 0")
      .setDescription("You are initiating a full server sanitize.\nThis will **PERMANENTLY DELETE** all channels, roles, and emojis.\n\n**Do you wish to proceed with the annihilation?**")
      .setFooter({ text: "Standard security timeouts applied (30s)." });

    const authRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enuke_auth_proceed").setLabel("Confirm Annihilation").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("enuke_auth_cancel").setLabel("Abort").setStyle(ButtonStyle.Secondary)
    );

    const initialMsg = await message.channel.send({ embeds: [authEmbed], components: [authRow] });

    // Collector 1
    const authCollector = initialMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30000,
      max: 1
    });

    authCollector.on("collect", async i => {
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

      // Collector 2
      const stratCollector = stratMsg.createMessageComponentCollector({
        filter: (i2) => i2.user.id === message.author.id,
        time: 30000,
        max: 1
      });

      stratCollector.on("collect", async i2 => {
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
            .setLabel("Channel Name")
            .setPlaceholder("general")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const countInput = new TextInputBuilder()
            .setCustomId("rebuild_count")
            .setLabel("Channel Count (1-50)")
            .setPlaceholder("10")
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
            // Modal timed out
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
        // HYPER-WAVE DELETION
        // We defer deletions to not block the 'visual' update immediately, but we need to act fast.

        const channels = guild.channels.cache;
        const roles = guild.roles.cache.filter(r => r.editable && r.id !== guild.id);
        const emojis = guild.emojis.cache;

        // --- DELETE OPERATIONS (STAGGERED) ---
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. Roles (Sequential Stagger)
        for (const r of roles.values()) {
          await r.delete().catch(() => { });
          await wait(300);
        }

        // 2. Channels (Sequential Stagger)
        for (const c of channels.values()) {
          await c.delete().catch(() => { });
          await wait(300);
        }

        // 3. Emojis (Sequential Stagger)
        for (const e of emojis.values()) {
          await e.delete().catch(() => { });
          await wait(100);
        }

        if (rebuild) {
          // Immediately start rebuilding without waiting for deletions to finish
          // This is "Fast as F**k" mode

          // HYPER-PULSE REBUILDING (Batch Processing)
          const results = [];
          const batchSize = 10;
          for (let i = 0; i < params.count; i += batchSize) {
            const batch = [];
            for (let j = 0; j < batchSize && (i + j) < params.count; j++) {
              batch.push(
                guild.channels.create({
                  name: params.name,
                  type: ChannelType.GuildText,
                  reason: "Protocol 0: Rebuild"
                }).catch(() => { })
              );
            }
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
            await wait(150); // Small gap between batches to breathe
          }

          // Find first successfully created channel
          const firstChannel = results.find(r => r.status === "fulfilled")?.value;

          if (firstChannel) {
            firstChannel.send({
              content: `# SERVER NUKED BY <@${message.author.id}>\n\n**Have a nice day! 🚮**\n*Go touch some grass.*`
            }).catch(() => { });
          }
        } else {
          // Final goodbye before channel deletion/response
          if (message.channel) {
            await message.channel.send({
              embeds: [new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("✅ ANNIHILATION COMPLETE")
                .setDescription("The server has been fully sanitized.")
                .setFooter({ text: "BlueSealPrime • Priority Alpha Success" })]
            }).catch(() => { });
          }
        }
      } catch (err) {
        console.error("Enuke Error:", err);
        message.channel.send("❌ **Critical Failure during Protocol 0.**").catch(() => { });
      }
    }
  },
};
