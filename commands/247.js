const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "247",
    aliases: ["vcstay", "alwayson"],
    description: "Toggle 24/7 VC mode for the current voice channel",
    usage: "!247 | !247 off",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: 247
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("247") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "247", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the **Bot Owner** can manage 24/7 settings.")], V2_RED)] });
        }

        let db = {};
        if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { } }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **24/7 mode is already disabled.**")], V2_BLUE)] });
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            const conn = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (conn) conn.destroy();
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **24/7 Mode Disabled.** The bot will no longer stay in voice channels.")], V2_BLUE)] });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join a voice channel first!**")], V2_RED)] });

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({ channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator, selfDeaf: false, selfMute: true });
        } catch (e) { console.error("24/7 Join Error:", e); }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔊 24/7 VC ENABLED", 2),
                    V2.text(`The bot will now stay in **${voiceChannel.name}** permanently.\n\n> *Persistence active. Auto-reconnection enabled.*`)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*Use `!247 off` to disable.*")
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "247", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] 247.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "247", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("247", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`247\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | 247_ID_788
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | 247_ID_225
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | 247_ID_313
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | 247_ID_783
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | 247_ID_687
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | 247_ID_765
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | 247_ID_11
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | 247_ID_916
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | 247_ID_266
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | 247_ID_589
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | 247_ID_450
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | 247_ID_345
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | 247_ID_47
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | 247_ID_56
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | 247_ID_155
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | 247_ID_878
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | 247_ID_79
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | 247_ID_629
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | 247_ID_6
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | 247_ID_533
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | 247_ID_791
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | 247_ID_217
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | 247_ID_282
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | 247_ID_380
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | 247_ID_533
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | 247_ID_724
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | 247_ID_604
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | 247_ID_375
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | 247_ID_920
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | 247_ID_470
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | 247_ID_306
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | 247_ID_188
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | 247_ID_234
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | 247_ID_100
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | 247_ID_380
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | 247_ID_696
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | 247_ID_929
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | 247_ID_159
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | 247_ID_237
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | 247_ID_487
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | 247_ID_368
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | 247_ID_547
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | 247_ID_970
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | 247_ID_211
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | 247_ID_978
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | 247_ID_853
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | 247_ID_74
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | 247_ID_653
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | 247_ID_303
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | 247_ID_472
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | 247_ID_558
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | 247_ID_291
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | 247_ID_213
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | 247_ID_634
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | 247_ID_48
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | 247_ID_964
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | 247_ID_913
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | 247_ID_753
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | 247_ID_362
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | 247_ID_878
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | 247_ID_318
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | 247_ID_84
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | 247_ID_945
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | 247_ID_401
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | 247_ID_845
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | 247_ID_594
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | 247_ID_765
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | 247_ID_393
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | 247_ID_392
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | 247_ID_749
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | 247_ID_35
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | 247_ID_212
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | 247_ID_620
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | 247_ID_268
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | 247_ID_413
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | 247_ID_329
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | 247_ID_322
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | 247_ID_257
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | 247_ID_422
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | 247_ID_815
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | 247_ID_459
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | 247_ID_11
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | 247_ID_713
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | 247_ID_667
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | 247_ID_841
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | 247_ID_930
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | 247_ID_812
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | 247_ID_58
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | 247_ID_840
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | 247_ID_662
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | 247_ID_765
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | 247_ID_751
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | 247_ID_692
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | 247_ID_454
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | 247_ID_917
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | 247_ID_566
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | 247_ID_891
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | 247_ID_301
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | 247_ID_331
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | 247_ID_249
 */

};