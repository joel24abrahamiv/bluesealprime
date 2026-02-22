const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "renamech",
    description: "Rename a text channel by mention, ID, or name. Defaults to current channel.",
    usage: "!renamech [#channel | ID | name] <new_name>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["rch"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("🚫 ACCESS DENIED", 2), V2.text("> ManageChannels permission required.")], botAvatar)], V2_RED)] });
        }

        if (args.length < 1) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ MISSING NAME", 2), V2.text("> **Usage:** `!renamech [#channel] <new_name>`")], botAvatar)], V2_RED)]
            });
        }

        // Fresh fetch
        await message.guild.channels.fetch().catch(() => { });

        let target = null;
        let newName = "";

        // Attempt to find a target channel in args[0]
        const firstArg = args[0];
        const isMention = message.mentions.channels.first();
        const isID = message.guild.channels.cache.get(firstArg);
        const isNameMatch = message.guild.channels.cache.find(c => c.type === ChannelType.GuildText && (c.name.toLowerCase() === firstArg.replace('#', '').toLowerCase() || c.name.toLowerCase() === firstArg.toLowerCase()));

        if (isMention || isID || (isNameMatch && args.length > 1)) {
            target = isMention || isID || isNameMatch;
            newName = args.slice(1).join("-").toLowerCase();
        } else {
            // Default to current channel
            target = message.channel;
            newName = args.join("-").toLowerCase();
        }

        if (!target || target.type !== ChannelType.GuildText) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ INVALID CHANNEL", 2), V2.text("> Target must be a text channel.")], botAvatar)], V2_RED)]
            });
        }

        // Sanitization
        newName = newName.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        if (!newName) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ NAME REQUIRED", 2), V2.text("> Please provide a valid alphanumeric name.")], botAvatar)], V2_RED)]
            });
        }

        const oldName = target.name;

        try {
            await target.setName(newName);
            return message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🏷️ CHANNEL RENAMED", 2),
                        V2.text(`**Path:** ${target}\n**Log:** \`${oldName}\` ➡️ \`${newName}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Action by:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ RENAME FAILED", 2), V2.text("> Check my permissions or rate limits (only 2 renames per 10 mins).")], botAvatar)], V2_RED)]
            });
        }
    }
};
