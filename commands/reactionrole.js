const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "reactionroles.json");

function loadRR() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) { fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2)); return {}; }
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}
function saveRR(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
    name: "reactionrole",
    description: "Manage reaction role panels (Admin Only)",
    usage: "!reactionrole <create|add|remove|list|delete>",
    permissions: [PermissionsBitField.Flags.ManageRoles],
    aliases: ["rr"],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: REACTIONROLE
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
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("reactionrole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "reactionrole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            // --- OWNER RESTRICTION INJECTED ---\nconst _fs = require('fs');\nconst _path = require('path');\nconst OWNERS_DB = _path.join(__dirname, '../data/owners.json');\nlet _isExtraOwner = false;\nconst _isBotOwner = message.author.id === BOT_OWNER_ID;\nconst _isServerOwner = message.guild.ownerId === message.author.id;\nif (_fs.existsSync(OWNERS_DB)) {\n    try {\n        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\n        const raw = rawDb[message.guild.id] || [];\n        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\n        _isExtraOwner = extraIds.includes(message.author.id);\n    } catch (e) { }\n}\nif (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\n    return message.reply({\n        content: null,\n        flags: V2 ? V2.flag : undefined,\n        components: V2 ? [V2.container([\n            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\n            V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\nRole modifications are heavily monitored.')\n        ], V2_RED)] : undefined\n    }).catch(()=>{});\n}\n// ----------------------------------\n/* --- KERNEL_START --- */
            const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
            if (!isOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 You need **Manage Roles** permission.")], V2_RED)] });

            const sub = args[0]?.toLowerCase();
            const data = loadRR();

            // ─── CREATE ───
            if (sub === "create") {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                const title = args.slice(2).join(" ") || "Self-Assign Roles";
                if (!channel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!reactionrole create #channel <title>`")], V2_RED)] });

                const panelMsg = await channel.send({
                    embeds: [{
                        color: 0x5865F2,
                        title: `🎭 ${title}`,
                        description: "```diff\n+ ROLE ASSIGNMENT PANEL\n+ REACT TO CLAIM ROLES\n```\n\n**React to add a role — remove reaction to remove the role.**\n\n*No roles configured yet. Use `!reactionrole add` to add roles.*",
                        footer: { text: "BlueSealPrime • Reaction Roles" }
                    }]
                });

                data[panelMsg.id] = { guildId: message.guild.id, channelId: channel.id, roles: [] };
                saveRR(data);

                return message.reply({
                    flags: V2.flag, components: [V2.container([
                        V2.heading("✅ Reaction Role Panel Created", 2),
                        V2.text(`Panel created in ${channel}\n\n> **Message ID:** \`${panelMsg.id}\`\n> Use \`!reactionrole add ${panelMsg.id} <emoji> <@role>\` to add roles`)
                    ], V2_BLUE)]
                });
            }

            // ─── ADD ───
            if (sub === "add") {
                const [, messageId, emoji] = args;
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
                if (!messageId || !emoji || !role)
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!reactionrole add <messageID> <emoji> <@role>`")], V2_RED)] });
                if (!data[messageId]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ That message is not a reaction role panel.")], V2_RED)] });
                if (data[messageId].roles.some(r => r.emoji === emoji))
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ That emoji is already assigned on this panel.")], V2_RED)] });

                // --- SOVEREIGN ROLE PREVENTION ---
                const rName = role.name.toLowerCase();
                if (rName.includes("bluesealprime") || rName.includes("antinuke") || rName.includes("anti-raid") || rName.includes("quarantine") || rName.includes("botrole") || role.tags?.botId === message.client.user.id) {
                    return message.reply({
                        content: null,
                        flags: V2.flag,
                        components: [V2.container([
                            V2.heading("🚫 SOVEREIGN PROTECTION", 3),
                            V2.text("This is an integrated Bot Role and cannot be used for reaction roles.")
                        ], V2_RED)]
                    }).catch(() => { });
                }
                // ---------------------------------

                data[messageId].roles.push({ emoji, roleId: role.id });
                saveRR(data);

                try {
                    const ch = message.guild.channels.cache.get(data[messageId].channelId);
                    const pm = await ch.messages.fetch(messageId);
                    await pm.react(emoji);
                    const roleList = data[messageId].roles.map(r => `${r.emoji} — <@&${r.roleId}>`).join("\n");
                    const old = pm.embeds[0];
                    const { EmbedBuilder } = require("discord.js");
                    await pm.edit({ embeds: [EmbedBuilder.from(old).setDescription(`\`\`\`diff\n+ ROLE ASSIGNMENT PANEL\n+ REACT TO CLAIM ROLES\n\`\`\`\n\n**React to add a role — remove to remove the role.**\n\n**Available Roles:**\n${roleList}`)] });
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`✅ **${emoji} → ${role}** added to the panel.`)], V2_BLUE)] });
                } catch (err) {
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to update the panel. Does the message still exist?")], V2_RED)] });
                }
            }

            // ─── REMOVE ───
            if (sub === "remove") {
                const [, messageId, emoji] = args;
                if (!messageId || !emoji) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!reactionrole remove <messageID> <emoji>`")], V2_RED)] });
                if (!data[messageId]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ That message is not a reaction role panel.")], V2_RED)] });

                const idx = data[messageId].roles.findIndex(r => r.emoji === emoji);
                if (idx === -1) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ That emoji is not assigned on this panel.")], V2_RED)] });

                data[messageId].roles.splice(idx, 1);
                saveRR(data);

                try {
                    const ch = message.guild.channels.cache.get(data[messageId].channelId);
                    const pm = await ch.messages.fetch(messageId);
                    await pm.reactions.cache.get(emoji)?.remove();
                    const roleList = data[messageId].roles.length > 0 ? data[messageId].roles.map(r => `${r.emoji} — <@&${r.roleId}>`).join("\n") : "*No roles configured yet.*";
                    const { EmbedBuilder } = require("discord.js");
                    await pm.edit({ embeds: [EmbedBuilder.from(pm.embeds[0]).setDescription(`\`\`\`diff\n+ ROLE ASSIGNMENT PANEL\n+ REACT TO CLAIM ROLES\n\`\`\`\n\n**React to add a role — remove to remove the role.**\n\n**Available Roles:**\n${roleList}`)] });
                    return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`✅ **${emoji}** removed from the panel.`)], V2_BLUE)] });
                } catch { return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ Failed to update the panel.")], V2_RED)] }); }
            }

            // ─── LIST ───
            if (sub === "list") {
                const panels = Object.entries(data).filter(([, p]) => p.guildId === message.guild.id);
                if (panels.length === 0) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **No reaction role panels** found in this server.")], V2_BLUE)] });
                const list = panels.map(([id, p]) => `> \`${id}\` — <#${p.channelId}> | **${p.roles.length} roles**`).join("\n");
                return message.reply({ flags: V2.flag, components: [V2.container([V2.heading("📋 Reaction Role Panels", 2), V2.text(list)], V2_BLUE)] });
            }

            // ─── DELETE ───
            if (sub === "delete") {
                const messageId = args[1];
                if (!messageId) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!reactionrole delete <messageID>`")], V2_RED)] });
                if (!data[messageId]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ That message is not a reaction role panel.")], V2_RED)] });
                delete data[messageId];
                saveRR(data);
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **Panel removed from database.** The message itself was not deleted.")], V2_BLUE)] });
            }

            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❓ **Unknown subcommand.**\nUse: `create`, `add`, `remove`, `list`, or `delete`")], V2_RED)] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "reactionrole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] reactionrole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "reactionrole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("reactionrole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`reactionrole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_540
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_679
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_325
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_519
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_698
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_795
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_794
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_348
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_440
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_909
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_650
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_396
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_399
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_171
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_931
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_413
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_165
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_122
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_174
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_737
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_958
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_467
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_227
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_532
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_647
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_638
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_283
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_590
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_755
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_146
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_488
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_96
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_664
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_864
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_20
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_37
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_827
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_578
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_825
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_295
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_295
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_800
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_647
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_727
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_457
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_778
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_7
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_219
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_862
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_698
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_551
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_85
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_298
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_20
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_941
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_18
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_205
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_959
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_122
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_851
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_9
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_623
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_836
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_5
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_69
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_161
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_83
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_51
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_576
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_157
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_785
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_379
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_986
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_958
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_897
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_341
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_703
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_32
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_500
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_652
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_956
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_260
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_102
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_209
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_646
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_113
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_245
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_877
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_321
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_412
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_649
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_421
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_220
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_975
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_392
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_248
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_251
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_164
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_915
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | REACTIONROLE_ID_768
     */

};