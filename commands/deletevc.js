const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deletevc",
    description: "Delete a voice channel by mention, name, or ID.",
    usage: "!deletevc [#vc | name | id]",
    aliases: ["dvc", "delvc"],
    permissions: [PermissionsBitField.Flags.ManageChannels],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("🚫 ACCESS DENIED", 2), V2.text("> ManageChannels permission required.")], botAvatar)], V2_RED)] });
        }

        // Fetch fresh channel list
        await message.guild.channels.fetch().catch(() => { });

        let channel = null;

        if (args.length > 0) {
            // 1. Discord mention: <#channelId>
            channel = message.mentions.channels.first() || null;

            // 2. By raw ID
            if (!channel) channel = message.guild.channels.cache.get(args[0]) || null;

            // 3. By name (exact, space or dash)
            if (!channel) {
                const nameQuery = args.join(" ").toLowerCase();
                const dashQuery = args.join("-").toLowerCase();
                channel = message.guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildVoice && (
                        c.name.toLowerCase() === nameQuery ||
                        c.name.toLowerCase() === dashQuery
                    )
                ) || null;
            }

            if (!channel) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("❌ VOICE CHANNEL NOT FOUND", 2),
                            V2.text(`> No voice channel matched \`${args.join(" ")}\`\n> Use \`#mention\`, exact name, or channel ID.`)
                        ], botAvatar)
                    ], V2_RED)]
                });
            }
        } else {
            // No args = use VC the author is in
            channel = message.member.voice.channel;
        }

        if (!channel) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("⚠️ NO VC FOUND", 2), V2.text("> Join a voice channel or provide a name/ID/mention.")], botAvatar)], V2_RED)] });
        }

        if (channel.type !== ChannelType.GuildVoice) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("❌ NOT A VOICE CHANNEL", 2), V2.text(`> \`${channel.name}\` is not a voice channel.`)], botAvatar)], V2_RED)] });
        }

        if (!channel.deletable) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("❌ CANNOT DELETE", 2), V2.text("> Missing permissions or hierarchy issue.")], botAvatar)], V2_RED)] });
        }

        const channelName = channel.name;
        try {
            await channel.delete(`Deleted by ${message.author.tag}`);
            return message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🗑️ VOICE CHANNEL DISSOLVED", 2),
                        V2.text(`**Purged:** \`${channelName}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                ], V2_RED)]
            });
        } catch (e) {
            console.error("[deletevc] Error:", e);
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("❌ FAILED", 2), V2.text("> Could not delete voice channel.")], botAvatar)], V2_RED)] });
        }
    }
};
