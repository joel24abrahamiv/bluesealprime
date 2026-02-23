const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, ERROR_COLOR, WARN_COLOR } = require("../config");

module.exports = {
    name: "blacklist",
    description: "Globally blacklist a user from using the bot and joining servers.",
    aliases: ["bl"],
    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: BLACKLIST
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("blacklist") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "blacklist", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
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
                    V2.text("You do not have permission to manage the Global Blacklist.")
                ], ERROR_COLOR)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/blacklist.json");

        // Load & Migrate
        let blacklist = {};
        if (fs.existsSync(DB_PATH)) {
            try {
                const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
                if (Array.isArray(data)) {
                    // MIGRATION: Convert Array to Object
                    data.forEach(id => blacklist[id] = { reason: "Legacy Ban", expires: null, timestamp: Date.now() });
                    fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));
                    console.log("🔄 Migrated Blacklist to V2 Schema");
                } else {
                    blacklist = data;
                }
            } catch (e) { }
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand || (subCommand !== "add" && subCommand !== "remove" && subCommand !== "list")) {
            const container = V2.container([
                V2.section([
                    V2.heading("🚫 GLOBAL BLACKLIST CONTROL", 2),
                    V2.text("Manage the global security blocklist.")
                ], "https://cdn-icons-png.flaticon.com/512/3524/3524812.png"),
                V2.separator(),
                V2.heading("🛠️ OPERATIONS", 3),
                V2.text(`> \`!blacklist add <ID> [days] [reason]\` - **Block User**\n> \`!blacklist remove <ID>\` - **Unblock User**\n> \`!blacklist list\` - **View Registry**`),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security Network*")
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "add") {
            let targetId = args[1];
            if (!targetId) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("❌ MISSING TARGET", 3), V2.text("Please provide a User ID or Mention.")], ERROR_COLOR)]
            });

            // Extract ID from mention if present
            const mentionMatch = targetId.match(/^<@!?(\d{17,20})>$/);
            if (mentionMatch) targetId = mentionMatch[1];

            if (!/^\d{17,20}$/.test(targetId)) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("❌ INVALID ID", 3), V2.text("Please provide a valid User ID (17-20 digits).")], ERROR_COLOR)]
            });

            if (blacklist[targetId]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ ALREADY LISTED", 3), V2.text("User is already in the blacklist.")], WARN_COLOR)]
            });

            // Parse Duration (optional)
            let days = 0;
            let reasonStartIndex = 2; // Default: args[0]=add, args[1]=ID, args[2]=Reason OR Days

            // Check if args[2] is a number (days)
            if (args[2] && !isNaN(args[2])) {
                days = parseInt(args[2]);
                reasonStartIndex = 3;
            }

            const reason = args.slice(reasonStartIndex).join(" ") || "Manual Ban";
            const expires = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : null;
            const expiryText = days > 0 ? `${days} Days` : "Permanent";
            const expiryDate = expires ? `<t:${Math.floor(expires / 1000)}:R>` : "Never";

            try {
                const dmContainer = V2.container([
                    V2.section(
                        [
                            V2.heading("🚫 SECURITY ALERT", 2),
                            V2.text(`You have been **globally blacklisted** from BlueSealPrime services.`)
                        ],
                        "https://cdn-icons-png.flaticon.com/512/3524/3524812.png"
                    ),
                    V2.separator(),
                    V2.heading("📋 ACCESS REVOKED", 3),
                    V2.text(`> **Reason:** ${reason}\n> **Duration:** ${expiryText}`),
                    V2.separator(),
                    V2.text(`*BlueSealPrime Global Security*`)
                ], V2_RED);

                const user = await message.client.users.fetch(targetId).catch(() => null);
                if (user) await user.send({ content: null, flags: V2.flag, components: [dmContainer] }).catch(() => { });
            } catch (e) { }

            blacklist[targetId] = {
                reason: reason,
                expires: expires,
                timestamp: Date.now()
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🚫 SECURITY ACTION: BLOCK", 2),
                        V2.text(`**Target:** <@${targetId}>\n**ID:** \`${targetId}\`\n**Status:** Globally Blacklisted`)
                    ],
                    "https://cdn-icons-png.flaticon.com/512/3524/3524812.png" // Shield
                ),
                V2.separator(),
                V2.heading("📝 DETAILS", 3),
                V2.text(`> **Duration:** ${expiryText} (${expiryDate})\n> **Reason:** ${reason}`),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security Network*")
            ], V2_RED);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "remove") {
            const targetId = args[1];
            if (!targetId) return message.reply("❌ Provide ID.");

            if (!blacklist[targetId]) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ NOT LISTED", 3), V2.text("User is not in the blacklist.")], WARN_COLOR)]
            });

            delete blacklist[targetId];
            fs.writeFileSync(DB_PATH, JSON.stringify(blacklist, null, 2));

            const container = V2.container([
                V2.heading("🔓 SECURITY ACTION: UNBLOCK", 2),
                V2.text(`**User ID:** \`${targetId}\`\n**Status:** Access Restored`),
                V2.separator(),
                V2.text("The target has been removed from the blacklist.")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }

        if (subCommand === "list") {
            const keys = Object.keys(blacklist);
            if (keys.length === 0) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("📋 BLACKLIST EMPTY", 2), V2.text("No users are currently blacklisted.")], V2_BLUE)]
            });

            // Simple pagination or truncation
            const listItems = keys.map((id, i) => {
                const entry = blacklist[id];
                const exp = entry.expires ? `<t:${Math.floor(entry.expires / 1000)}:R>` : "Never";
                return `**${i + 1}.** \`${id}\` (${entry.reason}) - Exp: ${exp}`;
            });

            const listString = listItems.join("\n");

            const container = V2.container([
                V2.heading(`🚫 GLOBAL BLACKLIST (${keys.length})`, 2),
                V2.text(listString.length > 2000 ? listString.substring(0, 2000) + "..." : listString),
                V2.separator(),
                V2.text("*BlueSealPrime Global Security*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [container] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "blacklist", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] blacklist.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "blacklist", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("blacklist", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`blacklist\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_337
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_677
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_447
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_294
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_440
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_628
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_213
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_906
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_238
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_73
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_158
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_795
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_651
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_886
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_724
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_985
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_441
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_971
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_175
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_643
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_435
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_752
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_265
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_450
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_918
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_395
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_475
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_969
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_411
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_599
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_180
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_342
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_701
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_709
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_491
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_981
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_201
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_847
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_779
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_613
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_478
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_771
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_305
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_233
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_735
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_378
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_348
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_416
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_43
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_753
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_421
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_630
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_493
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_722
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_977
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_943
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_99
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_941
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_380
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_277
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_657
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_61
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_397
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_451
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_508
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_622
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_856
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_896
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_828
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_114
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_114
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_496
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_165
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_450
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_192
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_322
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_820
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_863
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_510
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_9
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_413
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_634
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_301
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_230
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_954
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_488
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_497
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_212
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_654
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_921
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_420
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_697
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_438
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_709
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_515
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_946
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_369
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_552
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_682
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | BLACKLIST_ID_576
 */

};