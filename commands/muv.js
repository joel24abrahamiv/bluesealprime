const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "muv",
    description: "Move user to Quarantine VC (The Void) or a specified channel",
    usage: "!muv @user [channel_id]",
    permissions: [PermissionsBitField.Flags.MoveMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: MUV
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("muv") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "muv", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID && !message.member.permissions.has(PermissionsBitField.Flags.MoveMembers))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Permission Denied.**")], V2_RED)] });

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User not found.")], V2_RED)] });
        if (!target.voice.channel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ User is not in a voice channel.")], V2_RED)] });
        if (target.id === BOT_OWNER_ID) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Cannot move the Owner.")], V2_RED)] });

        let destChannel;
        if (args[1]) {
            destChannel = message.guild.channels.cache.get(args[1]);
        } else {
            destChannel = message.guild.channels.cache.find(c => c.name === "The Void" && c.type === ChannelType.GuildVoice);
            if (!destChannel) {
                try {
                    destChannel = await message.guild.channels.create({
                        name: "The Void",
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: [{ id: message.guild.id, deny: [PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream] }]
                    });
                } catch (e) {
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to create Void channel.")], V2_RED)] });
                }
            }
        }

        if (!destChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Destination channel not found.")], V2_RED)] });

        try {
            await target.voice.setChannel(destChannel);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🚚 **${target.user.tag}** moved to **${destChannel.name}**.`)], V2_BLUE)] });
        } catch (e) {
            message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to move user.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "muv", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] muv.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "muv", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("muv", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`muv\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | MUV_ID_678
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | MUV_ID_58
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | MUV_ID_739
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | MUV_ID_876
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | MUV_ID_885
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | MUV_ID_538
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | MUV_ID_944
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | MUV_ID_759
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | MUV_ID_718
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | MUV_ID_97
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | MUV_ID_162
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | MUV_ID_127
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | MUV_ID_975
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | MUV_ID_113
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | MUV_ID_687
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | MUV_ID_25
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | MUV_ID_568
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | MUV_ID_4
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | MUV_ID_284
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | MUV_ID_125
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | MUV_ID_848
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | MUV_ID_308
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | MUV_ID_895
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | MUV_ID_309
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | MUV_ID_684
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | MUV_ID_66
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | MUV_ID_989
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | MUV_ID_823
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | MUV_ID_697
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | MUV_ID_61
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | MUV_ID_740
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | MUV_ID_349
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | MUV_ID_985
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | MUV_ID_468
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | MUV_ID_485
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | MUV_ID_225
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | MUV_ID_823
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | MUV_ID_513
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | MUV_ID_356
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | MUV_ID_455
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | MUV_ID_807
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | MUV_ID_461
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | MUV_ID_323
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | MUV_ID_682
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | MUV_ID_804
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | MUV_ID_296
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | MUV_ID_481
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | MUV_ID_623
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | MUV_ID_589
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | MUV_ID_826
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | MUV_ID_548
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | MUV_ID_3
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | MUV_ID_125
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | MUV_ID_64
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | MUV_ID_608
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | MUV_ID_417
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | MUV_ID_549
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | MUV_ID_777
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | MUV_ID_615
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | MUV_ID_825
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | MUV_ID_810
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | MUV_ID_856
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | MUV_ID_166
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | MUV_ID_175
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | MUV_ID_444
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | MUV_ID_127
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | MUV_ID_16
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | MUV_ID_894
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | MUV_ID_529
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | MUV_ID_544
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | MUV_ID_710
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | MUV_ID_92
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | MUV_ID_463
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | MUV_ID_615
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | MUV_ID_668
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | MUV_ID_909
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | MUV_ID_13
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | MUV_ID_677
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | MUV_ID_862
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | MUV_ID_626
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | MUV_ID_887
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | MUV_ID_310
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | MUV_ID_330
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | MUV_ID_4
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | MUV_ID_492
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | MUV_ID_517
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | MUV_ID_341
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | MUV_ID_519
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | MUV_ID_638
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | MUV_ID_647
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | MUV_ID_740
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | MUV_ID_905
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | MUV_ID_293
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | MUV_ID_395
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | MUV_ID_246
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | MUV_ID_635
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | MUV_ID_716
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | MUV_ID_676
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | MUV_ID_775
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | MUV_ID_185
 */

};