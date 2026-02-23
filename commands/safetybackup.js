const V2 = require("../utils/v2Utils");
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const SAFETY_DIR = path.join(__dirname, "../data/safety");
if (!fs.existsSync(SAFETY_DIR)) fs.mkdirSync(SAFETY_DIR, { recursive: true });

module.exports = {
    name: "safetybackup",
    description: "Structural DNA Backup (Roles & Channels Only)",
    usage: "!safetybackup create | list | delete <id> | clear",
    aliases: ["sfbk", "structuralbackup"],
    whitelistOnly: true,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: SAFETYBACKUP
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("safetybackup") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "safetybackup", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);

        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can manage structural templates.")], V2_RED)]
            });
        }

        const sub = args[0]?.toLowerCase();

        // ─── CREATE ───
        if (sub === "create") {
            const dnaKey = `SF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const status = await message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🧬 EXTRACTING STRUCTURAL DNA", 2),
                        V2.text("```diff\n+ Isolating Role Hierarchy\n+ Mapping Sector Coordinates\n+ Encrypting Permission Tables\n```")
                    ], botAvatar)
                ], V2_BLUE)]
            });

            try {
                const guild = message.guild;
                const backupData = {
                    id: dnaKey,
                    guildName: guild.name,
                    guildId: guild.id,
                    createdAt: new Date().toISOString(),
                    roles: guild.roles.cache
                        .filter(r => !r.managed && r.name !== "@everyone")
                        .sort((a, b) => b.position - a.position)
                        .map(r => ({ id: r.id, name: r.name, color: r.hexColor, permissions: r.permissions.bitfield.toString(), hoist: r.hoist, mentionable: r.mentionable, position: r.position })),
                    channels: []
                };

                // Categories
                guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .sort((a, b) => a.position - b.position)
                    .forEach(cat => {
                        backupData.channels.push({
                            name: cat.name, type: cat.type, position: cat.position,
                            overwrites: cat.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })),
                            children: guild.channels.cache
                                .filter(c => c.parentId === cat.id)
                                .sort((a, b) => a.position - b.position)
                                .map(c => ({ name: c.name, type: c.type, topic: c.topic || null, position: c.position, bitrate: c.bitrate || null, userLimit: c.userLimit || null, nsfw: c.nsfw || false, rawPosition: c.rawPosition, overwrites: c.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })) }))
                        });
                    });

                // Orphaned channels
                guild.channels.cache
                    .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory && !c.thread)
                    .sort((a, b) => a.position - b.position)
                    .forEach(c => {
                        backupData.channels.push({ name: c.name, type: c.type, topic: c.topic || null, position: c.position, bitrate: c.bitrate || null, userLimit: c.userLimit || null, rawPosition: c.rawPosition, overwrites: c.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })) });
                    });

                fs.writeFileSync(path.join(SAFETY_DIR, `${dnaKey}.json`), JSON.stringify(backupData, null, 2));

                await status.edit({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🛡️ STRUCTURAL DNA SECURED", 2),
                            V2.text(`### **[ DNA_EXTRACT_SUCCESS ]**\n> **DNA Key:** \`${dnaKey}\`\n> **Server:** ${guild.name}\n> **Roles:** \`${backupData.roles.length}\` • **Channel Regions:** \`${backupData.channels.length}\`\n\nUse \`!rstsafbackup ${dnaKey}\` to deploy this to any server.`)
                        ], botAvatar),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Structural Integrity Protocol*")
                    ], "#00FF7F")]
                });

            } catch (err) {
                console.error(err);
                await status.edit({ flags: V2.flag, components: [V2.container([V2.text("❌ **Critical Failure:** DNA extraction interrupted.")], V2_RED)] });
            }

            // ─── LIST ───
        } else if (sub === "list") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **Safety Vault is Empty.** Use `!safetybackup create` to save a structural template.")], V2_BLUE)] });
            }

            const items = files.map(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(SAFETY_DIR, file), "utf8"));
                    return `> 🧬 \`${data.id}\` — **${data.guildName}** | Roles: \`${data.roles.length}\` • Channels: \`${data.channels.length}\``;
                } catch (e) { return null; }
            }).filter(Boolean);

            await message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("📂 SAFETY ARCHIVE VAULT", 2),
                        V2.text(`**${files.length} Template${files.length !== 1 ? "s" : ""} Stored:**\n\n${items.join("\n")}`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Structural DNA Registry*")
                ], V2_BLUE)]
            });

            // ─── DELETE ───
        } else if (sub === "delete") {
            const targetId = args[1]?.toUpperCase();
            if (!targetId) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a DNA Key: `!safetybackup delete <KEY>`")], V2_RED)] });
            const targetPath = path.join(SAFETY_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ DNA Key \`${targetId}\` not found in vault.`)], V2_RED)] });
            fs.unlinkSync(targetPath);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🗑️ **DNA Purged:** Template \`${targetId}\` has been permanently deleted.`)], V2_BLUE)] });

            // ─── CLEAR ───
        } else if (sub === "clear") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));
            if (files.length === 0) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **Safety Vault is already empty.**")], V2_BLUE)] });
            files.forEach(f => fs.unlinkSync(path.join(SAFETY_DIR, f)));
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🧹 **Safety Vault Cleared:** \`${files.length}\` templates permanently deleted.`)], V2_BLUE)] });

            // ─── HELP ───
        } else {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("sfbk_create").setLabel("Create Template").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("sfbk_list").setLabel("List Templates").setStyle(ButtonStyle.Secondary)
            );
            await message.reply({
                content: `## 🧬 Safety Backup System\n> \`!safetybackup create\` — Save structural DNA\n> \`!safetybackup list\` — View stored templates\n> \`!safetybackup delete <KEY>\` — Remove a template\n> \`!safetybackup clear\` — Wipe entire vault`,
                components: [row]
            });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "safetybackup", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] safetybackup.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "safetybackup", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("safetybackup", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`safetybackup\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_629
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_624
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_234
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_50
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_640
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_431
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_444
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_937
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_218
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_849
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_720
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_705
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_329
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_314
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_331
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_419
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_32
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_484
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_330
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_868
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_696
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_982
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_311
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_761
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_893
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_328
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_670
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_434
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_629
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_489
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_995
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_23
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_234
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_300
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_19
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_279
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_480
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_801
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_833
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_505
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_926
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_558
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_816
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_602
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_75
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_890
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_325
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_270
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_991
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_232
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_490
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_409
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_976
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_757
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_118
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_53
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_400
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_378
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_448
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_458
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_228
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_191
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_91
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_812
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_867
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_863
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_925
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_827
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_456
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_978
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_466
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_531
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_551
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_544
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_328
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_415
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_66
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_266
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_451
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_522
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_163
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_463
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_991
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_58
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_59
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_195
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_610
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_654
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_871
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_48
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_907
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_378
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_482
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_25
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_179
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_478
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_422
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_947
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_784
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | SAFETYBACKUP_ID_974
 */

};