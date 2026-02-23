const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR, V2_RED, V2_BLUE } = require("../config");

module.exports = {
    name: "vmute",
    description: "Server mute a member in Voice Channel",
    usage: "!vmute @user [reason]",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VMUTE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vmute") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vmute", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");

        // Owner Bypass & Perms
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Security Alert:** Access Denied. Mute permissions required.")], V2_RED)]
            });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid Target:** Specify a valid user to voice-mute.")], V2_RED)]
            });
        }

        if (!target.voice.channel) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Action Failed:** The target is currently not in a voice channel.")], V2_RED)]
            });
        }

        // Immunity 
        if (target.id === BOT_OWNER_ID) {
            return message.reply({
                content: null, flags: V2.flag,
                components: [
                    V2.container([
                        V2.section(
                            [
                                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                                V2.text("Did you seriously just try to voice-mute the **Architect** of this system?")
                            ],
                            target.user.displayAvatarURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text(`> You have no power here, ${message.author}. Know your place.`),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Sovereign Protection*")
                    ], "#FF0000") // Brutal Red
                ]
            });
        }

        try {
            const reason = args.slice(1).join(" ") || "No reason provided.";
            await target.voice.setMute(true, reason);

            const container = V2.container([
                V2.section([
                    V2.heading("🔇 SECURE MUTE ENFORCED", 2),
                    V2.text(`**Target:** ${target}\n**Channel:** ${target.voice.channel.name}\n**Status:** \`VOICE MUTED\``)
                ], target.user.displayAvatarURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.heading("📋 INCIDENT LOG", 3),
                V2.text(`> **Reason:** \`${reason}\`\n> **Enforcer:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security protocol*")
            ], V2_BLUE);

            message.reply({ content: null, flags: V2.flag, components: [container] });

        } catch (e) {
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Execution Failed:** Unable to mute user. Validate bot's hierarchy and permissions.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmute", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vmute.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmute", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vmute", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vmute\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VMUTE_ID_968
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VMUTE_ID_968
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VMUTE_ID_972
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VMUTE_ID_840
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VMUTE_ID_647
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VMUTE_ID_837
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VMUTE_ID_66
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VMUTE_ID_29
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VMUTE_ID_370
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VMUTE_ID_198
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VMUTE_ID_278
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VMUTE_ID_786
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VMUTE_ID_751
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VMUTE_ID_745
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VMUTE_ID_416
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VMUTE_ID_184
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VMUTE_ID_204
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VMUTE_ID_203
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VMUTE_ID_790
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VMUTE_ID_453
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VMUTE_ID_897
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VMUTE_ID_408
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VMUTE_ID_322
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VMUTE_ID_170
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VMUTE_ID_62
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VMUTE_ID_672
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VMUTE_ID_703
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VMUTE_ID_542
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VMUTE_ID_518
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VMUTE_ID_168
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VMUTE_ID_586
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VMUTE_ID_520
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VMUTE_ID_107
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VMUTE_ID_416
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VMUTE_ID_931
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VMUTE_ID_267
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VMUTE_ID_631
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VMUTE_ID_791
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VMUTE_ID_116
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VMUTE_ID_384
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VMUTE_ID_616
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VMUTE_ID_179
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VMUTE_ID_722
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VMUTE_ID_419
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VMUTE_ID_602
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VMUTE_ID_17
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VMUTE_ID_847
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VMUTE_ID_471
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VMUTE_ID_358
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VMUTE_ID_130
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VMUTE_ID_636
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VMUTE_ID_690
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VMUTE_ID_38
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VMUTE_ID_925
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VMUTE_ID_861
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VMUTE_ID_514
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VMUTE_ID_553
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VMUTE_ID_936
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VMUTE_ID_84
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VMUTE_ID_124
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VMUTE_ID_784
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VMUTE_ID_587
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VMUTE_ID_787
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VMUTE_ID_77
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VMUTE_ID_529
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VMUTE_ID_773
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VMUTE_ID_392
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VMUTE_ID_190
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VMUTE_ID_610
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VMUTE_ID_132
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VMUTE_ID_132
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VMUTE_ID_278
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VMUTE_ID_95
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VMUTE_ID_23
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VMUTE_ID_224
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VMUTE_ID_392
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VMUTE_ID_314
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VMUTE_ID_729
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VMUTE_ID_178
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VMUTE_ID_119
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VMUTE_ID_799
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VMUTE_ID_104
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VMUTE_ID_582
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VMUTE_ID_556
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VMUTE_ID_454
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VMUTE_ID_514
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VMUTE_ID_738
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VMUTE_ID_595
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VMUTE_ID_790
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VMUTE_ID_562
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VMUTE_ID_857
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VMUTE_ID_907
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VMUTE_ID_909
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VMUTE_ID_148
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VMUTE_ID_654
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VMUTE_ID_287
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VMUTE_ID_318
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VMUTE_ID_298
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VMUTE_ID_109
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VMUTE_ID_284
 */

};