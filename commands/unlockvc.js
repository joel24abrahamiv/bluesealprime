const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "unlockvc",
    description: "Unlock the voice channel you are currently in for @everyone",
    usage: "!unlockvc",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["uvc"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UNLOCKVC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("unlockvc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "unlockvc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const V2 = require("../utils/v2Utils");

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 You do not have permission to use this command.")] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("🚫 I do not have permission to manage channels.")] });
        }

        const channel = message.member.voice.channel;
        if (!channel) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(V2_RED).setDescription("⚠️ You must be in a voice channel to unlock it.")] });
        }

        try {
            // Unlock channel for @everyone (Connect: null)
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: null
            }, { reason: `Unlocked by ${message.author.tag}` });

            const unlockIcon = new AttachmentBuilder("./assets/unlock.png", { name: "unlock.png" });

            // Using global V2
            const container = V2.container([
                V2.section([
                    V2.heading("🔓 VOICE CHANNEL UNLOCKED", 2),
                    V2.text(`**Status:** \`UNLOCKED\`\n**Channel:** ${channel.name}\n**Target:** \`@everyone\`\n**Access:** \`Public Default\``)
                ], "https://i.ibb.co/j65q3X4/unlock-icon.png"), // User provided unlock icon
                V2.separator(),
                V2.heading("📂 DETAILS", 3),
                V2.text(`> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Voice Security Protocol*")
            ], V2_BLUE);

            await message.channel.send({ content: null, flags: V2.flag, files: [unlockIcon], components: [container] });

        } catch (err) {
            console.error(err);
            // Using global V2
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Failed to unlock the voice channel.**")], "#FF0000")]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlockvc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] unlockvc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "unlockvc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("unlockvc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`unlockvc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_586
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_706
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_604
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_310
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_545
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_33
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_85
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_309
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_715
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_458
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_298
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_561
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_737
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_959
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_442
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_1
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_591
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_382
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_450
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_643
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_51
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_144
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_453
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_462
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_187
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_733
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_249
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_260
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_890
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_273
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_89
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_786
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_112
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_868
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_645
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_991
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_416
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_189
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_863
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_759
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_148
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_270
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_786
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_334
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_684
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_955
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_693
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_889
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_611
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_754
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_501
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_285
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_717
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_198
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_288
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_832
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_987
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_128
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_993
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_915
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_83
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_82
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_498
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_84
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_758
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_391
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_411
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_30
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_383
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_601
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_352
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_452
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_375
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_620
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_38
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_401
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_709
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_558
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_496
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_918
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_421
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_266
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_96
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_544
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_161
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_880
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_401
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_165
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_490
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_263
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_755
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_198
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_635
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_944
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_412
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_742
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_317
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_402
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_922
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UNLOCKVC_ID_304
 */

};