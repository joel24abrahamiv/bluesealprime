const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_RED, V2_BLUE } = require("../config");

module.exports = {
    name: "panic",
    description: "🚨 LOCKDOWN SERVER (Administrator Only)",
    aliases: ["lockdown", "emergency"],
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: PANIC
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("panic") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "panic", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 **Authorized Personnel Only.**");
        }

        const mode = args[0]?.toLowerCase();
        const guild = message.guild;
        const channels = Array.from(guild.channels.cache.filter(c => c.type === ChannelType.GuildText).values());

        const V2 = require("../utils/v2Utils");

        if (mode === "on" || mode === "start") {
            const processingMsg = await message.reply("🚨 **INITIATING LOCKDOWN...** Processing channels...");

            // TURBO LOCKDOWN (PARALLEL)
            const lockdownTasks = channels.map(channel => {
                return channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: false,
                    AddReactions: false
                }, { reason: "🚨 EMERGENCY PANIC MODE" }); // Implicitly returns a Promise
            });

            const results = await Promise.allSettled(lockdownTasks);
            const lockedCount = results.filter(r => r.status === "fulfilled").length;

            try {
                await guild.setVerificationLevel(3); // High
            } catch (e) { }

            const { AttachmentBuilder } = require("discord.js");
            const panicIcon = new AttachmentBuilder("./photos/panic_on.png", { name: "panic_on.png" });

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🚨 SERVER LOCKDOWN ACTIVE", 2),
                        V2.text(
                            `### **[ PANIC_MODE_ENGAGED ]**\n\n` +
                            `🛡️ **Status:** \`RESTRICTED ACCESS\`\n` +
                            `🔒 **Channels Locked:** \`${lockedCount}\`\n` +
                            `⚖️ **Verification:** \`HIGH\`\n\n` +
                            `*All text transmission and reaction vectors have been neutralized. Await further instructions from administration.*`
                        )
                    ],
                    "attachment://panic_on.png"
                ),
                V2.separator(),
                V2.text("*BlueSealPrime • Emergency Protocol Active*")
            ], V2_RED);

            await processingMsg.delete().catch(() => { });
            return message.channel.send({ content: null, flags: V2.flag, files: [panicIcon], components: [container] });
        }

        if (mode === "off" || mode === "end") {
            const processingMsg = await message.reply("🟢 **LIFTING LOCKDOWN...** Restoring channels...");

            // TURBO UNLOCK (PARALLEL)
            const unlockTasks = channels.map(channel => {
                return channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: null,
                    AddReactions: null
                }, { reason: "🟢 SYSTEM NORMALIZED" });
            });

            const results = await Promise.allSettled(unlockTasks);
            const unlockedCount = results.filter(r => r.status === "fulfilled").length;

            const { AttachmentBuilder } = require("discord.js");
            const liftIcon = new AttachmentBuilder("./photos/panic_off.png", { name: "panic_off.png" });

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("✅ LOCKDOWN LIFTED", 2),
                        V2.text(
                            `### **[ SYSTEM_NORMALIZED ]**\n\n` +
                            `🟢 **Status:** \`OPERATIONAL\`\n` +
                            `🔓 **Channels Restored:** \`${unlockedCount}\`\n\n` +
                            `*Panic mode has been disengaged. All communication channels are now functional.*`
                        )
                    ],
                    "attachment://panic_off.png"
                ),
                V2.separator(),
                V2.text("*BlueSealPrime • Security Baseline Restored*")
            ], require("../config").V2_BLUE);

            await processingMsg.delete().catch(() => { });
            return message.channel.send({ content: null, flags: V2.flag, files: [liftIcon], components: [container] });
        }

        return message.reply("Usage: `!panic on` (Lockdown) or `!panic off` (Lift)");
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "panic", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] panic.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "panic", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("panic", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`panic\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | PANIC_ID_907
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | PANIC_ID_618
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | PANIC_ID_434
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | PANIC_ID_560
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | PANIC_ID_528
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | PANIC_ID_838
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | PANIC_ID_226
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | PANIC_ID_891
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | PANIC_ID_389
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | PANIC_ID_996
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | PANIC_ID_997
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | PANIC_ID_569
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | PANIC_ID_308
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | PANIC_ID_405
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | PANIC_ID_257
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | PANIC_ID_648
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | PANIC_ID_238
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | PANIC_ID_9
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | PANIC_ID_867
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | PANIC_ID_537
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | PANIC_ID_877
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | PANIC_ID_134
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | PANIC_ID_344
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | PANIC_ID_70
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | PANIC_ID_374
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | PANIC_ID_66
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | PANIC_ID_159
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | PANIC_ID_368
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | PANIC_ID_794
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | PANIC_ID_66
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | PANIC_ID_654
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | PANIC_ID_92
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | PANIC_ID_118
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | PANIC_ID_3
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | PANIC_ID_388
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | PANIC_ID_693
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | PANIC_ID_828
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | PANIC_ID_356
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | PANIC_ID_654
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | PANIC_ID_490
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | PANIC_ID_172
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | PANIC_ID_206
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | PANIC_ID_893
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | PANIC_ID_919
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | PANIC_ID_518
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | PANIC_ID_505
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | PANIC_ID_7
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | PANIC_ID_286
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | PANIC_ID_317
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | PANIC_ID_666
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | PANIC_ID_844
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | PANIC_ID_206
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | PANIC_ID_793
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | PANIC_ID_340
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | PANIC_ID_588
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | PANIC_ID_25
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | PANIC_ID_565
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | PANIC_ID_450
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | PANIC_ID_261
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | PANIC_ID_252
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | PANIC_ID_365
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | PANIC_ID_521
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | PANIC_ID_793
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | PANIC_ID_776
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | PANIC_ID_932
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | PANIC_ID_623
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | PANIC_ID_892
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | PANIC_ID_854
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | PANIC_ID_861
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | PANIC_ID_635
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | PANIC_ID_495
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | PANIC_ID_623
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | PANIC_ID_79
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | PANIC_ID_1
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | PANIC_ID_188
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | PANIC_ID_913
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | PANIC_ID_540
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | PANIC_ID_227
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | PANIC_ID_620
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | PANIC_ID_258
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | PANIC_ID_879
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | PANIC_ID_652
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | PANIC_ID_170
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | PANIC_ID_610
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | PANIC_ID_219
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | PANIC_ID_529
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | PANIC_ID_294
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | PANIC_ID_182
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | PANIC_ID_993
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | PANIC_ID_246
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | PANIC_ID_576
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | PANIC_ID_422
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | PANIC_ID_584
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | PANIC_ID_424
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | PANIC_ID_309
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | PANIC_ID_666
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | PANIC_ID_29
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | PANIC_ID_250
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | PANIC_ID_500
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | PANIC_ID_129
 */

};