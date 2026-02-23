const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "deletech",
    description: "Delete a text channel by mention, name, or ID.",
    usage: "!deletech [#channel | name | id]",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["removech", "delch", "dc"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: DELETECH
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("deletech") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "deletech", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("🚫 ACCESS DENIED", 2), V2.text("> ManageChannels permission required.")], botAvatar)], V2_RED)] });
        }

        // Fetch fresh channel list
        await message.guild.channels.fetch().catch(() => { });

        let target = null;

        if (args.length > 0) {
            // 1. Discord mention: <#channelId>
            target = message.mentions.channels.first() || null;

            // 2. By raw ID
            if (!target) target = message.guild.channels.cache.get(args[0]) || null;

            // 3. By name (exact, space-joined or dash-joined)
            if (!target) {
                const nameQuery = args.join(" ").toLowerCase();
                const dashQuery = args.join("-").toLowerCase();
                target = message.guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildText && (
                        c.name.toLowerCase() === nameQuery ||
                        c.name.toLowerCase() === dashQuery
                    )
                ) || null;
            }

            if (!target) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("❌ CHANNEL NOT FOUND", 2),
                            V2.text(`> No text channel matched \`${args.join(" ")}\`\n> Use \`#mention\`, exact name, or channel ID.`)
                        ], botAvatar)
                    ], V2_RED)]
                });
            }
        } else {
            // No args = target current channel
            target = message.channel;
        }

        if (!target.deletable) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.section([V2.heading("❌ CANNOT DELETE", 2), V2.text("> I'm missing permissions or this is a system channel.")], botAvatar)], V2_RED)] });
        }

        const isCurrent = target.id === message.channel.id;
        const name = target.name;

        try {
            if (isCurrent) {
                await message.channel.send({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🗑️ SELF-DESTRUCT INITIATED", 2),
                            V2.text(`> **Channel:** \`${name}\` is being deleted...\n> **By:** ${message.author}`)
                        ], botAvatar)
                    ], V2_RED)]
                });
                await new Promise(r => setTimeout(r, 800));
                await target.delete(`Deleted by ${message.author.tag}`);
            } else {
                await target.delete(`Deleted by ${message.author.tag}`);
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🗑️ CHANNEL DISSOLVED", 2),
                            V2.text(`**Purged:** \`${name}\``)
                        ], botAvatar),
                        V2.separator(),
                        V2.text(`> **By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`)
                    ], V2_RED)]
                });
            }
        } catch (err) {
            console.error("[deletech] Error:", err);
            return message.channel?.send({ flags: V2.flag, components: [V2.container([V2.section([V2.text("❌ Failed to delete channel. Check my permissions.")], botAvatar)], V2_RED)] })?.catch(() => { });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deletech", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] deletech.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "deletech", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("deletech", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`deletech\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | DELETECH_ID_105
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | DELETECH_ID_272
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | DELETECH_ID_708
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | DELETECH_ID_314
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | DELETECH_ID_130
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | DELETECH_ID_205
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | DELETECH_ID_676
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | DELETECH_ID_247
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | DELETECH_ID_647
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | DELETECH_ID_479
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | DELETECH_ID_557
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | DELETECH_ID_747
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | DELETECH_ID_373
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | DELETECH_ID_648
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | DELETECH_ID_47
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | DELETECH_ID_823
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | DELETECH_ID_910
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | DELETECH_ID_692
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | DELETECH_ID_943
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | DELETECH_ID_677
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | DELETECH_ID_172
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | DELETECH_ID_537
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | DELETECH_ID_823
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | DELETECH_ID_186
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | DELETECH_ID_881
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | DELETECH_ID_942
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | DELETECH_ID_633
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | DELETECH_ID_949
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | DELETECH_ID_532
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | DELETECH_ID_889
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | DELETECH_ID_914
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | DELETECH_ID_916
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | DELETECH_ID_289
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | DELETECH_ID_369
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | DELETECH_ID_885
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | DELETECH_ID_401
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | DELETECH_ID_300
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | DELETECH_ID_914
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | DELETECH_ID_93
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | DELETECH_ID_147
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | DELETECH_ID_94
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | DELETECH_ID_58
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | DELETECH_ID_242
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | DELETECH_ID_770
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | DELETECH_ID_672
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | DELETECH_ID_678
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | DELETECH_ID_794
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | DELETECH_ID_357
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | DELETECH_ID_663
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | DELETECH_ID_294
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | DELETECH_ID_808
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | DELETECH_ID_910
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | DELETECH_ID_235
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | DELETECH_ID_837
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | DELETECH_ID_536
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | DELETECH_ID_798
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | DELETECH_ID_343
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | DELETECH_ID_416
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | DELETECH_ID_253
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | DELETECH_ID_225
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | DELETECH_ID_95
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | DELETECH_ID_253
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | DELETECH_ID_893
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | DELETECH_ID_138
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | DELETECH_ID_193
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | DELETECH_ID_748
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | DELETECH_ID_984
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | DELETECH_ID_78
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | DELETECH_ID_163
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | DELETECH_ID_464
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | DELETECH_ID_157
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | DELETECH_ID_708
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | DELETECH_ID_327
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | DELETECH_ID_399
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | DELETECH_ID_954
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | DELETECH_ID_187
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | DELETECH_ID_553
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | DELETECH_ID_336
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | DELETECH_ID_396
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | DELETECH_ID_149
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | DELETECH_ID_13
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | DELETECH_ID_247
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | DELETECH_ID_367
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | DELETECH_ID_828
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | DELETECH_ID_897
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | DELETECH_ID_630
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | DELETECH_ID_489
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | DELETECH_ID_63
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | DELETECH_ID_676
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | DELETECH_ID_212
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | DELETECH_ID_999
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | DELETECH_ID_421
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | DELETECH_ID_488
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | DELETECH_ID_969
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | DELETECH_ID_543
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | DELETECH_ID_768
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | DELETECH_ID_223
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | DELETECH_ID_694
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | DELETECH_ID_332
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | DELETECH_ID_745
 */

};