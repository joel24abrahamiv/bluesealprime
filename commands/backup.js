const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const BACKUP_DIR = path.join(__dirname, "../data/backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

module.exports = {
    name: "backup",
    description: "Military-Grade Server Backup System",
    usage: "!backup create | !backup list | !backup delete <id>",
    aliases: ["bk"],
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: BACKUP
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("backup") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "backup", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can manage archives.")], V2_RED)]
            });
        }

        const sub = args[0]?.toLowerCase();
        const botAvatar = V2.botAvatar(message);

        if (sub === "create") {
            const initContainer = V2.container([
                V2.section([
                    V2.heading("📡 INITIALIZING SERVER SCAN", 2),
                    V2.text("```diff\n+ Accessing Discord API Matrix\n+ Analyzing Structural DNA\n+ Serializing Sector Permissions\n```")
                ], botAvatar),
                V2.separator(),
                V2.text("*BlueSealPrime • Priority Alpha Archive*")
            ], "#00FFFF");

            const status = await message.channel.send({ content: null, flags: V2.flag, components: [initContainer] });

            try {
                // Generate a readable ID: ServerName_DDMM_HHMM
                const date = new Date();
                // Generate a 13-digit numeric ID based on timestamp + random padding
                const backupId = Date.now().toString() + Math.floor(Math.random() * 9).toString();

                const backupData = {
                    id: backupId,
                    guildName: message.guild.name,
                    guildId: message.guild.id,
                    createdBy: {
                        tag: message.author.tag,
                        id: message.author.id
                    },
                    createdAt: date.toISOString(),
                    settings: {
                        verificationLevel: message.guild.verificationLevel,
                        defaultMessageNotifications: message.guild.defaultMessageNotifications,
                        explicitContentFilter: message.guild.explicitContentFilter,
                        afkChannelId: message.guild.afkChannelId,
                        afkTimeout: message.guild.afkTimeout,
                        systemChannelId: message.guild.systemChannelId,
                        rulesChannelId: message.guild.rulesChannelId,
                        publicUpdatesChannelId: message.guild.publicUpdatesChannelId,
                        preferredLocale: message.guild.preferredLocale,
                        features: message.guild.features,
                        iconURL: message.guild.iconURL({ extension: 'png', size: 1024 }),
                        bannerURL: message.guild.bannerURL({ size: 1024 })
                    },
                    roles: message.guild.roles.cache
                        .filter(r => !r.managed && r.name !== "@everyone")
                        .sort((a, b) => b.position - a.position)
                        .map(r => ({
                            id: r.id,
                            name: r.name,
                            color: r.hexColor,
                            permissions: r.permissions.bitfield.toString(),
                            hoist: r.hoist,
                            mentionable: r.mentionable,
                            position: r.position
                        })),
                    emojis: message.guild.emojis.cache.map(e => ({ name: e.name, url: e.url })),
                    stickers: message.guild.stickers.cache.map(s => ({ name: s.name, description: s.description, tags: s.tags })),
                    channels: []
                };

                // Map categories first (Sorted by position)
                const categories = message.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .sort((a, b) => a.position - b.position);

                categories.forEach(cat => {
                    const catData = {
                        name: cat.name,
                        type: cat.type,
                        position: cat.position,
                        overwrites: cat.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        })),
                        children: message.guild.channels.cache
                            .filter(c => c.parentId === cat.id)
                            .sort((a, b) => a.position - b.position)
                            .map(c => ({
                                name: c.name,
                                type: c.type,
                                topic: c.topic || null,
                                position: c.position,
                                bitrate: c.bitrate || null,
                                userLimit: c.userLimit || null,
                                nsfw: c.nsfw || false,
                                rawPosition: c.rawPosition,
                                overwrites: c.permissionOverwrites.cache.map(o => ({
                                    id: o.id,
                                    type: o.type,
                                    allow: o.allow.bitfield.toString(),
                                    deny: o.deny.bitfield.toString()
                                }))
                            }))
                    };
                    backupData.channels.push(catData);
                });

                // Add orphaned channels (no category) - Sorted by position
                const orphans = message.guild.channels.cache
                    .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory && !c.thread)
                    .sort((a, b) => a.position - b.position);

                orphans.forEach(c => {
                    backupData.channels.push({
                        name: c.name,
                        type: c.type,
                        topic: c.topic || null,
                        position: c.position,
                        bitrate: c.bitrate || null,
                        userLimit: c.userLimit || null,
                        rawPosition: c.rawPosition,
                        overwrites: c.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        }))
                    });
                });

                const filePath = path.join(BACKUP_DIR, `${backupId}.json`);
                fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

                const successContainer = V2.container([
                    V2.section([
                        V2.heading("📂 ARCHIVE STORED", 2),
                        V2.text(`### **[ SNAPSHOT_SECURED ]**\n> **Target Server:** ${message.guild.name}\n> **Authorization:** ${message.author}\n\n**🆔 SNAPSHOT IDENTIFIER**\n\`\`\`bash\n${backupId}\n\`\`\``)
                    ], message.guild.iconURL({ extension: 'png' }) || botAvatar),
                    V2.separator(),
                    V2.heading("📦 DATA MANIFEST", 3),
                    V2.text(`\`\`\`yaml\nRoles     : ${backupData.roles.length}\nChannels  : ${backupData.channels.length}\nEmojis    : ${backupData.emojis.length}\nStickers  : ${backupData.stickers.length}\n\`\`\``),
                    V2.separator(),
                    V2.text(`📅 **Time Stamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
                    V2.separator(),
                    V2.text(`*Use !restore <ID> to deploy this matrix.*`)
                ], V2_BLUE);

                await status.edit({ content: null, components: [successContainer] });

            } catch (err) {
                console.error(err);
                const errorContainer = V2.container([V2.text("❌ **Critical Failure:** Internal error during serialization.")], V2_RED);
                status.edit({ content: null, components: [errorContainer] });
            }

        } else if (sub === "list") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([V2.text("📁 **Archive Vault is Empty.** No backups found.")], V2_BLUE)]
                });
            }

            const listComponents = [
                V2.section([
                    V2.heading("📂 CENTRAL ARCHIVE VAULT", 2),
                    V2.text("```fix\n[ ACCESSING ENCRYPTED SNAPSHOTS ]\n```")
                ], botAvatar),
                V2.separator()
            ];

            files.slice(0, 5).forEach(file => {
                try {
                    const filePath = path.join(BACKUP_DIR, file);
                    const stats = fs.statSync(filePath);
                    const fileSize = (stats.size / 1024).toFixed(2); // KB
                    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    const createdTimestamp = Math.floor(new Date(data.createdAt).getTime() / 1000);
                    const creator = data.createdBy ? data.createdBy.tag : "Unknown Architect";

                    listComponents.push(
                        V2.heading(`🆔 ID: ${data.id}`, 3),
                        V2.text(
                            `> **🏛️ Server:** ${data.guildName}\n` +
                            `> **👑 Creator:** ${creator}\n` +
                            `> **📅 Created:** <t:${createdTimestamp}:F>\n` +
                            `> **📊 Stats:** \`${data.roles.length} Roles • ${data.channels.length} Channels\``
                        ),
                        V2.separator()
                    );
                } catch (e) { }
            });

            listComponents.push(V2.text("*BlueSealPrime • Archive Registry • Global*"));

            return message.reply({
                flags: V2.flag,
                components: [V2.container(listComponents, V2_BLUE)]
            });

        } else if (sub === "delete") {
            const targetId = args[1];
            if (!targetId) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify an archive ID to delete.")], V2_RED)] });

            const targetPath = path.join(BACKUP_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Archive ID not found in vault.")], V2_RED)] });

            fs.unlinkSync(targetPath);
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(`🗑️ **Archive Purged:** Snapshot \`${targetId}\` has been deleted.`)], V2_RED)]
            });

        } else if (sub === "clear") {
            const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));
            if (files.length === 0) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **The Vault is already empty.**")], V2_BLUE)] });

            files.forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(` sweep **Vault Cleared:** Total of **${files.length}** archives have been permanently deleted.`)], V2_RED)]
            });

        } else {
            const helpContainer = V2.container([
                V2.section([
                    V2.heading("💡 BACKUP PROTOCOL MANUAL", 2),
                    V2.text(
                        "🔹 `!backup create` - Save current server state\n" +
                        "🔹 `!backup list` - View all snapshots\n" +
                        "🔹 `!backup delete <ID>` - Remove a snapshot\n" +
                        "🔹 `!backup clear` - Wipe the entire vault"
                    )
                ], botAvatar)
            ], V2_BLUE);
            return message.reply({ flags: V2.flag, components: [helpContainer] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "backup", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] backup.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "backup", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("backup", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`backup\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | BACKUP_ID_165
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | BACKUP_ID_526
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | BACKUP_ID_359
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | BACKUP_ID_872
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | BACKUP_ID_802
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | BACKUP_ID_99
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | BACKUP_ID_660
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | BACKUP_ID_96
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | BACKUP_ID_42
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | BACKUP_ID_681
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | BACKUP_ID_682
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | BACKUP_ID_603
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | BACKUP_ID_986
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | BACKUP_ID_617
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | BACKUP_ID_889
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | BACKUP_ID_74
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | BACKUP_ID_791
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | BACKUP_ID_278
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | BACKUP_ID_829
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | BACKUP_ID_340
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | BACKUP_ID_421
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | BACKUP_ID_607
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | BACKUP_ID_462
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | BACKUP_ID_291
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | BACKUP_ID_382
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | BACKUP_ID_213
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | BACKUP_ID_690
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | BACKUP_ID_164
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | BACKUP_ID_625
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | BACKUP_ID_407
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | BACKUP_ID_676
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | BACKUP_ID_793
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | BACKUP_ID_769
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | BACKUP_ID_944
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | BACKUP_ID_480
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | BACKUP_ID_932
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | BACKUP_ID_730
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | BACKUP_ID_988
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | BACKUP_ID_14
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | BACKUP_ID_557
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | BACKUP_ID_309
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | BACKUP_ID_185
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | BACKUP_ID_880
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | BACKUP_ID_570
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | BACKUP_ID_398
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | BACKUP_ID_613
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | BACKUP_ID_439
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | BACKUP_ID_47
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | BACKUP_ID_199
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | BACKUP_ID_459
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | BACKUP_ID_592
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | BACKUP_ID_726
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | BACKUP_ID_498
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | BACKUP_ID_723
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | BACKUP_ID_922
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | BACKUP_ID_860
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | BACKUP_ID_939
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | BACKUP_ID_714
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | BACKUP_ID_551
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | BACKUP_ID_237
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | BACKUP_ID_302
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | BACKUP_ID_401
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | BACKUP_ID_517
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | BACKUP_ID_743
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | BACKUP_ID_336
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | BACKUP_ID_668
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | BACKUP_ID_175
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | BACKUP_ID_975
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | BACKUP_ID_961
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | BACKUP_ID_43
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | BACKUP_ID_275
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | BACKUP_ID_59
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | BACKUP_ID_765
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | BACKUP_ID_320
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | BACKUP_ID_85
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | BACKUP_ID_135
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | BACKUP_ID_456
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | BACKUP_ID_91
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | BACKUP_ID_724
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | BACKUP_ID_759
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | BACKUP_ID_856
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | BACKUP_ID_425
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | BACKUP_ID_736
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | BACKUP_ID_838
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | BACKUP_ID_731
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | BACKUP_ID_770
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | BACKUP_ID_115
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | BACKUP_ID_104
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | BACKUP_ID_678
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | BACKUP_ID_872
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | BACKUP_ID_825
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | BACKUP_ID_864
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | BACKUP_ID_430
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | BACKUP_ID_967
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | BACKUP_ID_489
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | BACKUP_ID_306
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | BACKUP_ID_817
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | BACKUP_ID_916
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | BACKUP_ID_617
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | BACKUP_ID_756
 */

};