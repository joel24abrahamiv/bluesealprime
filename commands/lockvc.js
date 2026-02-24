const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "lockvc",
    description: "Lock the voice channel you are currently in for @everyone",
    usage: "!lockvc [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["lvc"],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LOCKVC
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
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("lockvc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "lockvc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;
            const reason = args.join(" ") || "No reason provided";
            const V2 = require("../utils/v2Utils");

            // Permission Check (Owner Bypass)
            if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 You do not have permission to use this command.")] });
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 I do not have permission to manage channels.")] });
            }

            const channel = message.member.voice.channel;
            if (!channel) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("⚠️ You must be in a voice channel to lock it.")] });
            }

            try {
                // Lock channel for @everyone (Connect: false)
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    Connect: false
                }, { reason: `Locked by ${message.author.tag}: ${reason}` });

                const lockIcon = new AttachmentBuilder("./assets/lock.png");

                // Using global V2
                const container = V2.container([
                    V2.section([
                        V2.heading("🔒 VOICE CHANNEL LOCKDOWN", 2),
                        V2.text(`**Status:** \`LOCKED\`\n**Channel:** ${channel.name}\n**Target:** \`@everyone\`\n**Access:** \`Staff Only\``)
                    ], "attachment://lock.png"),
                    V2.separator(),
                    V2.heading("📂 DETAILS", 3),
                    V2.text(`> **Reason:** ${reason}\n> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Voice Security Protocol*")
                ], V2_BLUE);

                await message.channel.send({ content: null, flags: V2.flag, files: [lockIcon], components: [container] });

            } catch (err) {
                console.error(err);
                // Using global V2
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("❌ **Failed to lock the voice channel.**")], "#FF0000")]
                });
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "lockvc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] lockvc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "lockvc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("lockvc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`lockvc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_885
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_283
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_845
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_617
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_492
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_696
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_234
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_501
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_291
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_644
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_828
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_764
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_750
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_331
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_969
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_622
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_76
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_845
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_728
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_103
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_362
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_169
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_330
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_548
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_206
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_973
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_142
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_8
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_824
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_406
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_360
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_940
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_743
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_36
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_956
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_692
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_768
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_377
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_319
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_715
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_19
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_908
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_122
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_648
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_12
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_892
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_31
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_720
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_221
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_446
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_149
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_559
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_456
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_148
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_697
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_719
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_725
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_941
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_7
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_695
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_290
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_348
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_547
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_306
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_361
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_684
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_719
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_773
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_881
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_297
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_988
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_210
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_793
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_56
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_515
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_457
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_473
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_12
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_748
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_238
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_176
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_63
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_254
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_281
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_723
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_529
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_833
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_593
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_894
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_732
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_507
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_863
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_53
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_142
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_334
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_60
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_166
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_616
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_547
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LOCKVC_ID_37
     */

};