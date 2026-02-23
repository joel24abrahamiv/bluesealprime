const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const axios = require("axios");

const cooldowns = new Map();

module.exports = {
    name: "mimic",
    description: "Bot adopts the server's identity — name, avatar & banner (Bot Owner only)",
    aliases: ["servermimic", "mimicserver"],
    usage: "!mimic | !mimic off",

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: MIMIC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("mimic") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "mimic", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Bot Owner Only.** This command is restricted.")], V2_RED)]
            });
        }

        const guild = message.guild;
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || message.client.token);

        // ── OFF / RESET ──
        if (args[0]?.toLowerCase() === "off") {
            try {
                await rest.patch(Routes.guildMember(guild.id, "@me"), {
                    body: { nick: null, avatar: null, banner: null }
                });
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🔄 MIMIC DEACTIVATED", 2),
                        V2.text("Bot identity restored to default.\n> Nickname, Avatar & Banner cleared for this server.")
                    ], V2_BLUE)]
                });
            } catch (e) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([V2.text(`❌ Failed to reset: ${e.message}`)], V2_RED)]
                });
            }
        }

        // ── COOLDOWN CHECK ──
        const now = Date.now();
        const CD = 3 * 60 * 1000;
        if (cooldowns.has(guild.id)) {
            const left = ((cooldowns.get(guild.id) + CD - now) / 1000 / 60).toFixed(1);
            if (now < cooldowns.get(guild.id) + CD) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("⏳ RATE LIMIT ACTIVE", 3),
                        V2.text(`Discord restricts identity changes. Wait **${left} min**.\nUse \`!mimic off\` to reset identity.`)
                    ], V2_RED)]
                });
            }
        }

        const statusMsg = await message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text(`🎭 **Adopting server identity of **${guild.name}**...**`)], V2_BLUE)]
        });

        const results = [];
        let body = {};

        // ── 1. NICKNAME → Server Name ──
        body.nick = guild.name.substring(0, 32); // Discord nickname limit
        results.push(`> 🏷️ **Nickname:** \`${body.nick}\``);

        // ── 2. AVATAR → Server Icon ──
        const iconUrl = guild.iconURL({ extension: "png", size: 1024, forceStatic: true });
        if (iconUrl) {
            try {
                const imgRes = await axios.get(iconUrl, { responseType: "arraybuffer" });
                const iconBase64 = `data:image/png;base64,${Buffer.from(imgRes.data, "binary").toString("base64")}`;
                body.avatar = iconBase64;
                results.push(`> 🖼️ **Avatar:** Server Icon applied`);
            } catch (e) {
                results.push(`> 🖼️ **Avatar:** ❌ Failed — ${e.message}`);
            }
        } else {
            results.push(`> 🖼️ **Avatar:** ⚠️ Server has no icon`);
        }

        // ── 3. BANNER → Server Banner ──
        const bannerUrl = guild.bannerURL({ extension: "png", size: 1024, forceStatic: true });
        if (bannerUrl) {
            try {
                const banRes = await axios.get(bannerUrl, { responseType: "arraybuffer" });
                const bannerBase64 = `data:image/png;base64,${Buffer.from(banRes.data, "binary").toString("base64")}`;
                body.banner = bannerBase64;
                results.push(`> 🏳️ **Banner:** Server Banner applied`);
            } catch (e) {
                results.push(`> 🏳️ **Banner:** ❌ Failed — ${e.message}`);
            }
        } else {
            results.push(`> 🏳️ **Banner:** ⚠️ Server has no banner`);
        }

        // ── APPLY ALL VIA REST AT ONCE ──
        try {
            await rest.patch(Routes.guildMember(guild.id, "@me"), { body });
            cooldowns.set(guild.id, now);

            await statusMsg.edit({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🎭 SERVER IDENTITY ADOPTED", 2),
                        V2.text(
                            `Bot is now mimicking **${guild.name}** in this server.\n\n` +
                            `${results.join("\n")}\n\n` +
                            `> *Use \`!mimic off\` to restore default identity.*`
                        )
                    ], iconUrl || V2.botAvatar(message)),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Identity Protocol*")
                ], V2_BLUE)]
            });

        } catch (err) {
            console.error("[Mimic]", err);
            let errMsg = err.message || "Unknown error";
            if (err.code === 50013) errMsg = "Missing permissions to change bot identity in this server.";
            if (err.code === 50035) errMsg = "Image too large or invalid format.";

            await statusMsg.edit({
                flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Identity adoption failed:** ${errMsg}`)], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "mimic", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] mimic.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "mimic", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("mimic", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`mimic\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | MIMIC_ID_844
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | MIMIC_ID_230
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | MIMIC_ID_322
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | MIMIC_ID_767
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | MIMIC_ID_810
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | MIMIC_ID_953
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | MIMIC_ID_397
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | MIMIC_ID_654
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | MIMIC_ID_886
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | MIMIC_ID_128
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | MIMIC_ID_940
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | MIMIC_ID_999
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | MIMIC_ID_971
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | MIMIC_ID_623
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | MIMIC_ID_937
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | MIMIC_ID_499
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | MIMIC_ID_476
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | MIMIC_ID_188
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | MIMIC_ID_486
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | MIMIC_ID_386
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | MIMIC_ID_413
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | MIMIC_ID_441
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | MIMIC_ID_161
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | MIMIC_ID_315
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | MIMIC_ID_681
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | MIMIC_ID_790
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | MIMIC_ID_716
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | MIMIC_ID_950
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | MIMIC_ID_220
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | MIMIC_ID_361
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | MIMIC_ID_330
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | MIMIC_ID_305
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | MIMIC_ID_786
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | MIMIC_ID_581
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | MIMIC_ID_694
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | MIMIC_ID_60
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | MIMIC_ID_315
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | MIMIC_ID_687
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | MIMIC_ID_287
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | MIMIC_ID_691
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | MIMIC_ID_453
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | MIMIC_ID_461
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | MIMIC_ID_7
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | MIMIC_ID_813
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | MIMIC_ID_446
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | MIMIC_ID_491
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | MIMIC_ID_556
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | MIMIC_ID_606
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | MIMIC_ID_166
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | MIMIC_ID_429
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | MIMIC_ID_226
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | MIMIC_ID_540
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | MIMIC_ID_165
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | MIMIC_ID_585
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | MIMIC_ID_321
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | MIMIC_ID_388
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | MIMIC_ID_809
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | MIMIC_ID_453
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | MIMIC_ID_239
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | MIMIC_ID_794
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | MIMIC_ID_784
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | MIMIC_ID_261
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | MIMIC_ID_361
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | MIMIC_ID_482
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | MIMIC_ID_250
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | MIMIC_ID_387
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | MIMIC_ID_183
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | MIMIC_ID_567
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | MIMIC_ID_887
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | MIMIC_ID_774
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | MIMIC_ID_299
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | MIMIC_ID_134
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | MIMIC_ID_10
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | MIMIC_ID_798
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | MIMIC_ID_236
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | MIMIC_ID_989
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | MIMIC_ID_431
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | MIMIC_ID_634
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | MIMIC_ID_111
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | MIMIC_ID_669
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | MIMIC_ID_432
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | MIMIC_ID_338
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | MIMIC_ID_695
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | MIMIC_ID_42
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | MIMIC_ID_213
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | MIMIC_ID_918
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | MIMIC_ID_10
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | MIMIC_ID_746
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | MIMIC_ID_826
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | MIMIC_ID_516
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | MIMIC_ID_521
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | MIMIC_ID_837
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | MIMIC_ID_823
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | MIMIC_ID_524
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | MIMIC_ID_741
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | MIMIC_ID_171
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | MIMIC_ID_924
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | MIMIC_ID_601
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | MIMIC_ID_67
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | MIMIC_ID_899
 */

};