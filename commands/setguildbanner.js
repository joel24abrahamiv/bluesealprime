const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");
const axios = require("axios");

const cooldowns = new Map();

module.exports = {
    name: "setguildbanner",
    description: "Set the bot's banner ONLY for this guild (Force Attempt)",
    usage: "!setguildbanner <url | default>",
    aliases: ["setbanner"],
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SETGUILDBANNER
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("setguildbanner") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "setguildbanner", cooldown);
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
                await rest.patch(Routes.guildMember(message.guild.id, '@me'), { body: { banner: null } });

                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🔄 IDENTITY RESET", 2),
                        V2.text("Guild Banner has been restored to default.")
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
                            V2.text(`Discord API restricts banner updates. Please wait **${timeLeft} minutes**.\nIf you want to clear it, type \`!setguildbanner default\`.`)
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

            const base64Banner = `data:${mime};base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

            // REST API BYPASS
            await rest.patch(
                Routes.guildMember(message.guild.id, '@me'),
                { body: { banner: base64Banner } }
            );

            // Set cooldown
            cooldowns.set(message.guild.id, now);

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🎭 BOT IDENTITY UPDATED", 2),
                        V2.text(`**Scope:** Local Guild Only\n**Target:** Bot Banner\n**Mode:** Direct REST Injection`)
                    ],
                    url
                ),
                V2.separator(),
                V2.text("*BlueSealPrime Identity Protocol*")
            ], V2_BLUE);

            message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            let errorMsg = "Failed to update guild banner.";
            if (err.message && err.message.includes("Premium") || err.code === 50035) errorMsg = "Discord API Limitation: This feature likely requires Server Boosts (Level 2).";
            else if (err.message) errorMsg = err.message;

            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Update Failed:** ${errorMsg}`)], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setguildbanner", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] setguildbanner.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "setguildbanner", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("setguildbanner", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`setguildbanner\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_550
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_265
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_691
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_73
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_302
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_37
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_838
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_322
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_582
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_302
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_962
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_463
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_355
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_633
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_466
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_852
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_508
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_243
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_956
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_524
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_20
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_908
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_177
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_255
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_225
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_100
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_969
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_909
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_487
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_420
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_441
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_616
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_688
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_776
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_185
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_8
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_736
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_569
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_398
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_570
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_319
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_970
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_520
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_471
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_956
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_29
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_266
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_196
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_855
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_917
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_953
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_753
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_696
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_935
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_448
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_219
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_55
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_612
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_736
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_228
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_503
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_85
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_820
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_89
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_956
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_679
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_779
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_115
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_307
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_562
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_337
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_863
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_79
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_771
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_254
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_398
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_233
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_27
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_353
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_723
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_981
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_674
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_414
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_658
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_662
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_741
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_236
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_489
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_404
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_555
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_258
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_68
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_256
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_784
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_413
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_390
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_341
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_37
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_951
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SETGUILDBANNER_ID_683
 */

};