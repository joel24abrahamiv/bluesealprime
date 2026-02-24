const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, ERROR_COLOR } = require("../config");

module.exports = {
    name: "spamblacklist",
    description: "Manage the automatic spam blacklist.",
    aliases: ["spmbl", "spamlist", "sbl", "spm"],

    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SPAMBLACKLIST
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
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("spamblacklist") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "spamblacklist", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ ** THROTTLED:** Wait ${remaining} s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            const ownersDbPath = path.join(__dirname, "../data/owners.json");
            let extraOwners = [];
            if (fs.existsSync(ownersDbPath)) {
                try {
                    const db = JSON.parse(fs.readFileSync(ownersDbPath, "utf8"));
                    extraOwners = db[message.guild.id] || [];
                } catch (e) { }
            }
            const isExtraOwner = extraOwners.includes(message.author.id);

            if (!isBotOwner && !isServerOwner && !isExtraOwner) {
                return message.reply({
                    components: [V2.container([
                        V2.heading("🚫 ACCESS DENIED", 3),
                        V2.text("You do not have permission to manage the Spam Blacklist.")
                    ], ERROR_COLOR)]
                });
            }

            const DB_PATH = path.join(__dirname, "../data/spamblacklist.json");
            let spambl = {};
            if (fs.existsSync(DB_PATH)) {
                try { spambl = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
            }

            const subCommand = args[0]?.toLowerCase();

            if (!subCommand || (subCommand !== "remove" && subCommand !== "list")) {
                const container = V2.container([
                    V2.section([
                        V2.heading("🤖 SPAM INTELLIGENCE REPO", 2),
                        V2.text("Manage auto-bans from the rate limiter.")
                    ], "https://cdn-icons-png.flaticon.com/512/2622/2622112.png"),
                    V2.separator(),
                    V2.heading("🛠️ OPERATIONS", 3),
                    V2.text(`> \`!spmbl list\` - **View Active Spammers**\n> \`!spmbl remove <ID>\` - **Pardon Spammer**`),
                    V2.separator(),
                    V2.text("*BlueSealPrime Automated Defense*")
                ], V2_BLUE);
                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            if (subCommand === "list") {
                const keys = Object.keys(spambl);
                if (keys.length === 0) return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.heading("✅ REGISTRY CLEAN", 2), V2.text("No active spam bans.")], V2_BLUE)]
                });

                const listItems = keys.map((id, i) => {
                    const entry = spambl[id];
                    const exp = entry.expires ? `<t:${Math.floor(entry.expires / 1000)}:R>` : "Never";
                    return `**${i + 1}.** \`${id}\` - Ends: ${exp}`;
                });

                const listString = listItems.join("\n");

                const container = V2.container([
                    V2.heading(`🤖 SPAM BLACKLIST (${keys.length})`, 2),
                    V2.text(listString.length > 2000 ? listString.substring(0, 2000) + "..." : listString),
                    V2.separator(),
                    V2.text("*BlueSealPrime Global Security*")
                ], V2_BLUE);

                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            if (subCommand === "remove") {
                const targetId = args[1];
                if (!targetId) return message.reply("❌ Provide ID.");

                if (!spambl[targetId]) return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.heading("⚠️ NOT LISTED", 3), V2.text("User is not in the spam list.")], require("../config").WARN_COLOR)]
                });

                delete spambl[targetId];
                fs.writeFileSync(DB_PATH, JSON.stringify(spambl, null, 2));

                const container = V2.container([
                    V2.heading("🔓 PARDON GRANTED", 2),
                    V2.text(`**User ID:** \`${targetId}\`\n**Status:** Auto-Ban Revoked`),
                    V2.separator(),
                    V2.text("User removed from spam blacklist.")
                ], V2_BLUE);

                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "spamblacklist", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] spamblacklist.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "spamblacklist", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("spamblacklist", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`spamblacklist\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_808
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_513
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_955
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_585
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_385
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_607
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_78
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_987
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_964
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_364
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_529
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_86
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_580
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_460
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_992
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_363
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_52
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_608
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_797
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_799
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_886
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_83
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_287
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_271
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_791
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_332
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_615
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_610
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_142
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_828
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_824
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_470
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_832
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_105
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_602
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_444
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_272
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_775
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_389
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_17
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_778
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_252
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_873
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_359
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_871
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_753
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_513
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_943
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_359
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_946
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_189
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_480
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_835
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_214
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_561
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_603
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_294
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_522
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_148
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_957
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_971
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_645
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_967
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_347
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_909
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_116
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_488
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_725
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_574
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_383
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_79
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_24
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_214
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_238
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_813
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_797
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_331
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_243
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_106
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_19
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_384
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_265
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_475
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_560
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_583
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_80
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_996
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_600
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_411
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_841
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_581
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_300
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_448
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_113
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_273
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_689
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_597
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_462
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_95
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SPAMBLACKLIST_ID_592
     */

};