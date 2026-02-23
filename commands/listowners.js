const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "listowners",
    description: "Interactive Sovereign Hierarchy Panel",
    aliases: ["owners", "elo", "authority"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LISTOWNERS
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("listowners") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "listowners", cooldown);
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
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** Hierarchy manifestations are restricted to the Lead Architect or Node Monarch.")], V2_RED)]
            });
        }

        try {
            const globalOwner = message.client.users.cache.get(BOT_OWNER_ID) || await message.client.users.fetch(BOT_OWNER_ID).catch(() => null);
            const serverOwner = await message.guild.fetchOwner().catch(() => null);

            const OWNERS_DB = path.join(__dirname, "../data/owners.json");
            let extraOwnersRaw = [];
            if (fs.existsSync(OWNERS_DB)) {
                try {
                    const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
                    extraOwnersRaw = db[message.guild.id] || [];
                } catch (e) { }
            }

            let currentPage = 0;

            const getPanel = async (pageIdx) => {
                const components = [];
                let color = "#000000";

                if (pageIdx === 0) {
                    components.push(
                        V2.section([
                            V2.heading("🌐 PEAK AUTHORITY: GLOBAL ARCHITECT", 2),
                            V2.text(
                                `### **[ SUPREME_DEITY_FOUNDATION ]**\n\n` +
                                `**The Architect** holds absolute dominion over the bot kernel and all connected server nodes.\n\n` +
                                `> **Identity:** ${globalOwner ? `**${globalOwner.tag}**` : "Unknown"}\n` +
                                `> **Sovereign ID:** \`${BOT_OWNER_ID}\`\n` +
                                `> **Status:** \`ETERNAL ALPHA\``
                            )
                        ], globalOwner ? globalOwner.displayAvatarURL({ dynamic: true, size: 512 }) : null),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Layer 0 - Core Foundation*")
                    );
                    color = "#000000";
                } else if (pageIdx === 1) {
                    components.push(
                        V2.section([
                            V2.heading("👑 DOMINION AUTHORITY: SERVER OWNER", 2),
                            V2.text(
                                `### **[ THE_KING_PROTOCOL ]**\n\n` +
                                `The **Server Owner** reigns over this specific server shard with absolute delegated command.\n\n` +
                                `> **Monarch:** ${serverOwner ? `**${serverOwner.user.tag}**` : "Unknown"}\n` +
                                `> **Discord ID:** \`${message.guild.ownerId}\`\n` +
                                `> **Ascension:** <t:${Math.floor(message.guild.createdTimestamp / 1000)}:R>\n\n` +
                                `> **Status:** \`ACTIVE SOVEREIGN\``
                            )
                        ], serverOwner ? serverOwner.user.displayAvatarURL({ dynamic: true, size: 512 }) : null),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Layer 1 - Server Authority*")
                    );
                    color = "#FFD700";
                } else {
                    let extraOwnersList = extraOwnersRaw.length === 0
                        ? "\n> *No individuals currently hold delegated sovereign authority.*"
                        : (await Promise.all(extraOwnersRaw.map(async (o) => {
                            const id = typeof o === 'string' ? o : o.id;
                            const user = message.client.users.cache.get(id) || await message.client.users.fetch(id).catch(() => null);
                            const tag = user ? user.tag : "Unknown Entity";
                            const addedBy = o.addedBy ? `<@${o.addedBy}>` : "System/Legacy";
                            const addedAt = o.addedAt ? `<t:${Math.floor(o.addedAt / 1000)}:R>` : "*Date Unknown*";
                            return `### **${tag}**\n> • **ID:** \`${id}\`\n> • **Appointed By:** ${addedBy}\n> • **Promotion:** ${addedAt}`;
                        }))).join("\n\n");

                    components.push(
                        V2.section([
                            V2.heading("🤝 DELEGATED AUTHORITY: EXTRA OWNERS", 2),
                            V2.text(
                                `### **[ TRUST_CHAIN_MANIFEST ]**\n\n` +
                                `These entities possess **Acting Owner** status, granting them immunity and administrative parity.\n\n` +
                                extraOwnersList
                            )
                        ], message.client.user.displayAvatarURL({ dynamic: true, size: 512 })),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Layer 2 - Trust Delegation*")
                    );
                    color = "#0099ff";
                }

                components.push(V2.separator());

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === 0),
                    new ButtonBuilder()
                        .setCustomId("page_info")
                        .setLabel(`Layer ${pageIdx + 1} / 3`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("➡️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(pageIdx === 2)
                );
                components.push(row);

                return V2.container(components, color);
            };

            const msg = await message.channel.send({
                content: null,
                flags: V2.flag,
                components: [await getPanel(currentPage)]
            });

            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 300000
            });

            collector.on("collect", async (i) => {
                if (i.customId === "prev") currentPage--;
                if (i.customId === "next") currentPage++;
                await i.update({
                    components: [await getPanel(currentPage)]
                });
            });

            collector.on("end", async () => {
                msg.edit({ components: [await getPanel(currentPage)] }).catch(() => { });
            });
        } catch (err) {
            console.error(err);
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **ERROR:** Failed to load sovereign hierarchy panel.")], V2_RED)]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "listowners", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] listowners.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "listowners", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("listowners", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`listowners\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_598
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_202
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_845
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_359
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_407
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_451
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_997
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_2
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_507
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_940
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_930
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_626
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_985
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_983
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_239
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_27
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_946
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_312
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_838
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_248
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_458
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_602
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_336
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_553
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_183
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_673
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_477
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_290
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_671
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_930
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_381
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_544
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_240
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_876
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_301
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_574
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_722
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_369
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_258
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_730
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_479
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_97
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_820
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_35
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_909
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_0
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_425
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_725
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_658
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_277
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_999
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_564
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_336
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_613
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_469
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_920
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_210
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_135
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_103
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_926
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_905
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_109
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_684
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_202
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_150
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_570
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_438
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_251
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_760
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_509
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_198
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_0
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_487
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_767
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_400
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_210
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_341
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_180
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_479
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_393
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_255
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_664
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_468
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_20
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_774
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_726
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_240
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_141
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_203
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_80
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_556
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_130
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_313
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_357
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_708
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_358
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_954
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_690
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_313
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LISTOWNERS_ID_123
 */

};