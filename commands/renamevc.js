const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "renamevc",
    description: "Rename a voice channel by mention, ID, or name. Defaults to your current VC.",
    usage: "!renamevc [#vc | ID | name] <new_name>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["rvc"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: RENAMEVC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("renamevc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "renamevc", cooldown);
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
                components: [V2.container([V2.section([V2.heading("⚠️ MISSING NAME", 2), V2.text("> **Usage:** `!renamevc <new_name>`")], botAvatar)], V2_RED)]
            });
        }

        // Fresh fetch
        await message.guild.channels.fetch().catch(() => { });

        let target = null;
        let newName = "";

        // Attempt to find a target VC in args[0]
        const firstArg = args[0];
        const isMention = message.mentions.channels.first();
        const isID = message.guild.channels.cache.get(firstArg);
        const isNameMatch = message.guild.channels.cache.find(c => c.type === ChannelType.GuildVoice && (c.name.toLowerCase() === firstArg.toLowerCase()));

        if (isMention || isID || (isNameMatch && args.length > 1)) {
            target = isMention || isID || isNameMatch;
            newName = args.slice(1).join(" ");
        } else {
            // Default to voice channel user is in
            target = message.member.voice.channel;
            newName = args.join(" ");
        }

        if (!target || target.type !== ChannelType.GuildVoice) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ INVALID CHANNEL", 2), V2.text("> Target must be a voice channel you are in or have specified.")], botAvatar)], V2_RED)]
            });
        }

        if (!newName) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚠️ NAME REQUIRED", 2), V2.text("> Please provide the new name.")], botAvatar)], V2_RED)]
            });
        }

        const oldName = target.name;

        try {
            await target.setName(newName);
            return message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🏷️ VOICE CHANNEL RENAMED", 2),
                        V2.text(`**Path:** ${target.name}\n**Log:** \`${oldName}\` ➡️ \`${newName}\``)
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
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "renamevc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] renamevc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "renamevc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("renamevc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`renamevc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_820
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_795
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_170
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_463
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_618
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_360
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_402
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_337
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_893
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_208
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_3
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_721
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_110
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_391
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_955
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_901
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_698
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_629
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_291
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_906
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_345
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_315
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_217
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_632
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_833
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_433
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_689
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_935
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_13
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_132
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_656
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_689
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_761
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_959
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_124
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_551
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_872
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_325
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_149
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_238
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_174
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_528
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_286
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_16
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_322
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_568
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_77
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_69
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_452
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_702
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_895
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_691
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_995
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_216
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_991
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_165
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_565
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_490
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_692
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_222
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_103
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_277
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_891
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_936
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_698
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_773
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_468
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_56
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_681
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_40
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_986
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_2
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_216
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_858
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_355
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_989
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_921
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_682
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_794
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_154
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_360
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_771
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_38
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_962
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_829
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_314
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_851
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_309
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_609
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_604
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_838
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_282
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_879
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_651
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_238
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_365
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_745
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_437
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_616
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | RENAMEVC_ID_688
 */

};