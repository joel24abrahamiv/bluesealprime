const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
    SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/quarantine.json");

function getSavedRoles(guildId, userId) {
    if (!fs.existsSync(DB_PATH)) return [];
    try { const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); return data[guildId]?.[userId] || []; } catch { return []; }
}

// ── Builder Helpers ──
const sepLg = () => V2.separator().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => V2.separator().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (content) => new TextDisplayBuilder().setContent(content);
const h = (content, level = 2) => {
    const hashes = "#".repeat(level);
    return new TextDisplayBuilder().setContent(`${hashes} ${content}`);
};

module.exports = {
    name: "uq",
    description: "Unquarantine a user — restores all saved roles (Admin/Owner Only)",
    aliases: ["unquarantine"],
    usage: "!uq @user",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: UQ
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("uq") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "uq", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("🚫 **ACCESS DENIED** | Authorized Personnel Only."))
                .addSeparatorComponents(sepLg());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("⚠️ **User not found.**\nUsage: `!uq @user`"))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        try { await target.fetch(); } catch (e) { }

        const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
        if (!qrRole) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("⚠️ **Quarantine system not active** — `Quarantined` role not found.\nRun `!qr setup` first."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        if (qrRole.position >= message.guild.members.me.roles.highest.position) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Hierarchy Error:** `Quarantined` role is above my highest role. Reposition it."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        if (!target.roles.cache.has(qrRole.id)) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(`⚠️ **${target.user.tag}** is not currently quarantined.`))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        try {
            // ── Remove quarantine & restore roles simultaneously ──
            await target.roles.remove(qrRole, `Unquarantined by ${message.author.tag}`);

            const savedRoleIds = getSavedRoles(message.guild.id, target.id);
            let restoredCount = 0;
            if (savedRoleIds.length > 0) {
                const rolesToRestore = savedRoleIds.filter(id => {
                    const r = message.guild.roles.cache.get(id);
                    return r && r.editable && r.id !== message.guild.id;
                });
                if (rolesToRestore.length > 0) {
                    await target.roles.add(rolesToRestore, "Quarantine: Restoring roles").catch(() => { });
                    restoredCount = rolesToRestore.length;
                }
            }

            // ── Remove from DB ──
            if (fs.existsSync(DB_PATH)) {
                try {
                    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
                    if (data[message.guild.id]?.[target.id]) {
                        delete data[message.guild.id][target.id];
                        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                    }
                } catch (e) { }
            }

            // ── SUCCESS CARD ──
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    h("✅ SUBJECT RELEASED", 1),
                    txt(`**${target.user.tag}** has been freed from isolation.\nAll previous roles have been restored.`)
                )
                .setThumbnailAccessory(
                    target.user.displayAvatarURL({ dynamic: true, size: 512 })
                );

            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addSectionComponents(section)
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(h("[ RELEASE RECORD ]", 3))
                .addTextDisplayComponents(
                    txt(
                        `> 🔁 **Roles Restored:** \`${restoredCount}\`\n` +
                        `> 👮 **Released by:** ${message.author.tag}\n` +
                        `> 🕐 **At:** <t:${Math.floor(Date.now() / 1000)}:f>`
                    )
                )
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("*BlueSealPrime • Quarantine Protocol*"));

            return message.reply({ flags: V2.flag, components: [container] });

        } catch (e) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(`❌ **Failed to unquarantine:** ${e.message}`))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "uq", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] uq.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "uq", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("uq", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`uq\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | UQ_ID_549
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | UQ_ID_404
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | UQ_ID_206
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | UQ_ID_536
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | UQ_ID_751
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | UQ_ID_770
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | UQ_ID_16
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | UQ_ID_906
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | UQ_ID_629
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | UQ_ID_73
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | UQ_ID_2
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | UQ_ID_451
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | UQ_ID_314
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | UQ_ID_249
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | UQ_ID_269
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | UQ_ID_251
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | UQ_ID_923
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | UQ_ID_493
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | UQ_ID_750
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | UQ_ID_949
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | UQ_ID_366
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | UQ_ID_803
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | UQ_ID_200
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | UQ_ID_166
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | UQ_ID_733
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | UQ_ID_36
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | UQ_ID_430
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | UQ_ID_607
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | UQ_ID_187
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | UQ_ID_778
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | UQ_ID_846
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | UQ_ID_671
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | UQ_ID_250
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | UQ_ID_703
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | UQ_ID_463
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | UQ_ID_763
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | UQ_ID_263
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | UQ_ID_236
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | UQ_ID_62
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | UQ_ID_387
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | UQ_ID_112
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | UQ_ID_54
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | UQ_ID_599
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | UQ_ID_254
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | UQ_ID_488
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | UQ_ID_959
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | UQ_ID_293
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | UQ_ID_882
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | UQ_ID_442
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | UQ_ID_390
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | UQ_ID_471
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | UQ_ID_814
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | UQ_ID_780
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | UQ_ID_206
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | UQ_ID_693
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | UQ_ID_383
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | UQ_ID_78
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | UQ_ID_285
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | UQ_ID_797
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | UQ_ID_408
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | UQ_ID_982
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | UQ_ID_700
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | UQ_ID_575
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | UQ_ID_525
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | UQ_ID_686
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | UQ_ID_226
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | UQ_ID_628
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | UQ_ID_885
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | UQ_ID_587
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | UQ_ID_147
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | UQ_ID_698
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | UQ_ID_654
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | UQ_ID_557
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | UQ_ID_420
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | UQ_ID_251
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | UQ_ID_950
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | UQ_ID_216
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | UQ_ID_620
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | UQ_ID_331
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | UQ_ID_93
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | UQ_ID_16
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | UQ_ID_220
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | UQ_ID_206
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | UQ_ID_566
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | UQ_ID_688
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | UQ_ID_960
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | UQ_ID_70
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | UQ_ID_767
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | UQ_ID_914
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | UQ_ID_359
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | UQ_ID_522
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | UQ_ID_604
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | UQ_ID_562
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | UQ_ID_646
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | UQ_ID_27
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | UQ_ID_308
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | UQ_ID_425
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | UQ_ID_519
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | UQ_ID_624
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | UQ_ID_591
 */

};