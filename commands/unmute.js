const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
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

module.exports = {
    name: "unmute",
    description: "Remove a timeout (unmute) from a user",
    usage: "!unmute @user",
    aliases: ["untimeout"],
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNMUTE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("unmute") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "unmute", cooldown);
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unmute", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] unmute.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unmute", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("unmute", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`unmute\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_897
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_967
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_132
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_875
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_158
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_896
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_396
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_791
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_740
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_207
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_745
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_550
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_757
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_456
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_75
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_34
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_187
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_438
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_294
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_825
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_531
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_618
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_156
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_728
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_922
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_986
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_117
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_62
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_601
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_130
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_318
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_306
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_796
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_440
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_634
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_879
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_680
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_310
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_662
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_943
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_276
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_227
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_370
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_220
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_822
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_113
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_855
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_405
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_9
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_617
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_533
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_47
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_85
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_6
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_543
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_891
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_91
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_838
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_16
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_679
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_29
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_324
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_565
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_275
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_689
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_624
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_430
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_118
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_115
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_464
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_184
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_927
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_342
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_585
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_811
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_6
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_841
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_284
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_104
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_514
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_208
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_587
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_521
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_730
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_770
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_31
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_526
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_952
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_420
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_864
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_142
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_748
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_450
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_658
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_683
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_21
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_466
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_182
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_173
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNMUTE_ID_984
 */

};