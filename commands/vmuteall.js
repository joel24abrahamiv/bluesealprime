const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
    name: "vmuteall",
    description: "Mute EVERYONE in your voice channel (except bots/immune)",
    usage: "!vmuteall",
    permissions: [PermissionsBitField.Flags.MuteMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VMUTEALL
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vmuteall") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vmuteall", cooldown);
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

        const members = channel.members.filter(m => !m.user.bot && m.id !== BOT_OWNER_ID && m.id !== message.author.id); // Don't mute self or owner

        if (members.size === 0) return message.reply("⚠️ No one to mute.");

        const V2 = require("../utils/v2Utils");
        const statusMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔇 MASS VOICE MUTE", 3),
                V2.text(`Processing **${members.size}** members in **${channel.name}**...`)
            ], V2_BLUE)]
        });

        // TURBO MASS MUTE (PARALLEL)
        const muteTasks = members.map(member =>
            member.voice.setMute(true, "Mass Mute Protocol").catch(() => { })
        );

        await Promise.allSettled(Array.from(muteTasks.values()));

        const { AttachmentBuilder } = require("discord.js");
        const muteIcon = new AttachmentBuilder("./assets/vmute.png", { name: "vmute.png" });

        await statusMsg.edit({
            content: null,
            flags: V2.flag,
            files: [muteIcon],
            components: [V2.container([
                V2.section([
                    V2.heading("✅ MASS MUTE COMPLETE", 2),
                    V2.text(`**Channel:** ${channel.name}\n**Total Muted:** \`${members.size}\` members`)
                ], "attachment://vmute.png"), // Premium Blue Mute
                V2.separator(),
                V2.text(`> **Actioned By:** ${message.author}`),
                V2.separator(),
                V2.text("*BlueSealPrime • Sovereign Voice Control*")
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmuteall", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vmuteall.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmuteall", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vmuteall", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vmuteall\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_549
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_933
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_875
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_208
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_374
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_558
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_327
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_512
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_569
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_296
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_660
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_406
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_322
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_138
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_595
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_52
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_146
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_16
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_554
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_301
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_81
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_316
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_883
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_42
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_161
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_393
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_329
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_660
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_938
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_494
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_130
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_499
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_302
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_438
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_301
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_207
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_127
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_389
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_763
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_642
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_173
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_780
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_46
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_382
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_808
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_529
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_217
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_557
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_519
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_987
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_556
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_893
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_609
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_32
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_990
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_687
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_669
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_249
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_607
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_829
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_79
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_103
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_870
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_178
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_798
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_123
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_71
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_398
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_292
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_123
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_969
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_240
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_330
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_509
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_49
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_17
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_50
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_878
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_6
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_615
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_742
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_656
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_54
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_320
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_162
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_383
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_413
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_931
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_291
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_534
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_175
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_50
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_655
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_200
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_465
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_203
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_299
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_363
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_84
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VMUTEALL_ID_93
 */

};