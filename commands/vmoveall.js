const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, V2_BLUE } = require("../config");

module.exports = {
    name: "vmoveall",
    description: "Move all members from one voice channel to another",
    usage: "!vmoveall <from_channel_id> <to_channel_id>",
    aliases: ["moveall", "massmove"],
    permissions: [PermissionsBitField.Flags.MoveMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VMOVEALL
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vmoveall") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vmoveall", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You do not have permission to move members.")] });
        }

        if (args.length < 2) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Usage:** `!vmoveall <FromChannelID> <ToChannelID>`")] });
        }

        const fromId = args[0].replace(/[<#>]/g, "");
        const toId = args[1].replace(/[<#>]/g, "");

        const fromChannel = message.guild.channels.cache.get(fromId);
        const toChannel = message.guild.channels.cache.get(toId);

        if (!fromChannel || fromChannel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ **Invalid Source Channel.** Please provide a valid Voice Channel ID.");
        }
        if (!toChannel || toChannel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ **Invalid Destination Channel.** Please provide a valid Voice Channel ID.");
        }

        if (fromChannel.members.size === 0) {
            return message.reply("⚠️ **Source Channel is empty.** No one to move.");
        }

        const count = fromChannel.members.size;
        let moved = 0;

        const V2 = require("../utils/v2Utils");
        const loadingMsg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔄 MASS VOICE TRANSFER", 3),
                V2.text(`Relocating **${count}** members...`)
            ], V2_BLUE)]
        });

        // Parallel Move
        await Promise.all(Array.from(fromChannel.members.values()).map(async (member) => {
            try {
                await member.voice.setChannel(toChannel, "Mass Move Protocol");
                moved++;
            } catch (err) { }
        }));

        const container = V2.container([
            V2.section([
                V2.heading("🔄 MASS VOICE TRANSFER", 2),
                V2.text(`Successfully relocated **${moved}/${count}** members.`)
            ], "https://cdn-icons-png.flaticon.com/512/3135/3135882.png"),
            V2.separator(),
            V2.heading("📂 ROUTING", 3),
            V2.text(`> **From:** ${fromChannel.name}\n> **To:** ${toChannel.name}`),
            V2.separator(),
            V2.text(`> **Authorized By:** ${message.author}`),
            V2.separator(),
            V2.text("*BlueSealPrime • Logistics Protocol*")
        ], V2_BLUE);

        await loadingMsg.edit({ content: null, flags: V2.flag, components: [container] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmoveall", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vmoveall.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vmoveall", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vmoveall", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vmoveall\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_169
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_98
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_137
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_908
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_947
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_156
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_442
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_964
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_898
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_323
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_696
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_327
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_606
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_667
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_488
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_694
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_213
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_202
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_730
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_830
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_731
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_887
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_644
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_965
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_152
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_493
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_708
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_85
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_870
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_477
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_539
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_528
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_223
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_531
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_817
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_781
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_557
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_789
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_10
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_243
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_66
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_919
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_884
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_531
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_883
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_582
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_947
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_647
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_695
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_611
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_480
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_785
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_394
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_253
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_634
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_348
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_438
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_880
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_345
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_974
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_666
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_673
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_291
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_604
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_409
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_976
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_852
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_902
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_83
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_79
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_298
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_697
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_15
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_694
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_770
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_797
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_247
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_585
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_290
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_403
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_806
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_678
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_429
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_437
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_515
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_102
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_8
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_116
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_700
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_16
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_959
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_397
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_880
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_731
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_327
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_624
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_248
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_717
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_279
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VMOVEALL_ID_915
 */

};