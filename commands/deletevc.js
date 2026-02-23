const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deletevc",
    description: "Delete a voice channel by mention, name, or ID.",
    usage: "!deletevc [#vc | name | id]",
    aliases: ["dvc", "delvc"],
    permissions: [PermissionsBitField.Flags.ManageChannels],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: DELETEVC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("deletevc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "deletevc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deletevc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] deletevc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deletevc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("deletevc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`deletevc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_473
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_952
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_99
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_726
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_745
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_888
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_845
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_427
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_775
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_757
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_880
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_814
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_516
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_89
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_330
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_736
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_930
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_364
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_459
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_794
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_512
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_446
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_741
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_712
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_259
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_960
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_552
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_331
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_951
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_390
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_560
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_725
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_483
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_54
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_418
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_4
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_645
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_923
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_802
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_958
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_625
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_4
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_793
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_446
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_933
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_649
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_965
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_18
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_278
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_191
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_374
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_872
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_982
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_98
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_923
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_205
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_527
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_249
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_646
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_638
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_790
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_554
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_571
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_199
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_618
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_112
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_443
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_373
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_980
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_842
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_311
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_698
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_268
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_49
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_471
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_566
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_285
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_988
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_917
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_726
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_728
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_768
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_977
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_704
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_202
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_323
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_224
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_88
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_168
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_430
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_591
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_973
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_948
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_997
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_772
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_129
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_899
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_853
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_329
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | DELETEVC_ID_804
 */

};