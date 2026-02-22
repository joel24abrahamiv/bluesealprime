const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    SeparatorBuilder, SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder, HeadingBuilder, HeadingLevel
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

// ── Builder Helpers ──
const sepLg = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (c) => new TextDisplayBuilder().setContent(c);
const h = (c, lvl = 2) => new HeadingBuilder().setText(c).setLevel(lvl);

function parseDuration(input) {
    const match = input?.match(/^(\d+)\s*(s|m|h|d)?$/i);
    if (!match) return null;
    const v = parseInt(match[1]);
    const u = (match[2] || "m").toLowerCase();
    return v * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[u];
}

function formatDuration(ms) {
    const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000),
        m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(" ") || "0s";
}

module.exports = {
    name: "mute",
    description: "Timeout (mute) a user for a specified duration",
    usage: "!mute @user [duration] [reason]",
    aliases: ["tempmute"],
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
                .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addHeadingComponents(h("🔇 MUTE — USAGE", 2))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(
                    "> `!mute @user [duration] [reason]`\n" +
                    "> **Duration:** `10s` `5m` `2h` `1d`\n" +
                    "> *Default: 1h if no duration given*"
                ))
                .addSeparatorComponents(sepLg());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        // ── IMMUNITY ──
        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    h("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                    txt(`Did you seriously just try to mute ${target.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?\n\n> You have no power here, ${message.author}. Stand down.`)
                )
                .setThumbnailAccessory(target.user.displayAvatarURL({ dynamic: true, size: 512 }));

            const c = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addSeparatorComponents(sepLg())
                .addSectionComponents(section)
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("*BlueSealPrime • Sovereign Protection*"));
            return message.reply({ flags: V2.flag, components: [c] });
        }

        // ── HIERARCHY ──
        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ Cannot mute a user with an **equal or higher role** than yours."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Hierarchy Error:** I cannot mute this user — they outrank me."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        // ── DURATION ──
        const durationInput = args[1] || "1h";
        const durationMs = parseDuration(durationInput);
        if (!durationMs) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Invalid duration.** Use formats like `10m`, `2h`, `1d`."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }
        if (durationMs > 28 * 86400000) {
            const c = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Maximum timeout duration is 28 days.**"))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [c] });
        }

        const reason = args.slice(2).join(" ") || "No reason provided";
        const durationFmt = formatDuration(durationMs);
        const expiresAt = Math.floor((Date.now() + durationMs) / 1000);

        // ── CONFIRMATION CARD ──
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("mute_yes").setLabel("🔇  Confirm Mute").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("mute_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
        );

        const confirmSection = new SectionBuilder()
            .addTextDisplayComponents(
                h("🔇 TEMPORARY SILENCE", 2),
                txt(`Mute **${target.user.tag}** for \`${durationFmt}\`?\n\n> **Reason:** ${reason}`)
            )
            .setThumbnailAccessory(target.user.displayAvatarURL({ forceStatic: true, extension: "png" }));

        const confirmContainer = new ContainerBuilder()
            .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
            .addSeparatorComponents(sepLg())
            .addSectionComponents(confirmSection)
            .addSeparatorComponents(sepSm())
            .addActionRowComponents(confirmRow)
            .addSeparatorComponents(sepLg());

        const confirmMsg = await message.reply({ flags: V2.flag, components: [confirmContainer] });

        const collector = confirmMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 20000,
            max: 1
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.customId === "mute_no") {
                return confirmMsg.delete().catch(() => { });
            }

            try {
                // ── DM the target ──
                const dmSection = new SectionBuilder()
                    .addTextDisplayComponents(
                        h("🔇 YOU HAVE BEEN MUTED", 2),
                        txt(`You were muted in **${message.guild.name}**.`)
                    )
                    .setThumbnailAccessory(message.client.user.displayAvatarURL({ forceStatic: true, extension: "png" }));

                const dmContainer = new ContainerBuilder()
                    .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                    .addSeparatorComponents(sepLg())
                    .addSectionComponents(dmSection)
                    .addSeparatorComponents(sepLg())
                    .addHeadingComponents(h("📋 SUSPENSION DETAILS", 3))
                    .addTextDisplayComponents(txt(
                        `> ⏱️ **Duration:** ${durationFmt}\n` +
                        `> 📝 **Reason:** ${reason}\n` +
                        `> 👮 **Moderator:** ${message.author.tag}\n` +
                        `> 🔓 **Expires:** <t:${expiresAt}:R>`
                    ))
                    .addSeparatorComponents(sepLg());

                await target.send({ flags: V2.flag, components: [dmContainer] }).catch(() => { });

                // ── Apply the mute ──
                await target.timeout(durationMs, reason);

                // ── VERDICT CARD ──
                const verdictSection = new SectionBuilder()
                    .addTextDisplayComponents(
                        h("🔇 MUTE ACTIVE", 1),
                        txt(`**${target.user.tag}** has been silenced.`)
                    )
                    .setThumbnailAccessory(target.user.displayAvatarURL({ forceStatic: true, extension: "png" }));

                const verdictContainer = new ContainerBuilder()
                    .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                    .addSeparatorComponents(sepLg())
                    .addSectionComponents(verdictSection)
                    .addSeparatorComponents(sepLg())
                    .addHeadingComponents(h("📜 INCIDENT LOG", 3))
                    .addTextDisplayComponents(txt(
                        `> ⏱️ **Duration:** \`${durationFmt}\`\n` +
                        `> 📝 **Reason:** ${reason}\n` +
                        `> 👮 **Enforcer:** ${message.author}\n` +
                        `> 🔓 **Expires:** <t:${expiresAt}:R>`
                    ))
                    .addSeparatorComponents(sepLg())
                    .addTextDisplayComponents(txt("*BlueSealPrime • Moderation System*"));

                await message.channel.send({ flags: V2.flag, components: [verdictContainer] });

            } catch (err) {
                console.error(err);
                await message.channel.send({
                    flags: V2.flag, components: [
                        new ContainerBuilder()
                            .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                            .addSeparatorComponents(sepSm())
                            .addTextDisplayComponents(txt("❌ **Execution Failed:** Check bot permissions and role hierarchy."))
                            .addSeparatorComponents(sepSm())
                    ]
                });
            }

            confirmMsg.delete().catch(() => { });
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") confirmMsg.delete().catch(() => { });
        });
    }
};
