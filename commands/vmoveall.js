const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, V2_BLUE } = require("../config");

module.exports = {
    name: "vmoveall",
    description: "Move all members from one voice channel to another",
    usage: "!vmoveall <from_channel_id> <to_channel_id>",
    aliases: ["moveall", "massmove"],
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You do not have permission to move members.")] });
        }

        if (args.length < 2) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Usage:** `!vmoveall <FromChannelID> <ToChannelID>`")] });
        }

        const fromId = args[0].replace(/[<#>]/g, "");
        const toId = args[1].replace(/[<#>]/g, "");

        const fromChannel = message.guild.channels.cache.get(fromId);
        const toChannel = message.guild.channels.cache.get(toId);

        if (!fromChannel || fromChannel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ **Invalid Source Channel.** Please provide a valid Voice Channel ID.");
        }
        if (!toChannel || toChannel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ **Invalid Destination Channel.** Please provide a valid Voice Channel ID.");
        }

        if (fromChannel.members.size === 0) {
            return message.reply("⚠️ **Source Channel is empty.** No one to move.");
        }

        const count = fromChannel.members.size;
        let moved = 0;

        const V2 = require("../utils/v2Utils");
        const loadingMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔄 MASS VOICE TRANSFER", 3),
                V2.text(`Relocating **${count}** members...`)
            ], V2_BLUE)]
        });

        // Parallel Move
        await Promise.all(Array.from(fromChannel.members.values()).map(async (member) => {
            try {
                await member.voice.setChannel(toChannel, "Mass Move Protocol");
                moved++;
            } catch (err) { }
        }));

        const container = V2.container([
            V2.section([
                V2.heading("🔄 MASS VOICE TRANSFER", 2),
                V2.text(`Successfully relocated **${moved}/${count}** members.`)
            ], "https://cdn-icons-png.flaticon.com/512/3135/3135882.png"),
            V2.separator(),
            V2.heading("📂 ROUTING", 3),
            V2.text(`> **From:** ${fromChannel.name}\n> **To:** ${toChannel.name}`),
            V2.separator(),
            V2.text(`> **Authorized By:** ${message.author}`),
            V2.separator(),
            V2.text("*BlueSealPrime • Logistics Protocol*")
        ], V2_BLUE);

        await loadingMsg.edit({ content: null, flags: V2.flag, components: [container] });
    }
};
