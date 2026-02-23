const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "elistowners",
    description: "Global Sovereign Hierarchy Manifest",
    aliases: ["globalowners", "eloall"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: ELISTOWNERS
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("elistowners") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "elistowners", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** The Global manifest is restricted to the Lead Architect.")], V2_RED)]
            });
        }

        try {
            const OWNERS_DB = path.join(__dirname, "../data/owners.json");
            if (!fs.existsSync(OWNERS_DB)) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("📂 **SYSTEM:** No global extra owner records exist.")], V2_BLUE)]
                });
            }

            const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
            const entries = Object.entries(db);

            if (entries.length === 0) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([V2.text("📂 **SYSTEM:** No global extra owner records exist.")], V2_BLUE)]
                });
            }

            const pages = [];
            const itemsPerPage = 3;

            const flatList = [];
            for (const [guildId, owners] of entries) {
                const guild = message.client.guilds.cache.get(guildId) || await message.client.guilds.fetch(guildId).catch(() => null);
                const guildName = guild ? guild.name : `Unknown Guild (${guildId})`;

                owners.forEach(o => {
                    flatList.push({
                        guildId,
                        guildName,
                        ownerId: typeof o === 'string' ? o : o.id,
                        addedBy: o.addedBy,
                        addedAt: o.addedAt
                    });
                });
            }

            if (flatList.length === 0) {
                return message.reply({ content: null, flags: V2.flag, components: [V2.container([V2.text("📂 **SYSTEM:** Global manifest is currently empty.")], V2_BLUE)] });
            }

            for (let i = 0; i < flatList.length; i += itemsPerPage) {
                const chunk = flatList.slice(i, i + itemsPerPage);
                const listStr = (await Promise.all(chunk.map(async item => {
                    const user = message.client.users.cache.get(item.ownerId) || await message.client.users.fetch(item.ownerId).catch(() => null);
                    const tag = user ? user.tag : "Unknown Entity";
                    return `### **${tag}**\n` +
                        `> • **Guild:** \`${item.guildName}\` (\`${item.guildId}\`)\n` +
                        `> • **ID:** \`${item.ownerId}\`\n` +
                        `> • **Promotion:** ${item.addedAt ? `<t:${Math.floor(item.addedAt / 1000)}:R>` : "*Date Unknown*"}`;
                }))).join("\n\n");

                pages.push(V2.container([
                    V2.section([
                        V2.heading("🌐 GLOBAL SOVEREIGN MANIFEST", 2),
                        V2.text(
                            `### **[ ARCHITECT_LEVEL_MANIFEST ]**\n\n` +
                            `Displaying all entities currently holding delegated sovereign authority across the network.\n\n` +
                            listStr
                        )
                    ], message.client.user.displayAvatarURL({ size: 512 })),
                    V2.separator(),
                    V2.text(`*BlueSealPrime • Global Registry • Layer X*`)
                ], "#000000"));
            }

            let currentPage = 0;
            const getComponents = (pageIdx) => {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === 0),
                    new ButtonBuilder()
                        .setCustomId("page_info")
                        .setLabel(`Page ${pageIdx + 1} / ${pages.length}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("➡️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === pages.length - 1)
                );
                //pages[pageIdx] is the Container component. We must wrap it in an array along with the ActionRow button row.
                return [pages[pageIdx], row];
            };

            const msg = await message.channel.send({
                content: null,
                flags: V2.flag,
                components: getComponents(currentPage)
            });

            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 300000
            });

            collector.on("collect", async (i) => {
                if (i.customId === "prev") currentPage--;
                if (i.customId === "next") currentPage++;
                await i.update({ components: getComponents(currentPage) });
            });

            collector.on("end", () => {
                msg.edit({ components: getComponents(currentPage) }).catch(() => { });
            });

        } catch (err) {
            console.error(err);
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **ERROR:** Failed to access records.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "elistowners", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] elistowners.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "elistowners", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("elistowners", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`elistowners\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_956
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_267
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_685
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_730
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_435
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_55
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_752
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_295
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_76
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_623
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_150
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_615
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_781
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_956
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_282
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_567
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_559
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_171
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_915
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_644
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_339
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_151
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_277
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_279
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_681
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_920
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_444
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_879
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_647
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_983
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_837
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_301
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_607
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_784
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_442
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_430
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_231
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_730
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_934
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_635
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_626
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_123
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_687
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_311
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_78
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_193
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_443
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_708
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_162
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_903
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_472
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_229
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_196
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_44
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_95
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_76
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_360
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_80
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_290
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_721
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_297
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_714
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_7
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_279
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_80
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_293
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_748
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_483
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_631
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_708
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_569
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_648
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_929
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_108
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_93
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_133
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_161
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_831
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_71
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_477
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_107
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_352
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_176
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_938
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_938
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_333
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_227
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_549
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_440
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_297
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_84
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_233
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_314
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_361
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_3
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_620
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_720
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_701
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_501
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | ELISTOWNERS_ID_93
 */

};