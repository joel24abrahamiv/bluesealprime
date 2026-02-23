const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
    SeparatorBuilder, SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

// ── Builder Helpers ──
const sepLg = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (c) => new TextDisplayBuilder().setContent(c);
const h = (c, lvl = 2) => {
    const hashes = "#".repeat(lvl);
    return new TextDisplayBuilder().setContent(`${hashes} ${c}`);
};

module.exports = {
    name: "unmute",
    description: "Remove a timeout (unmute) from a user",
    usage: "!unmute @user",
    aliases: ["untimeout"],
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("🚫 **Access Denied.** You need `Moderate Members` permission."))
                .addSeparatorComponents(sepLg());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("⚠️ **User not found.** Usage: `!unmute @user`"))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        // ── MODERATABLE CHECK ──
        if (!target.moderatable) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ I cannot remove the mute from this user — they outrank me."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        // ── CHECK IF ACTUALLY MUTED ──
        if (!target.communicationDisabledUntil || new Date(target.communicationDisabledUntil) < new Date()) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(`⚠️ **${target.user.tag}** is not currently muted.`))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        try {
            await target.timeout(null, `Unmuted by ${message.author.tag}`);

            // ── DM the user ──
            const dmSection = new SectionBuilder()
                .addTextDisplayComponents(
                    h("🔊 YOUR MUTE HAS BEEN REMOVED", 2),
                    txt(`Your timeout in **${message.guild.name}** has been lifted.\nYou may now communicate freely.`)
                )
                .setThumbnailAccessory(message.client.user.displayAvatarURL({ forceStatic: true, extension: "png" }));

            const dmContainer = new ContainerBuilder()
                .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addSectionComponents(dmSection)
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt(`> 👮 **Released by:** ${message.author.tag}\n> 🕐 **At:** <t:${Math.floor(Date.now() / 1000)}:f>`))
                .addSeparatorComponents(sepLg());

            await target.send({ flags: V2.flag, components: [dmContainer] }).catch(() => { });

            // ── SUCCESS CARD ──
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    h("🔊 MUTE REMOVED", 1),
                    txt(`**${target.user.tag}** has been released from silence.`)
                )
                .setThumbnailAccessory(target.user.displayAvatarURL({ forceStatic: true, extension: "png" }));

            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addSectionComponents(section)
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(h("[ RELEASE LOG ]", 3))
                .addTextDisplayComponents(txt(
                    `> 👮 **Released by:** ${message.author.tag}\n` +
                    `> 🕐 **At:** <t:${Math.floor(Date.now() / 1000)}:f>`
                ))
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("*BlueSealPrime • Moderation System*"));

            return message.reply({ flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Failed to remove mute.** Check my role hierarchy."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }
    }
};
