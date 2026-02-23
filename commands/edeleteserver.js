const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "edeleteserver",
    description: "⚠️ TERMINATE SERVER (God Mode Only)",
    aliases: ["delserver", "terminate"],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EDELETESERVER
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("edeleteserver") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "edeleteserver", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        if (!global.GOD_MODE) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **GOD MODE REQUIRED:** This destructive protocol is locked.")], V2_RED)]
            });
        }

        const confirmContainer = V2.container([
            V2.section([
                V2.heading("☢️ TERMINATION PROTOCOL INITIATED", 2),
                V2.text(
                    `**WARNING:** Inevitable destruction detected for this node.\n\n` +
                    `> **Node:** ${message.guild.name}\n` +
                    `> **Entities:** ${message.guild.memberCount}\n` +
                    `> **Shard ID:** ${message.guild.id}\n\n` +
                    `**THIS ACTION CANNOT BE REVERSED.**\n` +
                    `Confirm the final sanitize command.`
                )
            ], "https://cdn-icons-png.flaticon.com/512/564/564619.png"),
            V2.separator(),
            V2.text("*BlueSealPrime • Final Sanitize Request*")
        ], V2_RED);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_delete_server")
                .setLabel("CONFIRM TERMINATION")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("cancel_delete_server")
                .setLabel("ABORT")
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.channel.send({ content: null, components: [confirmContainer, row] });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

        collector.on("collect", async i => {
            if (i.customId === "cancel_delete_server") {
                await i.update({
                    content: null,
                    components: [V2.container([V2.text("🚫 **Termination Aborted.** Node remains operational.")], V2_BLUE)]
                });
            } else if (i.customId === "confirm_delete_server") {
                try {
                    await i.update({
                        content: null,
                        components: [V2.container([V2.text("💥 **TERMINATING NODE...** Synchronizing extinction.")], V2_RED)]
                    });

                    await message.guild.delete();
                } catch (err) {
                    console.error(err);
                    await i.followUp({
                        content: null,
                        flags: V2.flag,
                        components: [V2.container([V2.text(`❌ **FAULT:** Destruction failed. \`${err.message}\``)], V2_RED)]
                    });
                }
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) {
                msg.edit({
                    content: null,
                    components: [V2.container([V2.text("⏳ **Timeout.** Termination protocol disengaged.")], V2_BLUE)]
                });
            }
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "edeleteserver", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] edeleteserver.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "edeleteserver", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("edeleteserver", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`edeleteserver\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_103
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_474
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_337
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_16
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_626
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_838
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_35
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_102
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_814
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_880
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_503
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_947
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_424
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_927
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_180
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_692
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_793
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_739
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_70
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_656
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_703
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_880
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_289
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_161
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_939
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_206
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_313
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_836
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_584
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_660
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_907
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_505
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_832
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_368
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_5
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_499
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_331
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_865
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_592
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_122
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_369
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_240
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_363
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_858
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_64
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_826
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_386
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_19
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_969
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_559
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_694
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_236
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_841
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_155
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_459
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_849
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_865
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_557
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_280
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_774
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_797
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_947
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_167
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_969
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_885
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_522
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_834
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_821
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_180
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_644
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_676
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_359
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_391
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_237
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_917
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_625
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_360
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_581
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_125
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_968
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_962
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_65
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_780
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_204
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_716
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_74
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_877
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_233
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_665
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_37
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_355
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_478
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_904
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_706
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_249
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_852
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_974
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_10
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_222
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | EDELETESERVER_ID_556
 */

};