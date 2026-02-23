const V2 = require("../utils/v2Utils");
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "rstsafbackup",
    description: "Apply Structural DNA Backup to the current server.",
    usage: "!rstsafbackup <DNA-Key>",
    aliases: ["applydna", "safrestore"],
    whitelistOnly: true,

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: RSTSAFBACKUP
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("rstsafbackup") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "rstsafbackup", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const botAvatar = V2.botAvatar(message);
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can deploy structural matrices.")], V2_RED)] });

        const dnaKey = args[0]?.toUpperCase();
        if (!dnaKey) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a DNA Key: `!rstsafbackup <KEY>`")], V2_RED)] });

        const SAFETY_DIR = path.join(__dirname, "../data/safety");
        const filePath = path.join(SAFETY_DIR, `${dnaKey}.json`);

        if (!fs.existsSync(filePath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ DNA Key \`${dnaKey}\` not found in archive.`)], V2_RED)] });

        let data;
        try { data = JSON.parse(fs.readFileSync(filePath, "utf8")); }
        catch (e) { return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Error reading structural template.")], V2_RED)] }); }

        // ─── CONFIRMATION ───
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm_dna").setLabel("⚠️  PROCEED WITH COLLAPSE").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cancel_dna").setLabel("Abort Sequence").setStyle(ButtonStyle.Secondary)
        );

        const response = await message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("☢️ PROTOCOL OMEGA — CONFIRMATION REQUIRED", 2),
                V2.text(
                    `### **CRITICAL STRUCTURAL OVERWRITE**\n` +
                    `Deploying DNA: \`${dnaKey}\` → **${message.guild.name}**\n\n` +
                    `> ⚠️ **All existing channels & roles will be purged** and replaced.\n` +
                    `> 🔒 **Bot roles & current channel** are protected during the process.\n\n` +
                    `**Authorize sequence to proceed or abort.**`
                ),
                V2.separator(),
                confirmRow
            ], V2_RED)]
        });

        try {
            const confirmation = await response.awaitMessageComponent({ filter: i => i.user.id === message.author.id, time: 30000 });

            if (confirmation.customId === "cancel_dna")
                return confirmation.update({ flags: V2.flag, components: [V2.container([V2.text("❌ **Sequence Aborted.**")], V2_BLUE)] });

            await confirmation.update({
                flags: V2.flag,
                components: [V2.container([V2.section([V2.heading("⚡ STRUCTURAL COLLAPSE INITIATED", 2), V2.text("Purging existing structure and deploying DNA matrix...")], botAvatar)], V2_BLUE)]
            });

            // ─── PHASE 0: PURGE ───
            const currentChanId = message.channel.id;
            const botMember = await message.guild.members.fetchMe();
            const botMaxPos = botMember.roles.highest.position;

            await Promise.all([
                ...message.guild.channels.cache.filter(c => c.id !== currentChanId).map(c => c.delete().catch(() => { })),
                ...message.guild.roles.cache.filter(r => !r.managed && r.id !== message.guild.id && r.position < botMaxPos).map(r => r.delete().catch(() => { }))
            ]);

            const statusChannel = await message.guild.channels.create({ name: "🧬-restoration-status", type: ChannelType.GuildText, reason: "Structural DNA Deployment" });
            await statusChannel.send({ flags: V2.flag, components: [V2.container([V2.text("✅ **Sovereign Purge Complete.** Reconstructing structural matrix...")], V2_BLUE)] });

            // ─── PHASE 1: ROLES ───
            const roleMap = new Map();
            for (const rData of data.roles.sort((a, b) => a.position - b.position)) {
                try {
                    const newRole = await message.guild.roles.create({ name: rData.name, color: rData.color, permissions: BigInt(rData.permissions), hoist: rData.hoist, mentionable: rData.mentionable, reason: "DNA Deploy" });
                    roleMap.set(rData.name, newRole.id);
                } catch (e) { }
            }

            // ─── PHASE 2: OVERWRITE RESOLVER ───
            const resolveOverwrites = (overwrites) => {
                if (!overwrites) return [];
                return overwrites.map(o => {
                    if (o.type === 1) return { id: o.id, type: 1, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                    if (o.id === data.guildId) return { id: message.guild.id, type: 0, allow: BigInt(o.allow), deny: BigInt(o.deny) };
                    const src = data.roles.find(r => r.id === o.id);
                    if (src) { const nid = roleMap.get(src.name); if (nid) return { id: nid, type: 0, allow: BigInt(o.allow), deny: BigInt(o.deny) }; }
                    return null;
                }).filter(Boolean);
            };

            // ─── PHASE 3: CHANNELS ───
            const createdCats = new Map();
            for (const cat of data.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                try {
                    const nc = await message.guild.channels.create({ name: cat.name, type: cat.type, position: cat.position, permissionOverwrites: resolveOverwrites(cat.overwrites), reason: "DNA Deploy" });
                    createdCats.set(cat.name, nc.id);
                } catch (e) { }
            }

            await Promise.all(data.channels.filter(c => c.type === ChannelType.GuildCategory && c.children).flatMap(cat =>
                cat.children.map(ch => message.guild.channels.create({
                    name: ch.name, type: ch.type, topic: ch.topic, bitrate: ch.bitrate, userLimit: ch.userLimit, nsfw: ch.nsfw,
                    parentId: createdCats.get(cat.name), position: ch.rawPosition || ch.position,
                    permissionOverwrites: resolveOverwrites(ch.overwrites), reason: "DNA Deploy"
                }).catch(() => { }))
            ));

            await Promise.all(data.channels.filter(c => c.type !== ChannelType.GuildCategory && !c.children).map(c =>
                message.guild.channels.create({ name: c.name, type: c.type, topic: c.topic, bitrate: c.bitrate, userLimit: c.userLimit, position: c.rawPosition || c.position, permissionOverwrites: resolveOverwrites(c.overwrites), reason: "DNA Deploy" }).catch(() => { })
            ));

            // ─── FINAL ───
            await statusChannel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🛡️ STRUCTURAL DNA APPLIED", 2),
                        V2.text(`Server structure from \`${dnaKey}\` has been reconstructed with full fidelity.\n\n> **Roles:** \`${data.roles.length}\`\n> **Channels:** \`${data.channels.length}\``)
                    ], botAvatar),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Safety Archive Protocol*")
                ], "#00FF7F")]
            });

        } catch (e) {
            console.error(e);
            return message.channel.send({ flags: V2.flag, components: [V2.container([V2.text("❌ **Sequence Aborted:** Internal error or 30s timeout.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "rstsafbackup", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] rstsafbackup.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "rstsafbackup", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("rstsafbackup", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`rstsafbackup\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_466
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_222
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_868
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_965
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_117
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_418
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_695
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_762
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_819
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_299
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_54
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_146
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_664
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_800
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_227
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_261
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_775
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_56
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_797
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_931
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_834
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_790
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_550
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_997
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_105
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_591
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_660
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_698
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_776
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_903
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_199
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_562
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_170
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_379
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_449
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_64
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_148
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_392
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_483
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_830
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_963
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_416
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_795
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_595
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_624
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_608
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_763
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_431
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_713
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_596
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_85
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_385
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_877
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_433
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_203
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_779
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_226
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_542
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_250
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_502
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_97
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_495
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_597
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_647
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_522
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_997
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_118
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_83
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_42
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_248
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_341
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_743
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_715
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_299
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_921
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_198
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_803
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_337
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_317
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_319
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_925
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_785
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_530
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_619
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_723
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_0
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_223
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_420
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_674
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_681
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_373
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_535
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_99
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_413
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_940
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_135
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_66
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_248
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_565
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | RSTSAFBACKUP_ID_616
 */

};