const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlock",
    description: "Unlock the current channel for @everyone",
    usage: "!unlock [reason]",
    permissions: [PermissionsBitField.Flags.ManageChannels],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNLOCK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("unlock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "unlock", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const reason = args.join(" ") || "No reason provided";

        // Permission Check
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** You need `Manage Channels` permission.")], V2_RED)]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **System Error:** I (Bot) need `Manage Channels` permission.")], V2_RED)]
            });
        }

        try {
            const everyoneRoleId = message.guild.id;

            // UNLOCK: Reset SendMessages for @everyone (null)
            await message.channel.permissionOverwrites.edit(everyoneRoleId, {
                SendMessages: null
            }, { reason: `Unlocked by ${message.author.tag}: ${reason}` });

            const container = V2.container([
                V2.section([
                    V2.heading("🔓 CHANNEL UNLOCKED", 2),
                    V2.text(`**Status:** Access Restored\n**Sector:** ${message.channel.name}\n**Reason:** ${reason}`)
                ], "https://i.ibb.co/j65q3X4/unlock-icon.png"), // User provided unlock icon
                V2.separator(),
                V2.text(`*BlueSealPrime Security Systems • ${new Date().toLocaleTimeString()}*`)
            ], "#0099ff");

            await message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Unlock Failed:** Check bot permissions hierarchy.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] unlock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("unlock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`unlock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_629
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_818
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_34
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_305
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_972
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_400
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_699
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_469
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_873
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_603
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_858
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_966
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_773
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_689
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_144
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_108
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_200
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_54
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_440
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_784
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_262
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_666
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_971
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_170
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_811
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_140
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_667
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_796
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_595
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_548
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_94
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_602
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_332
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_548
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_764
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_506
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_724
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_503
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_732
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_55
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_111
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_823
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_846
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_317
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_976
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_369
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_967
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_563
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_664
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_378
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_452
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_982
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_767
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_706
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_544
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_31
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_669
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_466
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_207
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_558
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_276
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_134
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_735
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_7
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_999
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_102
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_606
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_123
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_772
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_716
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_809
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_40
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_994
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_354
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_997
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_900
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_496
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_212
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_277
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_725
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_154
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_222
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_398
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_754
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_298
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_743
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_439
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_578
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_56
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_337
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_39
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_586
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_197
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_806
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_493
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_491
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_914
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_415
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_70
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNLOCK_ID_214
 */

};