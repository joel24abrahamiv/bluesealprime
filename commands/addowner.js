const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "addowner",
    description: "Add a user to the Extra Owners list (Server/Bot Owner only)",
    aliases: ["trust", "addtrust"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ADDOWNER
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("addowner") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "addowner", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** This protocol is restricted to the Lead Architect or Node Monarch.")], V2_RED)]
            });
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Fault:** Please specify a valid entity to elevate.")], V2_RED)]
            });
        }

        if (target.bot) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **SECURITY_FAULT:** Sovereign authority cannot be delegated to an automated entity. Trust must be human.")], V2_RED)]
            });
        }

        // 🛡️ USER-BOT (SELF-BOT) DETECTION:
        // 1. Account Age < 7 Days
        // 2. No custom avatar (Likely a throwaway bot account)
        const accountAge = Date.now() - target.createdTimestamp;
        const minAge = 1000 * 60 * 60 * 24 * 7; // 7 Days
        const hasAvatar = !!target.avatar;

        if (accountAge < minAge || !hasAvatar) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **SECURITY_ALERT:** This account lacks the required maturity or identity verification to hold Sovereign Authority. Trust requires a verified human presence (>7d age + Avatar).")], V2_RED)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const guildOwners = db[message.guild.id] || [];
        const isAlreadyOwner = guildOwners.some(o => (typeof o === 'string' ? o : o.id) === target.id);

        if (isAlreadyOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Redundancy:** This entity already possesses delegated sovereign authority.")], V2_BLUE)]
            });
        }

        guildOwners.push({
            id: target.id,
            addedBy: message.author.id, addedAt: Date.now(), trusted: args.includes('trusted'), co_admin: args.includes('co_admin') });
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const container = V2.container([
            V2.section([
                V2.heading("👑 EXTRA OWNER APPOINTED", 2),
                V2.text(
                    `### **[ AUTHORITY_GRANTED ]**\n` +
                    `> **Entity:** ${target} (\`${target.id}\`)\n` +
                    `> **Status:** \`ACTING OWNER\`\n` +
                    `> **Promoter:** ${message.author}\n\n` +
                    `*This user now bypasses all restrictions and possesses administrative parity with the Server Owner within this node.*`
                )
            ], target.displayAvatarURL({ dynamic: true })),
            V2.separator(),
            V2.text("*BlueSealPrime • Trust Chain Initiated*")
        ], V2_BLUE);

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "addowner", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] addowner.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "addowner", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("addowner", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`addowner\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_685
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_38
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_941
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_751
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_874
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_335
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_957
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_109
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_238
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_994
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_916
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_977
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_139
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_865
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_208
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_764
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_838
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_969
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_133
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_910
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_267
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_522
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_698
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_244
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_928
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_380
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_471
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_244
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_984
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_314
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_248
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_572
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_880
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_96
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_611
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_830
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_286
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_344
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_873
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_725
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_341
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_246
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_570
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_926
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_929
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_857
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_419
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_24
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_513
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_173
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_197
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_909
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_136
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_290
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_199
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_589
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_122
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_189
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_402
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_911
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_80
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_687
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_152
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_412
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_327
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_577
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_204
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_458
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_543
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_255
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_230
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_824
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_60
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_405
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_681
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_250
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_704
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_697
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_320
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_571
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_519
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_925
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_106
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_634
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_261
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_43
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_73
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_249
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_8
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_506
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_514
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_362
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_866
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_612
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_376
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_403
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_915
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_66
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_923
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ADDOWNER_ID_262
 */

};