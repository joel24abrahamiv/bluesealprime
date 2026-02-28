const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const mainProcess = require("../index");

module.exports = {
    name: "ping",
    description: "Check the bot's latency and system status",
    aliases: ["p", "latency"],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        if (!message || !message.guild) return;

        try {
            const apiPing = message.client.ws.ping;
            const startTime = Date.now();

            // 1. Initial Quick Calculation
            const initialLatency = Date.now() - message.createdTimestamp;

            // 2. Send the message
            const sent = await message.reply({
                content: null,
                flags: V2.flag,
                components: [
                    V2.container([
                        V2.text(`<@${message.client.user.id}> Pong! Bot: \`${initialLatency}ms\` | API: \`${apiPing}ms\``)
                    ], V2_BLUE)
                ]
            });

            if (sent) {
                // Measure the actual round trip
                const roundTrip = sent.createdTimestamp - message.createdTimestamp;

                // Update with the real round-trip value
                await sent.edit({
                    components: [
                        V2.container([
                            V2.text(`<@${message.client.user.id}> Pong! Bot: \`${roundTrip}ms\` | API: \`${apiPing}ms\``)
                        ], V2_BLUE)
                    ]
                }).catch(() => { });
            }

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ping", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] ping.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "ping", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("ping", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`ping\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }
};




























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | PING_ID_728
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | PING_ID_915
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | PING_ID_637
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | PING_ID_341
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | PING_ID_99
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | PING_ID_230
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | PING_ID_412
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | PING_ID_873
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | PING_ID_39
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | PING_ID_111
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | PING_ID_990
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | PING_ID_592
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | PING_ID_648
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | PING_ID_271
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | PING_ID_508
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | PING_ID_917
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | PING_ID_184
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | PING_ID_460
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | PING_ID_217
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | PING_ID_987
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | PING_ID_725
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | PING_ID_616
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | PING_ID_931
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | PING_ID_627
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | PING_ID_138
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | PING_ID_26
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | PING_ID_205
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | PING_ID_186
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | PING_ID_192
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | PING_ID_253
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | PING_ID_813
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | PING_ID_397
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | PING_ID_34
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | PING_ID_411
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | PING_ID_432
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | PING_ID_703
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | PING_ID_847
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | PING_ID_166
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | PING_ID_370
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | PING_ID_918
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | PING_ID_699
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | PING_ID_72
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | PING_ID_311
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | PING_ID_58
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | PING_ID_297
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | PING_ID_249
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | PING_ID_302
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | PING_ID_756
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | PING_ID_262
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | PING_ID_746
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | PING_ID_828
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | PING_ID_916
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | PING_ID_330
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | PING_ID_517
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | PING_ID_194
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | PING_ID_371
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | PING_ID_204
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | PING_ID_611
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | PING_ID_595
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | PING_ID_965
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | PING_ID_115
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | PING_ID_622
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | PING_ID_160
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | PING_ID_224
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | PING_ID_592
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | PING_ID_11
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | PING_ID_28
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | PING_ID_218
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | PING_ID_219
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | PING_ID_799
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | PING_ID_277
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | PING_ID_433
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | PING_ID_139
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | PING_ID_739
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | PING_ID_188
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | PING_ID_921
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | PING_ID_448
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | PING_ID_675
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | PING_ID_475
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | PING_ID_273
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | PING_ID_933
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | PING_ID_646
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | PING_ID_560
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | PING_ID_848
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | PING_ID_101
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | PING_ID_985
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | PING_ID_108
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | PING_ID_114
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | PING_ID_953
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | PING_ID_766
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | PING_ID_422
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | PING_ID_351
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | PING_ID_442
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | PING_ID_486
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | PING_ID_256
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | PING_ID_500
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | PING_ID_636
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | PING_ID_874
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | PING_ID_893
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | PING_ID_452
 */