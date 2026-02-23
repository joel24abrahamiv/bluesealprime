const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "serverunlock",
    description: "Unlocks the entire server",
    usage: "!serverunlock",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SERVERUNLOCK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("serverunlock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "serverunlock", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **ACCESS DENIED:** Administrator required.")], V2_RED)] });
        }

        const channels = message.guild.channels.cache.filter(c => c.type === 0);

        const msg = await message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔓 UNLOCK INITIATED...", 2),
                V2.text("Lifting security overrides in parallel...")
            ], V2_BLUE)]
        });

        const results = await Promise.allSettled(
            channels.map(ch => ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null }, { reason: `Server Unlock by ${message.author.tag}` }).catch(() => { }))
        );
        const unlockedCount = results.filter(r => r.status === "fulfilled").length;

        return msg.edit({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔓 SERVER UNLOCKED", 2),
                    V2.text(`\`\`\`yml\nSTATUS:   OPERATIONAL\nACCESS:   GRANTED\n\`\`\``)
                ], botAvatar),
                V2.separator(),
                V2.text(`> **Channels Restored:** \`${unlockedCount}\`\n> **Normal communications may resume.**`)
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverunlock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] serverunlock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverunlock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("serverunlock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`serverunlock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_502
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_537
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_937
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_678
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_617
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_587
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_558
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_292
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_500
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_655
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_505
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_237
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_337
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_495
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_403
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_798
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_56
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_133
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_357
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_636
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_260
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_806
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_972
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_296
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_446
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_694
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_744
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_161
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_911
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_499
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_436
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_559
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_97
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_538
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_297
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_997
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_864
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_877
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_233
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_701
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_835
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_454
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_482
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_38
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_944
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_363
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_791
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_241
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_519
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_418
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_337
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_31
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_89
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_196
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_485
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_940
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_849
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_391
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_236
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_589
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_431
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_457
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_499
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_792
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_704
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_556
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_966
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_200
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_95
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_713
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_627
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_560
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_840
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_452
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_381
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_563
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_28
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_996
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_896
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_424
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_227
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_233
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_766
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_5
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_387
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_243
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_694
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_158
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_382
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_602
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_979
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_802
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_238
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_197
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_452
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_167
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_909
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_858
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_421
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SERVERUNLOCK_ID_706
 */

};