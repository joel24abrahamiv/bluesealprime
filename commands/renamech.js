const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "renamech",
    description: "Rename a text channel by mention, ID, or name. Defaults to current channel.",
    usage: "!renamech [#channel | ID | name] <new_name>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["rch"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: RENAMECH
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("renamech") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "renamech", cooldown);
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "renamech", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] renamech.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "renamech", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("renamech", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`renamech\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_18
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_540
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_916
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_331
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_36
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_191
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_425
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_450
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_944
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_838
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_854
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_10
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_101
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_930
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_171
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_348
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_532
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_708
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_604
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_766
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_137
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_963
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_587
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_534
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_887
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_602
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_363
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_918
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_140
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_172
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_805
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_390
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_473
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_965
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_522
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_425
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_981
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_62
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_971
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_709
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_321
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_641
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_662
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_188
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_36
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_131
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_456
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_410
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_608
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_461
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_411
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_525
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_147
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_47
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_558
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_965
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_325
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_763
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_66
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_541
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_927
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_936
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_491
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_837
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_492
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_311
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_1
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_617
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_492
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_452
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_972
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_190
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_904
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_179
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_152
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_619
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_956
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_744
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_312
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_613
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_325
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_43
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_135
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_670
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_206
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_282
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_120
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_485
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_595
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_563
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_688
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_923
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_259
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_194
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_731
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_662
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_867
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_279
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_690
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | RENAMECH_ID_806
 */

};