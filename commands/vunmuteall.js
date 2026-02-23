const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
    name: "vunmuteall",
    description: "Unmute EVERYONE in your voice channel",
    usage: "!vunmuteall",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VUNMUTEALL
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vunmuteall") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vunmuteall", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply("🚫 You don't have permission.");
        }

        const channel = message.member.voice.channel;
        if (!channel) return message.reply("⚠️ You must be in a voice channel.");

        const members = channel.members.filter(m => !m.user.bot && m.voice.serverMute);

        if (members.size === 0) return message.reply("⚠️ No one to unmute.");

        const V2 = require("../utils/v2Utils");
        const statusMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔊 MASS VOICE UNMUTE", 3),
                V2.text(`Processing **${members.size}** members in **${channel.name}**...`)
            ], V2_BLUE)]
        });

        // TURBO MASS UNMUTE (PARALLEL)
        const unmuteTasks = members.map(member =>
            member.voice.setMute(false, "Mass Unmute Protocol").catch(() => { })
        );

        await Promise.allSettled(Array.from(unmuteTasks.values()));

        const { AttachmentBuilder } = require("discord.js");
        const unmuteIcon = new AttachmentBuilder("./assets/vunmute.png", { name: "vunmute.png" });

        await statusMsg.edit({
            content: null,
            flags: V2.flag,
            files: [unmuteIcon],
            components: [V2.container([
                V2.section([
                    V2.heading("✅ MASS UNMUTE COMPLETE", 2),
                    V2.text(`**Channel:** ${channel.name}\n**Total Unmuted:** \`${members.size}\` members`)
                ], "attachment://vunmute.png"), // Premium Blue Unmute
                V2.separator(),
                V2.text(`> **Actioned By:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Sovereign Voice Control*")
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vunmuteall", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vunmuteall.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vunmuteall", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vunmuteall", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vunmuteall\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_184
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_718
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_37
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_369
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_981
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_291
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_133
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_456
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_275
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_457
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_629
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_561
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_335
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_485
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_168
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_242
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_60
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_58
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_783
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_502
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_402
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_410
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_670
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_63
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_861
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_832
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_52
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_30
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_181
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_101
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_326
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_145
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_791
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_614
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_648
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_456
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_106
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_36
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_360
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_899
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_326
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_742
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_394
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_467
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_878
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_758
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_418
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_909
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_293
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_98
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_230
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_977
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_302
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_791
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_618
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_274
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_854
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_312
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_990
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_103
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_183
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_307
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_634
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_610
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_697
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_30
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_23
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_131
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_261
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_854
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_608
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_84
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_524
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_904
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_985
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_636
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_110
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_23
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_366
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_178
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_723
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_500
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_682
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_86
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_946
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_316
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_594
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_834
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_789
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_844
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_669
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_998
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_914
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_789
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_541
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_82
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_324
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_151
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_538
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VUNMUTEALL_ID_807
 */

};