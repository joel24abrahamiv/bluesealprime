const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "emassch",
    description: "Mass Channel Management (Add/Remove)",
    aliases: ["emc"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const sub = args[0]?.toLowerCase();

        if (!sub || !["add", "remove"].includes(sub)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:**\n`!emassch add <amount> <name>`\n`!emassch remove`")]
            });
        }

        // ───── ADD COMMAND ─────
        if (sub === "add") {
            const amount = parseInt(args[1]);
            const name = args.slice(2).join("-");

            if (isNaN(amount) || amount < 1 || amount > 50 || !name) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Invalid Args:** Provide amount (1-50) and name.")]
                });
            }

            const statusMsg = await message.reply({
                embeds: [new EmbedBuilder().setColor("#0099FF").setDescription(`🔄 **Creating ${amount} channels named \`${name}\`...**`)]
            });

            let created = 0;
            for (let i = 0; i < amount; i++) {
                try {
                    await message.guild.channels.create({
                        name: name,
                        type: ChannelType.GuildText,
                        reason: `Mass Create by Owner ${message.author.tag}`
                    });
                    created++;
                } catch (e) {
                    console.error(e);
                }
            }

            return statusMsg.edit({
                embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("✅ MASS CREATE COMPLETE").setDescription(`Created **${created}** channels.`)]
            });
        }

        // ───── REMOVE COMMAND ─────
        if (sub === "remove") {
            // Fetch last 25 text channels to show in menu
            const channels = message.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText)
                .sort((a, b) => b.createdTimestamp - a.createdTimestamp) // Newest first
                .first(25);

            if (channels.length === 0) return message.reply("⚠️ No text channels found.");

            const options = channels.map(c => ({
                label: c.name.substring(0, 25),
                description: `ID: ${c.id}`,
                value: c.id,
                emoji: "🗑️"
            }));

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("emassch_del_select")
                    .setPlaceholder("Select channels to DELETE")
                    .setMinValues(1)
                    .setMaxValues(Math.min(options.length, 25))
                    .addOptions(options)
            );

            const msg = await message.reply({
                content: "**🗑️ SELECT CHANNELS TO DELETE:**",
                components: [row]
            });

            const filter = i => i.user.id === message.author.id && i.customId === "emassch_del_select";
            const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });

            collector.on("collect", async i => {
                await i.deferUpdate();
                const selectedIds = i.values;

                await i.editReply({ content: `🔄 **Deleting ${selectedIds.length} channels...**`, components: [] });

                let deleted = 0;
                for (const id of selectedIds) {
                    const ch = message.guild.channels.cache.get(id);
                    if (ch) {
                        try {
                            await ch.delete("Mass Delete by Owner");
                            deleted++;
                        } catch (e) { }
                    }
                }

                await i.editReply({
                    content: null,
                    embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setTitle("🗑️ CHANNELS DELETED").setDescription(`Successfully deleted **${deleted}** channels.`)]
                });
            });
        }
    }
};
