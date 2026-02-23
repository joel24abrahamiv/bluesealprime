const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const djsVersion = require("discord.js").version;

module.exports = {
    name: "debugavatar",
    description: "Debug Server Avatar Issues",
    usage: "!debugavatar",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: DEBUGAVATAR
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("debugavatar") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "debugavatar", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== message.guild.ownerId && message.author.id !== BOT_OWNER_ID)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 Only the server owner or bot owner can use this.")], V2_RED)] });

        const guild = message.guild;
        const botMember = guild.members.me;
        const logs = [
            `discord.js Version: ${djsVersion}`,
            `Bot: ${botMember?.user?.tag} (${botMember?.id})`,
            `Permissions: ${botMember?.permissions.toArray().slice(0, 5).join(", ")}...`,
            `botMember.edit exists? ${typeof botMember.edit === "function"}`,
        ];

        const serverIconUrl = guild.iconURL({ extension: "png", size: 1024 });
        logs.push(`Server Icon URL: ${serverIconUrl || "None"}`);

        if (!serverIconUrl) {
            logs.push("No server icon to test.");
        } else {
            logs.push("Attempting fetch + botMember.edit({ avatar: buffer })...");
            try {
                const response = await fetch(serverIconUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                const buffer = Buffer.from(await response.arrayBuffer());
                const result = await guild.members.editMe({ avatar: buffer });
                logs.push(`✅ Success! New Avatar Hash: ${result.avatar}`);
            } catch (err) {
                logs.push(`❌ ERROR: ${err.message}`);
                if (err.code) logs.push(`Code: ${err.code}`);
            }
        }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔍 AVATAR DEBUG REPORT", 2),
                V2.text(`\`\`\`\n${logs.join("\n")}\n\`\`\``),
                V2.separator(),
                V2.text("*BlueSealPrime • Diagnostic Protocol*")
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "debugavatar", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] debugavatar.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "debugavatar", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("debugavatar", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`debugavatar\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_967
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_366
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_499
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_835
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_552
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_384
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_740
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_367
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_90
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_424
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_464
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_675
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_388
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_979
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_144
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_57
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_392
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_489
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_481
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_826
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_357
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_279
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_888
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_275
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_158
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_369
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_531
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_906
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_654
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_778
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_212
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_132
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_89
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_657
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_481
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_310
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_391
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_120
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_616
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_513
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_927
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_93
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_438
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_147
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_944
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_174
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_585
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_776
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_802
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_200
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_113
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_349
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_189
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_579
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_673
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_484
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_115
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_152
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_11
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_962
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_215
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_553
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_97
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_67
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_979
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_647
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_548
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_843
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_635
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_887
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_981
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_986
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_733
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_353
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_724
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_277
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_599
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_708
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_135
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_718
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_171
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_399
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_447
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_337
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_656
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_520
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_47
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_272
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_789
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_992
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_613
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_761
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_486
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_619
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_75
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_640
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_561
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_961
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_292
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | DEBUGAVATAR_ID_381
 */

};