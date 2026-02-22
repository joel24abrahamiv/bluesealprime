const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createch",
    description: "Create a new text or voice channel.",
    usage: "!createch <name> [text/voice]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["createchannel", "cc"],

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);
        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING ARGUMENTS", 3), V2.text("> Usage: `!createch <name> [text/voice]`")], V2_RED)]
            });
        }

        const name = args[0];
        const typeArg = args[1]?.toLowerCase() || "text";
        const type = (typeArg === "voice" || typeArg === "vc") ? ChannelType.GuildVoice : ChannelType.GuildText;
        const typeLabel = type === ChannelType.GuildVoice ? "🔊 Voice Channel" : "💬 Text Channel";

        try {
            const channel = await message.guild.channels.create({
                name,
                type,
                reason: `Created by ${message.author.tag}`
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("✅ CHANNEL DEPLOYED", 2),
                        V2.text(`**${typeLabel}** \`${channel.name}\` is now live.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Type:** ${typeLabel}\n> **ID:** \`${channel.id}\`\n> **Created by:** ${message.author}`),
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Failed to create channel.** Check my permissions.")], V2_RED)]
            });
        }
    }
};
