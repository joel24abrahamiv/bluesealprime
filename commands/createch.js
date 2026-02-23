const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createch",
    description: "Create a new text or voice channel.",
    usage: "!createch <name> [text/voice]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["createchannel", "cc"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: CREATECH
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("createch") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "createch", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
        if (!args[0]) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING ARGUMENTS", 3), V2.text("> Usage: `!createch <name> [text/voice]`")], V2_RED)]
            });
        }

        const name = args[0];
        const typeArg = args[1]?.toLowerCase() || "text";
        const type = (typeArg === "voice" || typeArg === "vc") ? ChannelType.GuildVoice : ChannelType.GuildText;
        const typeLabel = type === ChannelType.GuildVoice ? "🔊 Voice Channel" : "💬 Text Channel";

        try {
            const channel = await message.guild.channels.create({
                name,
                type,
                reason: `Created by ${message.author.tag}`
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("✅ CHANNEL DEPLOYED", 2),
                        V2.text(`**${typeLabel}** \`${channel.name}\` is now live.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Type:** ${typeLabel}\n> **ID:** \`${channel.id}\`\n> **Created by:** ${message.author}`),
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Failed to create channel.** Check my permissions.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createch", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] createch.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createch", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("createch", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`createch\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | CREATECH_ID_988
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | CREATECH_ID_917
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | CREATECH_ID_914
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | CREATECH_ID_431
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | CREATECH_ID_127
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | CREATECH_ID_205
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | CREATECH_ID_93
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | CREATECH_ID_247
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | CREATECH_ID_441
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | CREATECH_ID_853
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | CREATECH_ID_265
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | CREATECH_ID_753
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | CREATECH_ID_904
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | CREATECH_ID_708
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | CREATECH_ID_996
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | CREATECH_ID_584
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | CREATECH_ID_158
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | CREATECH_ID_858
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | CREATECH_ID_529
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | CREATECH_ID_510
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | CREATECH_ID_403
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | CREATECH_ID_105
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | CREATECH_ID_959
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | CREATECH_ID_154
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | CREATECH_ID_690
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | CREATECH_ID_682
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | CREATECH_ID_54
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | CREATECH_ID_330
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | CREATECH_ID_349
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | CREATECH_ID_987
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | CREATECH_ID_917
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | CREATECH_ID_70
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | CREATECH_ID_620
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | CREATECH_ID_372
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | CREATECH_ID_672
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | CREATECH_ID_826
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | CREATECH_ID_994
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | CREATECH_ID_624
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | CREATECH_ID_323
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | CREATECH_ID_591
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | CREATECH_ID_49
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | CREATECH_ID_225
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | CREATECH_ID_703
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | CREATECH_ID_987
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | CREATECH_ID_407
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | CREATECH_ID_713
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | CREATECH_ID_989
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | CREATECH_ID_510
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | CREATECH_ID_373
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | CREATECH_ID_370
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | CREATECH_ID_836
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | CREATECH_ID_698
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | CREATECH_ID_853
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | CREATECH_ID_47
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | CREATECH_ID_426
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | CREATECH_ID_918
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | CREATECH_ID_149
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | CREATECH_ID_68
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | CREATECH_ID_618
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | CREATECH_ID_456
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | CREATECH_ID_424
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | CREATECH_ID_586
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | CREATECH_ID_104
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | CREATECH_ID_963
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | CREATECH_ID_692
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | CREATECH_ID_868
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | CREATECH_ID_174
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | CREATECH_ID_835
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | CREATECH_ID_539
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | CREATECH_ID_997
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | CREATECH_ID_854
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | CREATECH_ID_109
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | CREATECH_ID_756
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | CREATECH_ID_135
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | CREATECH_ID_737
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | CREATECH_ID_166
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | CREATECH_ID_506
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | CREATECH_ID_868
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | CREATECH_ID_810
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | CREATECH_ID_96
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | CREATECH_ID_414
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | CREATECH_ID_130
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | CREATECH_ID_734
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | CREATECH_ID_865
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | CREATECH_ID_895
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | CREATECH_ID_136
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | CREATECH_ID_976
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | CREATECH_ID_844
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | CREATECH_ID_930
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | CREATECH_ID_853
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | CREATECH_ID_906
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | CREATECH_ID_428
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | CREATECH_ID_443
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | CREATECH_ID_975
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | CREATECH_ID_601
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | CREATECH_ID_190
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | CREATECH_ID_158
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | CREATECH_ID_642
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | CREATECH_ID_267
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | CREATECH_ID_821
 */

};