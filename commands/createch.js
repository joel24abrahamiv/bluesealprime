const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { EMBED_COLOR, SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "createch",
    description: "Create a new text or voice channel.",
    usage: "!createch <name> [text/voice]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["createchannel", "cc"],

    async execute(message, args) {
        if (!args[0]) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:** `!createch <name> [text/voice]`")]
            });
        }

        const name = args[0];
        const typeArg = args[1]?.toLowerCase() || "text";
        let type = ChannelType.GuildText;

        if (typeArg === "voice" || typeArg === "vc") type = ChannelType.GuildVoice;

        try {
            const channel = await message.guild.channels.create({
                name: name,
                type: type,
                reason: `Created by ${message.author.tag}`
            });

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("✅ Channel Created")
                .setDescription(`Successfully created **${channel}** (ID: \`${channel.id}\`)`)
                .addFields(
                    { name: "📁 Type", value: typeArg === "voice" ? "Voice Channel" : "Text Channel", inline: true },
                    { name: "👤 Creator", value: `${message.author}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ **Error:** Failed to create channel.")]
            });
        }
    }
};
