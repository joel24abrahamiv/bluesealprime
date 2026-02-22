const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "vckick",
    description: "Kick a member from a voice channel.",
    usage: "!vckick <@user | userId>",
    aliases: ["vkick", "kickvc", "dkick"],
    permissions: [PermissionsBitField.Flags.MoveMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        // Permission check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🚫 ACCESS DENIED", 2), V2.text("> MoveMembers permission required.")], botAvatar)
                ], V2_RED)]
            });
        }

        // Resolve target member
        let target = message.mentions.members.first();
        if (!target && args[0]) {
            target = message.guild.members.cache.get(args[0]) ||
                await message.guild.members.fetch(args[0]).catch(() => null);
        }

        if (!target) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("⚠️ MISSING TARGET", 2),
                        V2.text("> **Usage:** `!vckick <@user | userId>`")
                    ], botAvatar)
                ], V2_RED)]
            });
        }

        // Check target is in a VC
        if (!target.voice.channel) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("⚠️ NOT IN A VC", 2),
                        V2.text(`> **${target.user.username}** is not in any voice channel.`)
                    ], botAvatar)
                ], V2_RED)]
            });
        }

        // Cannot kick bot owner
        if (target.id === BOT_OWNER_ID) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("🛡️ PROTECTED", 2), V2.text("> You cannot kick the Bot Owner from a VC.")], botAvatar)
                ], V2_RED)]
            });
        }

        const vcName = target.voice.channel.name;
        try {
            // Disconnect = set voice channel to null
            await target.voice.disconnect(`VC Kicked by ${message.author.tag}`);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🚪 EJECTED FROM VC", 2),
                        V2.text(`**User:** ${target.user}\n**From:** \`${vcName}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error("[vckick] Error:", err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([V2.heading("❌ FAILED", 2), V2.text(`> Could not kick **${target.user.username}**. Check my MoveMembers permission.`)], botAvatar)
                ], V2_RED)]
            });
        }
    }
};
