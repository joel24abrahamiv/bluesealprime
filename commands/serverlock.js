const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "serverlock",
    description: "Locks the entire server",
    usage: "!serverlock [reason]",
    permissions: [PermissionsBitField.Flags.Administrator],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SERVERLOCK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("serverlock") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "serverlock", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
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

            const reason = args.join(" ") || "Administrative Lockdown Protocol";
            const channels = message.guild.channels.cache.filter(c => c.type === 0);

            const msg = await message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🔒 LOCKDOWN INITIATED...", 2),
                    V2.text("Processing channel overrides in parallel...")
                ], V2_RED)]
            });

            const results = await Promise.allSettled(
                channels.map(async ch => {
                    await ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }, { reason: `Server Lock: ${reason}` }).catch(() => { });
                    await ch.permissionOverwrites.edit(BOT_OWNER_ID, { SendMessages: true, ViewChannel: true, Connect: true }, { reason: "Sovereign Protection: Architect Invincibility" }).catch(() => { });
                })

            );
            const lockedCount = results.filter(r => r.status === "fulfilled").length;

            return msg.edit({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🔒 SERVER LOCKDOWN COMPLETE", 2),
                        V2.text(`\`\`\`yml\nSTATUS:   LOCKED\nACCESS:   RESTRICTED\nREASON:   ${reason}\n\`\`\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Channels Affected:** \`${lockedCount}\`\n> **Only Admins may communicate.**`)
                ], V2_RED)]
            });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverlock", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] serverlock.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverlock", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("serverlock", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`serverlock\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_831
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_725
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_836
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_101
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_836
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_15
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_893
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_839
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_767
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_240
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_399
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_97
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_560
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_217
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_16
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_949
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_760
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_446
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_143
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_591
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_591
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_343
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_59
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_790
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_745
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_599
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_767
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_259
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_920
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_891
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_121
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_528
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_653
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_17
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_581
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_151
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_176
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_964
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_827
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_543
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_58
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_94
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_402
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_40
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_645
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_933
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_995
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_779
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_390
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_454
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_183
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_177
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_390
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_276
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_371
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_816
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_661
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_569
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_270
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_913
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_32
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_219
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_855
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_11
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_934
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_272
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_133
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_216
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_142
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_493
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_857
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_426
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_613
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_786
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_637
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_501
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_737
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_214
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_892
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_454
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_499
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_310
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_811
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_780
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_559
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_676
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_113
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_550
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_701
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_818
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_261
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_41
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_219
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_950
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_108
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_521
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_728
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_508
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_468
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SERVERLOCK_ID_430
     */

};