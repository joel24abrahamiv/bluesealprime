const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

// ── Builder Helpers ──
const sepLg = () => V2.separator().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => V2.separator().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (c) => new TextDisplayBuilder().setContent(c);
const h = (c, lvl = 2) => {
    const hashes = "#".repeat(lvl);
    return new TextDisplayBuilder().setContent(`${hashes} ${c}`);
};

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

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: MUTE
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const { PermissionsBitField } = require("discord.js");
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ 
                flags: V2.flag, 
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)] 
            }).catch(() => {});
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("mute") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "mute", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
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
                .addTextDisplayComponents(h("🔇 MUTE — USAGE", 2))
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
                    .addTextDisplayComponents(h("📋 SUSPENSION DETAILS", 3))
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
                    .addTextDisplayComponents(h("📜 INCIDENT LOG", 3))
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "mute", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] mute.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "mute", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("mute", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`mute\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | MUTE_ID_675
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | MUTE_ID_272
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | MUTE_ID_12
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | MUTE_ID_672
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | MUTE_ID_500
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | MUTE_ID_71
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | MUTE_ID_110
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | MUTE_ID_461
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | MUTE_ID_816
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | MUTE_ID_109
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | MUTE_ID_896
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | MUTE_ID_28
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | MUTE_ID_830
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | MUTE_ID_215
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | MUTE_ID_328
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | MUTE_ID_498
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | MUTE_ID_955
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | MUTE_ID_735
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | MUTE_ID_959
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | MUTE_ID_164
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | MUTE_ID_264
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | MUTE_ID_613
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | MUTE_ID_460
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | MUTE_ID_538
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | MUTE_ID_564
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | MUTE_ID_901
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | MUTE_ID_502
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | MUTE_ID_330
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | MUTE_ID_694
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | MUTE_ID_708
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | MUTE_ID_761
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | MUTE_ID_834
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | MUTE_ID_478
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | MUTE_ID_741
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | MUTE_ID_54
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | MUTE_ID_375
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | MUTE_ID_325
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | MUTE_ID_387
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | MUTE_ID_907
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | MUTE_ID_532
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | MUTE_ID_127
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | MUTE_ID_207
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | MUTE_ID_251
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | MUTE_ID_796
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | MUTE_ID_820
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | MUTE_ID_67
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | MUTE_ID_902
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | MUTE_ID_866
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | MUTE_ID_978
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | MUTE_ID_699
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | MUTE_ID_788
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | MUTE_ID_530
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | MUTE_ID_332
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | MUTE_ID_656
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | MUTE_ID_526
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | MUTE_ID_337
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | MUTE_ID_288
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | MUTE_ID_900
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | MUTE_ID_812
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | MUTE_ID_751
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | MUTE_ID_913
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | MUTE_ID_267
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | MUTE_ID_305
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | MUTE_ID_561
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | MUTE_ID_681
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | MUTE_ID_422
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | MUTE_ID_636
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | MUTE_ID_235
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | MUTE_ID_21
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | MUTE_ID_871
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | MUTE_ID_682
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | MUTE_ID_407
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | MUTE_ID_605
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | MUTE_ID_709
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | MUTE_ID_993
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | MUTE_ID_663
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | MUTE_ID_620
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | MUTE_ID_267
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | MUTE_ID_106
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | MUTE_ID_69
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | MUTE_ID_260
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | MUTE_ID_710
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | MUTE_ID_57
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | MUTE_ID_240
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | MUTE_ID_775
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | MUTE_ID_746
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | MUTE_ID_17
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | MUTE_ID_644
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | MUTE_ID_166
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | MUTE_ID_489
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | MUTE_ID_22
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | MUTE_ID_811
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | MUTE_ID_621
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | MUTE_ID_927
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | MUTE_ID_363
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | MUTE_ID_59
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | MUTE_ID_32
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | MUTE_ID_47
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | MUTE_ID_461
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | MUTE_ID_794
 */

};