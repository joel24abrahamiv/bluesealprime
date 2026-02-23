const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_RED } = require("../config");

const DB_PATH = path.join(__dirname, "../data/vdefend.json");

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "vundefend",
    description: "Remove protection from a user",
    usage: "!vundefend @user",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VUNDEFEND
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vundefend") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vundefend", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        const data = loadDB();
        if (!data[message.guild.id]) data[message.guild.id] = [];

        if (!data[message.guild.id].includes(target.id)) {
            return message.reply("⚠️ User is not defended.");
        }

        data[message.guild.id] = data[message.guild.id].filter(id => id !== target.id);
        saveDB(data);

        const V2 = require("../utils/v2Utils");
        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🛡️ DEFENSE PROTOCOL DISENGAGED", 2),
                V2.text(`**Target:** ${target}\n**Status:** \`Vulnerable\`\n\n> *User protection barrier dissolved.*`),
                V2.separator(),
                V2.text(`*BlueSealPrime • Anti-Move System*`)
            ], V2_RED)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vundefend", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vundefend.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vundefend", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vundefend", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vundefend\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_565
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_455
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_996
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_759
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_282
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_679
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_603
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_688
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_942
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_954
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_167
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_901
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_685
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_510
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_975
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_56
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_300
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_709
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_821
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_347
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_983
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_241
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_913
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_233
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_696
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_13
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_251
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_477
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_36
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_458
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_683
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_351
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_696
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_34
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_847
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_751
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_925
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_134
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_598
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_671
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_741
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_471
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_602
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_369
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_826
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_907
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_729
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_942
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_556
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_975
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_954
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_759
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_125
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_710
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_462
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_847
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_847
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_846
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_655
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_334
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_978
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_544
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_153
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_447
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_228
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_109
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_385
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_736
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_54
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_597
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_835
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_336
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_901
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_693
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_65
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_85
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_884
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_390
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_637
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_336
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_113
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_767
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_499
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_73
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_586
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_978
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_810
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_811
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_925
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_185
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_234
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_712
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_844
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_1000
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_804
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_977
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_172
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_620
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_477
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VUNDEFEND_ID_730
 */

};