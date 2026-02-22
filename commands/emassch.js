const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "emassch",
    description: "Mass Channel Management (Add/Remove)",
    aliases: ["emc"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const sub = args[0]?.toLowerCase();

        if (!sub || !["add", "remove"].includes(sub)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Usage:**\n`!emassch add <amount> <name>`\n`!emassch remove`")], V2_RED)]
            });
        }

        // ───── ADD COMMAND ─────
        if (sub === "add") {
            const amount = parseInt(args[1]);
            const name = args.slice(2).join("-");

            if (isNaN(amount) || amount < 1 || amount > 50 || !name) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("⚠️ **Invalid Args:** Provide amount (1-50) and name.")], V2_RED)]
                });
            }

            const statusContainer = V2.container([V2.text(`🔄 **Constructing ${amount} nodes...**\n**Identifier:** \`${name}\``)], V2_BLUE);
            const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [statusContainer] });

            let created = 0;
            const promises = [];
            for (let i = 0; i < amount; i++) {
                promises.push(
                    message.guild.channels.create({
                        name: name,
                        type: ChannelType.GuildText,
                        reason: `Mass Create by Owner ${message.author.tag}`
                    }).catch(e => console.error(e))
                );
            }
            await Promise.all(promises);
            created = amount;

            const finalContainer = V2.container([
                V2.section([
                    V2.heading("✅ DEPLOYMENT SUCCESSFUL", 2),
                    V2.text(`Created **${created}** network nodes with identifier \`${name}\`.`)
                ], "https://cdn-icons-png.flaticon.com/512/190/190411.png")
            ], V2_BLUE);

            return statusMsg.edit({ content: null, components: [finalContainer] });
        }

        // ───── REMOVE COMMAND ─────
        if (sub === "remove") {
            const channels = message.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText)
                .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                .first(25);

            if (channels.length === 0) return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("⚠️ No text channels detected.")], V2_RED)] });

            const options = channels.map(c => ({
                label: c.name.substring(0, 25),
                description: `ID: ${c.id}`,
                value: c.id,
                emoji: "🗑️"
            }));

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("emassch_del_select")
                    .setPlaceholder("Select channels to DEPLOY TERMINATION")
                    .setMinValues(1)
                    .setMaxValues(Math.min(options.length, 25))
                    .addOptions(options)
            );

            const selectContainer = V2.container([
                V2.section([
                    V2.heading("🗑️ TERMINATION INTERFACE", 2),
                    V2.text("Select the network shards to permanently disconnect.")
                ], "https://cdn-icons-png.flaticon.com/512/3662/3662817.png")
            ], V2_RED);

            const msg = await message.reply({
                content: null,
                flags: V2.flag,
                components: [selectContainer, row]
            });

            const filter = i => i.user.id === message.author.id && i.customId === "emassch_del_select";
            const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });

            collector.on("collect", async i => {
                await i.deferUpdate();
                const selectedIds = i.values;

                const delStatus = V2.container([V2.text(`🔄 **Synchronizing termination for ${selectedIds.length} shards...**`)], V2_RED);
                await i.editReply({ content: null, components: [delStatus] });

                const deletePromises = selectedIds.map(id => {
                    const ch = message.guild.channels.cache.get(id);
                    if (ch) return ch.delete("Mass Delete by Owner").catch(() => { });
                });
                await Promise.all(deletePromises);

                const finalDel = V2.container([
                    V2.section([
                        V2.heading("🗑️ TERMINATION COMPLETE", 2),
                        V2.text(`Successfully disconnected **${selectedIds.length}** shards from the node.`)
                    ], "https://cdn-icons-png.flaticon.com/512/190/190411.png")
                ], V2_RED);

                await i.editReply({ content: null, components: [finalDel] });
            });
        }
    }
};
