const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, EMBED_COLOR } = require("../config");

module.exports = {
    name: "rebuild",
    description: "High-speed custom channel reconstruction.",
    usage: "!rebuild <name> <count>",
    aliases: ["rb", "masscreate"],
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner) return;

        let channelName = args[0];
        let count = parseInt(args[1]);

        // Interactive fallback if args are missing
        if (!channelName || isNaN(count)) {
            const promptEmbed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("🏗️ REBUILD PROTOCOL")
                .setDescription("Please provide parameters for the reconstruction wave.\n\n**Format:** `!rebuild <name> <count>`\n*Example: `!rebuild nizz-wizz 50`*")
                .setFooter({ text: "Max recommended: 50 per wave for API stability." });

            return message.reply({ embeds: [promptEmbed] });
        }

        if (count > 100) return message.reply("⚠️ **Safety Limit:** Maximum 100 channels per wave to prevent global rate-limits.");

        const statusMsg = await message.channel.send(`🚀 **Initializing Reconstruction Wave...** Creating \`${count}\` channels named \`${channelName}\`.`);

        try {
            const startTime = Date.now();
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const batchSize = 10;

            for (let i = 0; i < count; i += batchSize) {
                const batch = [];
                for (let j = 0; j < batchSize && (i + j) < count; j++) {
                    batch.push(
                        message.guild.channels.create({
                            name: channelName,
                            type: ChannelType.GuildText,
                            reason: "Turbo Rebuild"
                        }).catch(() => { })
                    );
                }
                await Promise.all(batch);
                if (i + batchSize < count) await wait(150); // Stagger batches
            }

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            const successEmbed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("✅ RECONSTRUCTION COMPLETE")
                .setDescription(`Successfully deployed \`${count}\` sectors.`)
                .addFields(
                    { name: "🏷️ Identifier", value: `\`${channelName}\``, inline: true },
                    { name: "⚡ Velocity", value: `\`${duration}s\``, inline: true }
                )
                .setTimestamp();

            await statusMsg.edit({ content: null, embeds: [successEmbed] });

        } catch (err) {
            console.error(err);
            statusMsg.edit("❌ **Critical Failure during reconstruction wave.**");
        }
    },
};
