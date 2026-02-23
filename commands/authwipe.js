const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_RED } = require("../config");

module.exports = {
    name: "authwipe",
    description: "Forcefully purge all security roles from the node",
    aliases: ["aw", "wipeauth"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: AUTHWIPE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("authwipe") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "authwipe", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) return;

        const clientUser = message.client.user;
        const guild = message.guild;

        const roleNames = [
            "BlueSealPrime!",
            "BlueSealPrime! anti nuke",
            "BlueSealPrime! unbypassable",
            "BlueSealPrime! secure",
            "BlueSealPrime! anti-raid"
        ];

        const msg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🗑️ INITIATING GLOBAL PURGE", 2),
                V2.text("Fetching all node roles for decommissioning...")
            ], "#FFA500")]
        });

        try {
            // 1. Use cache to avoid rate limitations
            const allRoles = guild.roles.cache;
            let totalDeleted = 0;
            const wipeLogs = [];

            // 2. Loop through role names and find ALL instances in cache
            for (const name of roleNames) {
                const matching = allRoles.filter(r => r.name === name);
                if (matching.size > 0) {
                    wipeLogs.push(`🔹 Found **${matching.size}** instances of \`${name}\``);
                    for (const [id, role] of matching) {
                        try {
                            await role.delete("Global Security Purge Protocol");
                            totalDeleted++;
                        } catch (e) {
                            wipeLogs.push(`❌ Failed to delete instance of \`${name}\``);
                        }
                    }
                }
            }

            const completeContainer = V2.container([
                V2.section([
                    V2.heading("✅ GLOBAL PURGE COMPLETE", 2),
                    V2.text(`**Decommissioning Successful.**\nSuccessfully dissolved **${totalDeleted}** security role instances.`)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(wipeLogs.join("\n") || "*No residual security roles were found on the node.*"),
                V2.separator(),
                V2.text(`*Status: NODE_CLEANSED • Architect Mode*`)
            ], V2_RED);

            await msg.edit({ components: [completeContainer] });

        } catch (err) {
            console.error(err);
            await msg.edit({
                components: [V2.container([V2.text("❌ **CRITICAL_FAULT:** Failed to execute global purge.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "authwipe", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] authwipe.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "authwipe", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("authwipe", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`authwipe\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_599
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_884
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_919
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_235
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_528
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_86
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_589
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_10
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_580
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_865
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_952
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_498
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_518
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_675
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_449
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_352
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_848
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_122
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_399
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_93
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_554
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_921
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_753
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_382
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_912
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_589
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_175
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_581
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_356
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_662
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_552
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_167
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_453
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_745
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_459
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_626
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_884
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_221
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_930
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_247
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_902
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_929
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_776
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_337
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_382
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_528
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_743
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_772
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_358
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_341
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_20
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_996
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_224
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_424
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_61
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_788
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_992
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_574
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_192
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_282
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_781
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_128
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_85
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_737
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_845
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_648
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_720
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_252
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_696
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_174
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_452
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_481
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_730
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_511
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_763
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_5
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_171
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_864
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_273
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_997
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_493
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_843
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_550
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_855
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_250
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_940
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_104
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_395
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_626
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_379
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_3
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_800
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_492
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_599
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_180
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_633
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_166
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_894
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_588
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | AUTHWIPE_ID_281
 */

};