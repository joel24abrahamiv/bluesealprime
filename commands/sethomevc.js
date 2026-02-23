const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "sethomevc",
    aliases: ["shvc"],
    description: "Sets the home voice channel for the bot (Bot Owner Only)",
    usage: "!sethomevc | !sethomevc off",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SETHOMEVC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("sethomevc") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "sethomevc", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the **Bot Owner** can manage Home VC settings.")], V2_RED)] });

        let db = {};
        if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { } }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **Home VC is already disabled.**")], V2_BLUE)] });
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            const conn = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (conn) conn.destroy();
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **Home VC Disabled.** The bot will no longer persist in this channel.")], V2_BLUE)] });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join a voice channel first!**")], V2_RED)] });

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({ channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator, selfDeaf: false, selfMute: true });
        } catch (e) { console.error("Home VC Join Error:", e); }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🏠 HOME VC SET", 2),
                    V2.text(`The bot will now permanently reside in **${voiceChannel.name}**.\n\n> *Persistence active. Auto-reconnection enforced.*\n> Use \`!sethomevc off\` to disable.`)
                ], V2.botAvatar(message))
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "sethomevc", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] sethomevc.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "sethomevc", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("sethomevc", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`sethomevc\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_958
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_540
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_343
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_312
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_658
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_442
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_43
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_583
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_488
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_232
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_321
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_401
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_304
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_430
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_788
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_493
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_11
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_894
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_517
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_329
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_620
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_722
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_600
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_400
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_979
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_642
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_796
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_758
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_249
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_392
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_493
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_518
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_654
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_339
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_595
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_109
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_1
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_810
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_763
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_750
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_533
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_403
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_76
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_22
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_249
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_992
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_665
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_806
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_571
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_16
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_233
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_128
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_202
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_999
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_522
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_673
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_512
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_241
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_774
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_118
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_911
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_607
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_965
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_307
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_570
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_423
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_405
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_600
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_906
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_949
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_340
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_493
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_993
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_458
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_390
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_105
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_200
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_402
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_350
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_694
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_670
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_240
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_761
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_407
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_188
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_545
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_299
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_913
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_978
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_481
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_823
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_535
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_312
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_550
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_515
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_192
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_813
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_448
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_237
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SETHOMEVC_ID_20
 */

};