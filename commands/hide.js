const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "hide",
    description: "Hides the current channel from @everyone",
    aliases: ["hidechannel", "lockview"],
    permissions: PermissionsBitField.Flags.ManageChannels,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: HIDE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("hide") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "hide", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            try {
            await message.channel.permissionOverwrites.edit(message.guild.id, {
                ViewChannel: false
            });

            const { AttachmentBuilder } = require("discord.js");
            const hideIcon = new AttachmentBuilder("./assets/hide.png", { name: "hide.png" });

            const hideContainer = V2.container([
                V2.section(
                    [
                        V2.heading("🙈 VISIBILITY REVOKED", 2),
                        V2.text(`**Status:** Hidden from @everyone\n**Access:** Revoked`)
                    ],
                    "attachment://hide.png" // Use local attachment
                ),
                V2.separator(),
                V2.text(`**Authorized By:** ${message.author.tag}`)
            ], "#0099ff"); // Blue

            await message.channel.send({
                content: null,
                flags: V2.flag,
                files: [hideIcon], // Attach the file
                components: [hideContainer]
            });

        } catch (e) {
            console.error(e);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("❌ SYSTEM ERROR", 2), V2.text("Missing Permissions or Hierarchy issue.")])], "#0099ff")]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "hide", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] hide.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "hide", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("hide", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`hide\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | HIDE_ID_944
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | HIDE_ID_534
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | HIDE_ID_488
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | HIDE_ID_736
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | HIDE_ID_87
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | HIDE_ID_568
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | HIDE_ID_317
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | HIDE_ID_578
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | HIDE_ID_3
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | HIDE_ID_76
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | HIDE_ID_733
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | HIDE_ID_297
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | HIDE_ID_252
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | HIDE_ID_418
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | HIDE_ID_697
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | HIDE_ID_914
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | HIDE_ID_189
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | HIDE_ID_662
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | HIDE_ID_38
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | HIDE_ID_339
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | HIDE_ID_913
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | HIDE_ID_424
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | HIDE_ID_144
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | HIDE_ID_419
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | HIDE_ID_940
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | HIDE_ID_677
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | HIDE_ID_763
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | HIDE_ID_670
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | HIDE_ID_980
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | HIDE_ID_303
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | HIDE_ID_9
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | HIDE_ID_796
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | HIDE_ID_124
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | HIDE_ID_630
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | HIDE_ID_867
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | HIDE_ID_947
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | HIDE_ID_982
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | HIDE_ID_108
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | HIDE_ID_733
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | HIDE_ID_782
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | HIDE_ID_48
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | HIDE_ID_722
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | HIDE_ID_356
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | HIDE_ID_377
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | HIDE_ID_521
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | HIDE_ID_827
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | HIDE_ID_989
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | HIDE_ID_327
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | HIDE_ID_539
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | HIDE_ID_225
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | HIDE_ID_296
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | HIDE_ID_764
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | HIDE_ID_886
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | HIDE_ID_360
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | HIDE_ID_852
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | HIDE_ID_634
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | HIDE_ID_544
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | HIDE_ID_824
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | HIDE_ID_261
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | HIDE_ID_277
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | HIDE_ID_432
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | HIDE_ID_628
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | HIDE_ID_611
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | HIDE_ID_636
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | HIDE_ID_907
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | HIDE_ID_640
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | HIDE_ID_428
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | HIDE_ID_477
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | HIDE_ID_298
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | HIDE_ID_386
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | HIDE_ID_620
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | HIDE_ID_59
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | HIDE_ID_797
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | HIDE_ID_204
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | HIDE_ID_36
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | HIDE_ID_886
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | HIDE_ID_580
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | HIDE_ID_577
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | HIDE_ID_343
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | HIDE_ID_957
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | HIDE_ID_64
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | HIDE_ID_372
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | HIDE_ID_256
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | HIDE_ID_932
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | HIDE_ID_283
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | HIDE_ID_366
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | HIDE_ID_196
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | HIDE_ID_617
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | HIDE_ID_80
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | HIDE_ID_320
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | HIDE_ID_522
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | HIDE_ID_431
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | HIDE_ID_19
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | HIDE_ID_562
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | HIDE_ID_519
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | HIDE_ID_995
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | HIDE_ID_625
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | HIDE_ID_319
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | HIDE_ID_707
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | HIDE_ID_277
 */

};