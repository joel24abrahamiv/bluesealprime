const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");

module.exports = {
    name: "restore",
    description: "Military-Grade Server Restoration (Hyper-Speed)",
    usage: "!restore <id>",
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: RESTORE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("restore") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "restore", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);

        // Authorization Check
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can initiate a restoration.")], V2_RED)]
            });
        }

        const backupId = args[0];
        if (!backupId) return message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text("⚠️ **Missing Parameter:** Please provide an archive ID.")], V2_RED)]
        });

        const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
        if (!fs.existsSync(filePath)) return message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text("❌ **Archive Fault:** Specified ID does not exist.")], V2_RED)]
        });

        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (e) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Archive Corrupted:** Failed to parse JSON data.")], V2_RED)]
            });
        }

        // Step 1: Confirmation (plain content + button row — no V2 flag mix)
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("☢️ CONFIRM NUCLEAR RESTORE").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancel").setLabel("✖️ ABORT").setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({
            content: `## ☢️ NUCLEAR RESTORE AUTHORIZATION\n> **Archive:** \`${data.id}\`\n> **Server Snapshot:** ${data.guildName}\n> **Roles:** \`${data.roles.length}\` • **Channels:** \`${data.channels.length}\`\n\n⚠️ This will **PURGE** all current channels and roles, then rebuild from the archive.\n**Command channel will be preserved. Bot roles will stay intact.**`,
            components: [confirmRow]
        });

        const filter = i => i.user.id === message.author.id;
        try {
            const i = await msg.awaitMessageComponent({ filter, time: 40000 });
            if (i.customId === "cancel") {
                return i.update({ content: "❌ **Sequence Aborted.** Restoration protocol terminated.", components: [] });
            }

            await i.update({ content: "☣️ **Sequence Authorized.** Initializing sovereign purge...", components: [] });

            const getStatusContainer = (step) => V2.container([
                V2.section([
                    V2.heading("☣️ NUCLEAR RESTORATION: ACTIVE", 2),
                    V2.text(step)
                ], botAvatar),
                V2.separator(),
                V2.text("*BlueSealPrime • Hyper-Speed Reconstruction Protocol*")
            ], V2_RED);

            const progress = await message.channel.send({
                content: null,
                flags: V2.flag,
                components: [getStatusContainer("```diff\n- Phase 0: Initializing Sovereign Purge\n```")]
            });

            try {
                // ───── PHASE 0: SOVEREIGN PURGE (Full Parallel) ─────
                const currentChanId = message.channel.id;
                const botMember = await message.guild.members.fetchMe();
                const botMaxPos = botMember.roles.highest.position;

                const channels = message.guild.channels.cache.filter(c => c.id !== currentChanId);
                const roles = message.guild.roles.cache.filter(r => !r.managed && r.id !== message.guild.id && r.position < botMaxPos);
                const emojis = message.guild.emojis.cache;
                const stickers = message.guild.stickers.cache;

                // 🚀 HYPER PARALLEL PURGE — all at once
                await Promise.all([
                    ...channels.map(c => c.delete().catch(() => { })),
                    ...roles.map(r => r.delete().catch(() => { })),
                    ...emojis.map(e => e.delete().catch(() => { })),
                    ...stickers.map(s => s.delete().catch(() => { }))
                ]);

                // Sync Cache
                await Promise.all([message.guild.roles.fetch(), message.guild.channels.fetch()]);

                // ───── PHASE 1: SERVER DNA SYNC ─────
                await progress.edit({ components: [getStatusContainer("```diff\n+ Phase 0: Sovereign Purge Complete\n- Phase 1: Reconstructing Structural DNA\n```")] });

                if (data.settings) {
                    await message.guild.edit({
                        verificationLevel: data.settings.verificationLevel,
                        defaultMessageNotifications: data.settings.defaultMessageNotifications,
                        explicitContentFilter: data.settings.explicitContentFilter,
                        afkTimeout: data.settings.afkTimeout
                    }).catch(() => { });
                }

                // ───── PHASE 2: ROLE HIERARCHY (Full Parallel) ─────
                await progress.edit({ components: [getStatusContainer("```diff\n+ Phase 1: DNA Sync Complete\n- Phase 2: Aligning Role Hierarchy\n```")] });

                const roleMap = new Map();
                const roleResults = await Promise.all(
                    data.roles.map(rData =>
                        message.guild.roles.create({
                            name: rData.name,
                            color: rData.color,
                            permissions: BigInt(rData.permissions),
                            hoist: rData.hoist,
                            mentionable: rData.mentionable,
                            reason: "Perfect Restore"
                        }).then(newRole => ({ name: rData.name, id: newRole.id })).catch(() => null)
                    )
                );
                roleResults.forEach(r => { if (r) roleMap.set(r.name, r.id); });

                // ───── PHASE 3: CHANNEL WAVE DEPLOYMENT (Full Parallel) ─────
                await progress.edit({ components: [getStatusContainer("```diff\n+ Phase 2: Role Hierarchy Synced\n- Phase 3: Deploying Channel Waves\n```")] });

                const createdCats = new Map();
                const originalRoleLookup = new Map(data.roles.map(r => [r.id, r.name]));

                const mapOverwrites = (oldOverwrites) => {
                    if (!oldOverwrites) return [];
                    return oldOverwrites.map(o => {
                        if (o.type === 1) return { id: o.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        if (o.id === data.guildId) return { id: message.guild.id, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                        const name = originalRoleLookup.get(o.id);
                        const newId = roleMap.get(name);
                        return newId ? { id: newId, type: o.type, allow: BigInt(o.allow), deny: BigInt(o.deny) } : null;
                    }).filter(o => o !== null);
                };

                // WAVE 1: Categories in parallel
                const categoryData = data.channels.filter(c => c.type === ChannelType.GuildCategory);
                const catResults = await Promise.all(
                    categoryData.map(catData =>
                        message.guild.channels.create({
                            name: catData.name,
                            type: ChannelType.GuildCategory,
                            position: catData.position,
                            permissionOverwrites: mapOverwrites(catData.overwrites)
                        }).then(cat => ({ name: catData.name, id: cat.id, children: catData.children })).catch(() => null)
                    )
                );
                catResults.forEach(c => { if (c) createdCats.set(c.name, c.id); });

                // WAVE 2: Sub-channels (all cats in parallel, children of each cat in parallel)
                await Promise.all(
                    catResults.filter(c => c && c.children?.length).map(cat =>
                        Promise.all(
                            cat.children.map(child =>
                                message.guild.channels.create({
                                    name: child.name,
                                    type: child.type,
                                    topic: child.topic,
                                    bitrate: child.bitrate,
                                    userLimit: child.userLimit,
                                    nsfw: child.nsfw,
                                    parentId: createdCats.get(cat.name),
                                    position: child.rawPosition || child.position,
                                    permissionOverwrites: mapOverwrites(child.overwrites)
                                }).catch(() => { })
                            )
                        )
                    )
                );

                // WAVE 3: Orphaned channels in parallel
                const orphans = data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children);
                await Promise.all(
                    orphans.map(orphan =>
                        message.guild.channels.create({
                            name: orphan.name,
                            type: orphan.type,
                            position: orphan.rawPosition || orphan.position,
                            permissionOverwrites: mapOverwrites(orphan.overwrites)
                        }).catch(() => { })
                    )
                );

                // ───── PHASE 4: FINALIZATION ─────
                const finalContainer = V2.container([
                    V2.section([
                        V2.heading("✅ RESTORATION COMPLETE", 2),
                        V2.text(`### **[ ZERO-DAY SYNC SUCCESS ]**\nServer **${data.guildName}** reconstructed at hyper-speed.\n\n> **Channels:** \`${data.channels.length}\`\n> **Roles:** \`${data.roles.length}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Total Synchronization Complete*")
                ], "#00FF7F");

                await progress.edit({ components: [finalContainer] });

            } catch (err) {
                console.error(err);
                const faultContainer = V2.container([V2.text("❌ **Critical Restoration Fault.** Error during deployment.")], V2_RED);
                progress.edit({ components: [faultContainer] });
            }
        } catch (e) {
            return message.reply({ components: [V2.container([V2.text("🕙 **Restore Action Timed Out.**")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "restore", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] restore.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "restore", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("restore", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`restore\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | RESTORE_ID_249
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | RESTORE_ID_94
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | RESTORE_ID_444
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | RESTORE_ID_116
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | RESTORE_ID_501
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | RESTORE_ID_264
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | RESTORE_ID_111
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | RESTORE_ID_811
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | RESTORE_ID_153
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | RESTORE_ID_970
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | RESTORE_ID_176
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | RESTORE_ID_535
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | RESTORE_ID_107
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | RESTORE_ID_763
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | RESTORE_ID_416
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | RESTORE_ID_563
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | RESTORE_ID_552
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | RESTORE_ID_975
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | RESTORE_ID_937
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | RESTORE_ID_999
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | RESTORE_ID_390
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | RESTORE_ID_39
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | RESTORE_ID_139
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | RESTORE_ID_644
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | RESTORE_ID_772
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | RESTORE_ID_974
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | RESTORE_ID_934
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | RESTORE_ID_282
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | RESTORE_ID_239
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | RESTORE_ID_53
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | RESTORE_ID_577
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | RESTORE_ID_451
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | RESTORE_ID_617
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | RESTORE_ID_726
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | RESTORE_ID_913
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | RESTORE_ID_843
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | RESTORE_ID_212
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | RESTORE_ID_39
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | RESTORE_ID_409
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | RESTORE_ID_838
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | RESTORE_ID_162
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | RESTORE_ID_319
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | RESTORE_ID_362
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | RESTORE_ID_903
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | RESTORE_ID_676
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | RESTORE_ID_365
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | RESTORE_ID_873
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | RESTORE_ID_823
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | RESTORE_ID_903
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | RESTORE_ID_143
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | RESTORE_ID_715
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | RESTORE_ID_89
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | RESTORE_ID_13
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | RESTORE_ID_362
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | RESTORE_ID_963
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | RESTORE_ID_301
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | RESTORE_ID_730
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | RESTORE_ID_802
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | RESTORE_ID_479
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | RESTORE_ID_672
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | RESTORE_ID_120
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | RESTORE_ID_656
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | RESTORE_ID_240
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | RESTORE_ID_212
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | RESTORE_ID_543
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | RESTORE_ID_736
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | RESTORE_ID_3
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | RESTORE_ID_841
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | RESTORE_ID_471
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | RESTORE_ID_391
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | RESTORE_ID_63
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | RESTORE_ID_833
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | RESTORE_ID_603
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | RESTORE_ID_238
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | RESTORE_ID_706
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | RESTORE_ID_457
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | RESTORE_ID_509
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | RESTORE_ID_797
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | RESTORE_ID_770
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | RESTORE_ID_854
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | RESTORE_ID_950
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | RESTORE_ID_197
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | RESTORE_ID_986
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | RESTORE_ID_456
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | RESTORE_ID_937
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | RESTORE_ID_369
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | RESTORE_ID_721
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | RESTORE_ID_5
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | RESTORE_ID_264
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | RESTORE_ID_627
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | RESTORE_ID_90
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | RESTORE_ID_135
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | RESTORE_ID_452
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | RESTORE_ID_199
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | RESTORE_ID_246
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | RESTORE_ID_170
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | RESTORE_ID_994
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | RESTORE_ID_740
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | RESTORE_ID_403
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | RESTORE_ID_776
 */

};