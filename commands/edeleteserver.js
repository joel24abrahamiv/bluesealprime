const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "edeleteserver",
    description: "⚠️ TERMINATE SERVER (God Mode Only)",
    aliases: ["delserver", "terminate"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        if (!global.GOD_MODE) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **GOD MODE REQUIRED:** This destructive protocol is locked.")], V2_RED)]
            });
        }

        const confirmContainer = V2.container([
            V2.section([
                V2.heading("☢️ TERMINATION PROTOCOL INITIATED", 2),
                V2.text(
                    `**WARNING:** Inevitable destruction detected for this node.\n\n` +
                    `> **Node:** ${message.guild.name}\n` +
                    `> **Entities:** ${message.guild.memberCount}\n` +
                    `> **Shard ID:** ${message.guild.id}\n\n` +
                    `**THIS ACTION CANNOT BE REVERSED.**\n` +
                    `Confirm the final sanitize command.`
                )
            ], "https://cdn-icons-png.flaticon.com/512/564/564619.png"),
            V2.separator(),
            V2.text("*BlueSealPrime • Final Sanitize Request*")
        ], V2_RED);

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

        const msg = await message.channel.send({ content: null, components: [confirmContainer, row] });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

        collector.on("collect", async i => {
            if (i.customId === "cancel_delete_server") {
                await i.update({
                    content: null,
                    components: [V2.container([V2.text("🚫 **Termination Aborted.** Node remains operational.")], V2_BLUE)]
                });
            } else if (i.customId === "confirm_delete_server") {
                try {
                    await i.update({
                        content: null,
                        components: [V2.container([V2.text("💥 **TERMINATING NODE...** Synchronizing extinction.")], V2_RED)]
                    });

                    await message.guild.delete();
                } catch (err) {
                    console.error(err);
                    await i.followUp({
                        content: null,
                        flags: V2.flag,
                        components: [V2.container([V2.text(`❌ **FAULT:** Destruction failed. \`${err.message}\``)], V2_RED)]
                    });
                }
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) {
                msg.edit({
                    content: null,
                    components: [V2.container([V2.text("⏳ **Timeout.** Termination protocol disengaged.")], V2_BLUE)]
                });
            }
        });
    }
};
