const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");
const axios = require("axios");

const cooldowns = new Map();

module.exports = {
    name: "setguildavatar",
    description: "Set the bot's avatar ONLY for this guild (Force Attempt)",
    usage: "!setguildavatar <url | default>",
    aliases: ["setavatar", "pfp", "setpfp"],
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SETGUILDAVATAR
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("setguildavatar") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "setguildavatar", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **SOVEREIGN ONLY:** You are not authorized.")], V2_RED)]
            });
        }

        let url = message.attachments.first()?.url;

        if (!url && args.length > 0) {
            // Find the first argument that looks like a URL
            const foundUrl = args.find(arg => arg.startsWith("http://") || arg.startsWith("https://"));
            if (foundUrl) {
                url = foundUrl;
            } else if (args[0].toLowerCase() === "default") {
                url = "default";
            }
        }

        if (!url) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Missing Image Source:** Please provide a URL, attach an image, or type `default`.")], V2_RED)]
            });
        }

        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v10');
        require('dotenv').config(); // Ensure token is loaded
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || message.client.token);

        try {
            // Check for 'default' reset
            if (url.toLowerCase() === "default") {
                await rest.patch(Routes.guildMember(message.guild.id, '@me'), { body: { avatar: null } });

                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🔄 IDENTITY RESET", 2),
                        V2.text("Guild Avatar has been restored to default.")
                    ], V2_BLUE)]
                });
            }

            // RATE LIMIT CHECK (3 Minutes)
            const now = Date.now();
            const cdAmount = 3 * 60 * 1000; // 3 Minutes
            if (cooldowns.has(message.guild.id)) {
                const expires = cooldowns.get(message.guild.id) + cdAmount;
                if (now < expires) {
                    const timeLeft = ((expires - now) / 1000 / 60).toFixed(1);
                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.heading("⏳ RATE LIMIT ACTIVE", 3),
                            V2.text(`Discord API restricts avatar updates. Please wait **${timeLeft} minutes**.\nIf you want to clear it, type \`!setguildavatar default\`.`)
                        ], V2_RED)]
                    });
                }
            }

            // Check for Tenor/Giphy links which are HTML pages, not images
            if (url.includes("tenor.com") && !url.endsWith(".gif")) {
                throw new Error("Invalid URL: Tenor links are web pages. Right-click the GIF and 'Copy Image Link' (ending in .gif).");
            }

            // Fetch the image and convert to base64 buffer for Discord API
            const response = await axios.get(url, { responseType: 'arraybuffer' });

            // Determine mime type from URL or fallback
            let mime = 'image/png';
            if (url.endsWith('.gif') || url.includes('.gif')) mime = 'image/gif';
            else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) mime = 'image/jpeg';
            else if (url.endsWith('.webp')) mime = 'image/webp';
            else if (url.startsWith('data:image')) mime = '';

            const base64Avatar = `data:${mime};base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

            // Execute Avatar Change
            await rest.patch(
                Routes.guildMember(message.guild.id, '@me'),
                { body: { avatar: base64Avatar } }
            );

            // Set cooldown
            cooldowns.set(message.guild.id, now);

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🎭 BOT IDENTITY UPDATED", 2),
                        V2.text(`**Scope:** Local Guild Only\n**Target:** Bot Avatar\n**Mode:** Direct REST Injection`)
                    ],
                    url
                ),
                V2.separator(),
                V2.text("*BlueSealPrime Identity Protocol*")
            ], V2_BLUE);

            message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            let errorMsg = err.message || "Failed to update guild avatar.";

            if (err.code === 50013) errorMsg = "Missing Permissions (I cannot change my own nickname/avatar in this server).";
            if (err.code === 50035) errorMsg = "Invalid Form Body (Image too large or invalid URL format).";
            if (err.message.includes("Premium")) errorMsg = "Discord API Error: Server likely requires Boosts.";

            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Update Failed:** ${errorMsg}`)], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setguildavatar", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] setguildavatar.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setguildavatar", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("setguildavatar", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`setguildavatar\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_25
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_675
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_624
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_530
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_304
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_456
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_195
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_442
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_738
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_139
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_796
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_37
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_643
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_949
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_805
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_134
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_576
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_24
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_593
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_581
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_44
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_394
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_587
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_467
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_96
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_702
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_620
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_880
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_460
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_261
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_960
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_967
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_218
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_948
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_604
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_517
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_12
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_108
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_991
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_883
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_353
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_751
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_24
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_839
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_824
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_152
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_120
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_812
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_278
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_246
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_163
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_821
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_222
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_939
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_897
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_431
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_247
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_308
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_664
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_370
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_114
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_823
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_515
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_817
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_776
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_970
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_865
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_331
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_372
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_398
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_780
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_11
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_637
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_364
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_735
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_426
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_413
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_302
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_797
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_995
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_980
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_625
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_871
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_780
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_21
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_142
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_630
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_682
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_908
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_306
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_258
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_496
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_467
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_546
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_490
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_922
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_830
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_475
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_772
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SETGUILDAVATAR_ID_709
 */

};