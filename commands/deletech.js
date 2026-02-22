const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deletech",
    description: "Delete a text channel by mention, name, or ID.",
    usage: "!deletech [#channel | name | id]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["removech", "delch", "dc"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("🚫 ACCESS DENIED", 2), V2.text("> ManageChannels permission required.")], botAvatar)], V2_RED)] });
        }

        // Fetch fresh channel list
        await message.guild.channels.fetch().catch(() => { });

        let target = null;

        if (args.length > 0) {
            // 1. Discord mention: <#channelId>
            target = message.mentions.channels.first() || null;

            // 2. By raw ID
            if (!target) target = message.guild.channels.cache.get(args[0]) || null;

            // 3. By name (exact, space-joined or dash-joined)
            if (!target) {
                const nameQuery = args.join(" ").toLowerCase();
                const dashQuery = args.join("-").toLowerCase();
                target = message.guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildText && (
                        c.name.toLowerCase() === nameQuery ||
                        c.name.toLowerCase() === dashQuery
                    )
                ) || null;
            }

            if (!target) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("❌ CHANNEL NOT FOUND", 2),
                            V2.text(`> No text channel matched \`${args.join(" ")}\`\n> Use \`#mention\`, exact name, or channel ID.`)
                        ], botAvatar)
                    ], V2_RED)]
                });
            }
        } else {
            // No args = target current channel
            target = message.channel;
        }

        if (!target.deletable) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("❌ CANNOT DELETE", 2), V2.text("> I'm missing permissions or this is a system channel.")], botAvatar)], V2_RED)] });
        }

        const isCurrent = target.id === message.channel.id;
        const name = target.name;

        try {
            if (isCurrent) {
                await message.channel.send({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🗑️ SELF-DESTRUCT INITIATED", 2),
                            V2.text(`> **Channel:** \`${name}\` is being deleted...\n> **By:** ${message.author}`)
                        ], botAvatar)
                    ], V2_RED)]
                });
                await new Promise(r => setTimeout(r, 800));
                await target.delete(`Deleted by ${message.author.tag}`);
            } else {
                await target.delete(`Deleted by ${message.author.tag}`);
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🗑️ CHANNEL DISSOLVED", 2),
                            V2.text(`**Purged:** \`${name}\``)
                        ], botAvatar),
                        V2.separator(),
                        V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                    ], V2_RED)]
                });
            }
        } catch (err) {
            console.error("[deletech] Error:", err);
            return message.channel?.send({ flags: V2.flag, components: [V2.container([V2.section([V2.text("❌ Failed to delete channel. Check my permissions.")], botAvatar)], V2_RED)] })?.catch(() => { });
        }
    }
};
