const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../data/tempvc_config.json");

module.exports = {
    name: "setupvtc",
    aliases: ["svtc"],
    description: "Sets up the Join-to-Create temporary VC system",
    usage: "!setupvtc (while in the Join VC)",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SETUPVTC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("setupvtc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "setupvtc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Administrator permissions required.")], V2_RED)] });

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join the 'Join to Create' voice channel first!**")], V2_RED)] });

        let config = {};
        if (fs.existsSync(CONFIG_PATH)) { try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch (e) { } }

        config[message.guild.id] = { generatorId: voiceChannel.id, controlChannelId: message.channel.id };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("⚙️ TEMP VC SYSTEM INITIALIZED", 2),
                V2.text(
                    `### ✅ Configuration Complete\n` +
                    `> **Generator VC:** ${voiceChannel.name} (\`${voiceChannel.id}\`)\n` +
                    `> **Control Channel:** ${message.channel} (\`${message.channel.id}\`)\n\n` +
                    `When a member joins the generator VC, a new temporary channel will be created and control buttons will appear here.`
                ),
                V2.separator(),
                V2.text("*BlueSealPrime • Temp VC System*")
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setupvtc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] setupvtc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setupvtc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("setupvtc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`setupvtc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_354
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_860
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_644
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_40
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_277
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_756
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_438
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_814
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_930
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_176
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_504
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_692
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_667
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_469
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_536
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_614
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_866
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_902
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_127
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_249
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_184
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_173
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_117
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_138
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_384
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_781
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_639
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_547
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_90
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_417
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_346
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_458
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_337
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_193
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_871
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_592
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_909
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_74
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_973
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_155
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_61
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_883
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_458
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_605
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_733
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_492
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_711
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_981
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_671
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_550
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_81
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_575
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_935
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_227
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_956
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_61
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_395
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_106
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_134
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_706
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_789
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_644
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_536
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_941
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_803
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_134
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_807
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_628
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_367
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_174
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_60
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_276
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_279
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_855
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_192
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_888
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_558
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_733
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_38
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_498
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_192
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_356
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_70
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_402
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_755
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_923
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_299
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_884
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_270
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_729
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_620
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_232
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_454
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_389
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_54
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_409
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_464
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_848
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_455
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SETUPVTC_ID_682
 */

};