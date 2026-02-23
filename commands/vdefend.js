const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, SUCCESS_COLOR, V2_BLUE } = require("../config");

const DB_PATH = path.join(__dirname, "../data/vdefend.json");

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "vdefend",
    description: "Protect a user from being moved/disconnected",
    usage: "!vdefend @user",
    permissions: [PermissionsBitField.Flags.Administrator], // High perm required

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: VDEFEND
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("vdefend") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "vdefend", cooldown);
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

        if (data[message.guild.id].includes(target.id)) {
            return message.reply("⚠️ User is already defended.");
        }

        data[message.guild.id].push(target.id);
        saveDB(data);

        const V2 = require("../utils/v2Utils");
        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🛡️ DEFENSE PROTOCOL ACTIVE", 2),
                V2.text(`**Target:** ${target}\n**Status:** \`Protected\`\n\n> *User protection barrier engaged.*`),
                V2.separator(),
                V2.text(`*BlueSealPrime • Anti-Move System*`)
            ], V2_BLUE)]
        });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vdefend", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] vdefend.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "vdefend", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("vdefend", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`vdefend\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_649
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_384
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_423
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_111
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_459
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_144
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_161
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_400
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_891
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_780
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_672
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_853
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_246
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_353
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_619
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_929
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_759
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_306
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_287
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_659
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_20
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_419
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_14
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_217
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_846
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_94
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_107
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_843
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_854
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_448
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_465
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_58
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_634
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_734
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_285
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_283
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_810
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_197
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_748
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_323
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_359
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_987
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_73
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_541
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_920
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_887
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_635
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_52
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_163
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_693
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_960
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_23
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_214
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_884
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_760
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_510
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_682
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_933
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_769
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_936
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_990
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_407
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_840
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_892
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_695
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_583
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_395
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_848
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_728
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_963
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_337
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_901
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_663
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_281
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_37
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_508
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_429
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_747
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_368
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_207
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_864
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_762
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_256
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_917
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_26
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_628
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_355
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_458
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_172
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_164
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_841
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_999
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_764
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_489
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_343
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_616
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_172
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_79
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_420
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | VDEFEND_ID_489
 */

};