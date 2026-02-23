const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "serverstats.json");

function loadData() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) { fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2)); return {}; }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}
function saveData(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
    name: "serverstats",
    description: "Setup server statistic counters (VC display)",
    usage: "!serverstats setup | delete",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SERVERSTATS
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("serverstats") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "serverstats", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Administrator permissions required.**")], V2_RED)] });

        const sub = args[0]?.toLowerCase();

        if (sub === "setup") {
            const tempMsg = await message.reply({ flags: V2.flag, components: [V2.container([V2.text("📊 **Setting up Server Stats...** Creating stat channels.")], V2_BLUE)] });
            try {
                const category = await message.guild.channels.create({
                    name: "📊 Server Stats 📊",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [{ id: message.guild.id, deny: [PermissionsBitField.Flags.Connect], allow: [PermissionsBitField.Flags.ViewChannel] }]
                });
                const totalMembers = await message.guild.channels.create({ name: `Total Members: ${message.guild.memberCount}`, type: ChannelType.GuildVoice, parent: category.id });
                const botCount = message.guild.members.cache.filter(m => m.user.bot).size;
                const bots = await message.guild.channels.create({ name: `Bots: ${botCount}`, type: ChannelType.GuildVoice, parent: category.id });

                const data = loadData();
                data[message.guild.id] = { categoryId: category.id, totalId: totalMembers.id, botsId: bots.id };
                saveData(data);

                return tempMsg.edit({ flags: V2.flag, components: [V2.container([V2.heading("📊 SERVER STATS CREATED", 2), V2.text("> **Total Members** channel created\n> **Bots** channel created\n\nChannels update every **10 minutes**.")], V2_BLUE)] });
            } catch (e) {
                return tempMsg.edit({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to create channels. Check my permissions.")], V2_RED)] });
            }
        }

        if (sub === "delete") {
            const data = loadData();
            if (!data[message.guild.id]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ No server stats setup found.")], V2_RED)] });
            const config = data[message.guild.id];
            try {
                const arr = [config.totalId, config.botsId, config.categoryId].map(id => message.guild.channels.cache.get(id)).filter(Boolean);
                await Promise.all(arr.map(c => c.delete().catch(() => { })));
            } catch (e) { }
            delete data[message.guild.id];
            saveData(data);
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🗑️ **Server Stats removed.**")], V2_BLUE)] });
        }

        return message.reply({ flags: V2.flag, components: [V2.container([V2.text("**Usage:**\n> `!serverstats setup` — Create stat display channels\n> `!serverstats delete` — Remove them")], V2_BLUE)] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverstats", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] serverstats.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "serverstats", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("serverstats", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`serverstats\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_589
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_981
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_411
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_73
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_580
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_841
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_379
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_903
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_125
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_261
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_531
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_360
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_705
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_742
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_285
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_142
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_333
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_531
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_313
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_939
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_86
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_827
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_480
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_580
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_5
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_196
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_58
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_417
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_341
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_291
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_916
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_222
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_56
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_921
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_242
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_840
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_866
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_35
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_730
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_737
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_184
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_623
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_475
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_676
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_269
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_330
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_953
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_490
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_979
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_279
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_749
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_351
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_459
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_903
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_87
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_391
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_112
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_775
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_124
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_260
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_948
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_655
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_303
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_584
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_349
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_324
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_136
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_2
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_684
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_404
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_252
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_674
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_107
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_366
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_357
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_20
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_317
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_158
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_605
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_471
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_283
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_801
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_876
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_347
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_846
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_676
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_776
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_887
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_28
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_418
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_107
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_839
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_378
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_371
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_585
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_99
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_102
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_360
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_354
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SERVERSTATS_ID_53
 */

};