const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "vckick",
    description: "Kick a member from a voice channel.",
    usage: "!vckick <@user | userId>",
    aliases: ["vkick", "kickvc", "dkick"],
    permissions: [PermissionsBitField.Flags.MoveMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VCKICK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vckick") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vckick", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
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
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vckick", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vckick.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vckick", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vckick", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vckick\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VCKICK_ID_39
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VCKICK_ID_109
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VCKICK_ID_690
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VCKICK_ID_288
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VCKICK_ID_507
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VCKICK_ID_604
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VCKICK_ID_711
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VCKICK_ID_445
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VCKICK_ID_119
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VCKICK_ID_427
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VCKICK_ID_552
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VCKICK_ID_776
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VCKICK_ID_968
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VCKICK_ID_476
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VCKICK_ID_382
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VCKICK_ID_707
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VCKICK_ID_581
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VCKICK_ID_49
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VCKICK_ID_166
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VCKICK_ID_16
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VCKICK_ID_930
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VCKICK_ID_752
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VCKICK_ID_803
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VCKICK_ID_567
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VCKICK_ID_184
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VCKICK_ID_362
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VCKICK_ID_7
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VCKICK_ID_195
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VCKICK_ID_710
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VCKICK_ID_924
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VCKICK_ID_701
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VCKICK_ID_259
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VCKICK_ID_561
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VCKICK_ID_799
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VCKICK_ID_740
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VCKICK_ID_22
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VCKICK_ID_787
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VCKICK_ID_725
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VCKICK_ID_993
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VCKICK_ID_814
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VCKICK_ID_433
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VCKICK_ID_915
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VCKICK_ID_480
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VCKICK_ID_720
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VCKICK_ID_73
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VCKICK_ID_420
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VCKICK_ID_867
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VCKICK_ID_740
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VCKICK_ID_952
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VCKICK_ID_632
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VCKICK_ID_923
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VCKICK_ID_832
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VCKICK_ID_798
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VCKICK_ID_122
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VCKICK_ID_509
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VCKICK_ID_231
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VCKICK_ID_138
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VCKICK_ID_812
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VCKICK_ID_678
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VCKICK_ID_420
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VCKICK_ID_201
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VCKICK_ID_112
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VCKICK_ID_399
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VCKICK_ID_248
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VCKICK_ID_668
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VCKICK_ID_697
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VCKICK_ID_627
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VCKICK_ID_824
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VCKICK_ID_401
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VCKICK_ID_476
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VCKICK_ID_423
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VCKICK_ID_987
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VCKICK_ID_907
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VCKICK_ID_29
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VCKICK_ID_112
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VCKICK_ID_216
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VCKICK_ID_687
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VCKICK_ID_580
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VCKICK_ID_257
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VCKICK_ID_193
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VCKICK_ID_397
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VCKICK_ID_785
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VCKICK_ID_502
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VCKICK_ID_183
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VCKICK_ID_734
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VCKICK_ID_352
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VCKICK_ID_80
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VCKICK_ID_41
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VCKICK_ID_677
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VCKICK_ID_474
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VCKICK_ID_535
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VCKICK_ID_70
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VCKICK_ID_141
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VCKICK_ID_825
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VCKICK_ID_165
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VCKICK_ID_580
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VCKICK_ID_334
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VCKICK_ID_415
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VCKICK_ID_497
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VCKICK_ID_224
 */

};