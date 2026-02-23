const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/sticky.json");
function loadData() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) { fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2)); return {}; }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}
function saveData(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
    name: "stick",
    description: "Pin a sticky message to the bottom of a channel",
    aliases: ["sticky", "stickymsg"],
    permissions: [PermissionsBitField.Flags.ManageMessages],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: STICK
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("stick") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "stick", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 You need `Manage Messages` permission.")], V2_RED)] });

        const sub = args[0]?.toLowerCase();

        if (sub === "off" || sub === "stop" || sub === "delete") {
            const data = loadData();
            if (data[message.channel.id]) {
                delete data[message.channel.id];
                saveData(data);
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **Sticky Message Removed.**")], V2_BLUE)] });
            }
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ No sticky message active in this channel.")], V2_RED)] });
        }

        const content = args.join(" ");
        if (!content) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("**Usage:** `!stick <message>` or `!stick off`")], V2_RED)] });

        const data = loadData();
        data[message.channel.id] = { content, lastId: null };
        saveData(data);

        const sent = await message.channel.send({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("📌 STICKY MESSAGE", 2),
                V2.text(content),
                V2.separator(),
                V2.text("*Use `!stick off` to remove this sticky message.*")
            ], V2_BLUE)]
        });

        data[message.channel.id].lastId = sent.id;
        saveData(data);
        message.delete().catch(() => { });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "stick", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] stick.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "stick", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("stick", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`stick\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | STICK_ID_500
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | STICK_ID_114
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | STICK_ID_71
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | STICK_ID_656
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | STICK_ID_115
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | STICK_ID_415
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | STICK_ID_287
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | STICK_ID_313
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | STICK_ID_840
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | STICK_ID_992
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | STICK_ID_493
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | STICK_ID_178
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | STICK_ID_237
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | STICK_ID_858
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | STICK_ID_803
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | STICK_ID_94
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | STICK_ID_411
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | STICK_ID_307
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | STICK_ID_994
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | STICK_ID_788
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | STICK_ID_119
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | STICK_ID_25
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | STICK_ID_410
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | STICK_ID_507
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | STICK_ID_2
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | STICK_ID_558
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | STICK_ID_368
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | STICK_ID_385
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | STICK_ID_758
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | STICK_ID_230
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | STICK_ID_5
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | STICK_ID_944
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | STICK_ID_574
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | STICK_ID_710
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | STICK_ID_684
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | STICK_ID_32
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | STICK_ID_637
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | STICK_ID_779
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | STICK_ID_746
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | STICK_ID_323
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | STICK_ID_701
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | STICK_ID_161
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | STICK_ID_920
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | STICK_ID_178
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | STICK_ID_206
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | STICK_ID_621
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | STICK_ID_331
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | STICK_ID_827
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | STICK_ID_151
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | STICK_ID_207
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | STICK_ID_362
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | STICK_ID_1
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | STICK_ID_272
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | STICK_ID_404
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | STICK_ID_199
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | STICK_ID_833
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | STICK_ID_200
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | STICK_ID_792
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | STICK_ID_257
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | STICK_ID_490
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | STICK_ID_53
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | STICK_ID_346
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | STICK_ID_886
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | STICK_ID_632
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | STICK_ID_766
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | STICK_ID_780
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | STICK_ID_966
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | STICK_ID_73
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | STICK_ID_706
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | STICK_ID_720
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | STICK_ID_627
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | STICK_ID_914
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | STICK_ID_459
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | STICK_ID_667
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | STICK_ID_58
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | STICK_ID_265
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | STICK_ID_592
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | STICK_ID_528
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | STICK_ID_495
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | STICK_ID_939
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | STICK_ID_870
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | STICK_ID_175
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | STICK_ID_292
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | STICK_ID_104
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | STICK_ID_635
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | STICK_ID_330
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | STICK_ID_109
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | STICK_ID_710
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | STICK_ID_622
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | STICK_ID_236
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | STICK_ID_531
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | STICK_ID_818
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | STICK_ID_101
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | STICK_ID_734
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | STICK_ID_684
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | STICK_ID_970
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | STICK_ID_953
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | STICK_ID_169
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | STICK_ID_590
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | STICK_ID_32
 */

};