const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "edeleteserver",
    description: "⚠️ TERMINATE SERVER (God Mode Only)",
    aliases: ["delserver", "terminate"],
    async execute(message, args) {
        // 1. OWNER CHECK
        if (message.author.id !== BOT_OWNER_ID) return;

        // 2. GOD MODE CHECK
        if (!global.GOD_MODE) {
            return message.reply("⚠️ **GOD MODE REQUIRED:** This command is locked.");
        }

        // 3. CONFIRMATION
        const confirmEmbed = new EmbedBuilder()
            .setColor("#FF0000") // RED
            .setTitle("☢️ TERMINATION PROTOCOL INITIATED")
            .setDescription(
                `**WARNING:** You are about to **PERMANENTLY DELETE** this server.\n\n` +
                `> **Server:** ${message.guild.name}\n` +
                `> **Members:** ${message.guild.memberCount}\n` +
                `> **ID:** ${message.guild.id}\n\n` +
                `**THIS ACTION CANNOT BE UNDONE.**\n` +
                `Are you absolutely sure you want to proceed?`
            )
            .setFooter({ text: "BlueSealPrime • God Mode Execution" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_delete_server")
                .setLabel("CONFIRM TERMINATION")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("cancel_delete_server")
                .setLabel("ABORT")
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.channel.send({ embeds: [confirmEmbed], components: [row] });

        // 4. COLLECTOR
        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

        collector.on("collect", async i => {
            if (i.customId === "cancel_delete_server") {
                await i.update({ content: "🚫 **Termination Aborted.** Server is safe.", embeds: [], components: [] });
            } else if (i.customId === "confirm_delete_server") {
                try {
                    await i.update({ content: "💥 **TERMINATING SERVER...** Goodbye.", embeds: [], components: [] });

                    // THE DELETION
                    await message.guild.delete();

                    // Logic ends here as server is gone.
                } catch (err) {
                    console.error(err);
                    await i.followUp({ content: `❌ **ERROR:** Failed to delete server. (Am I the owner/Do I have permissions?)\n\`${err.message}\``, ephemeral: true });
                }
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) {
                msg.edit({ content: "⏳ **Timeout.** Termination protocol disengaged.", embeds: [], components: [] });
            }
        });
    }
};
