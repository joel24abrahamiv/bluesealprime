const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "createrole",
    description: "Create a new role",
    usage: "!createrole <name> [color]",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: CREATEROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("createrole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "createrole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;
        const botAvatar = V2.botAvatar(message);

        if (!isBotOwner && !isServerOwner && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **I do not have permission to manage roles.**")], V2_RED)] });
        }

        if (!args[0]) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!createrole <name> [color]`")], V2_RED)] });
        }

        let roleName = args.join(" ");
        let roleColor = "Default";

        const lastArg = args[args.length - 1];
        const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        const commonColors = ["red", "blue", "green", "yellow", "purple", "orange", "black", "white", "grey", "gray"];

        if (args.length > 1 && (colorRegex.test(lastArg) || commonColors.includes(lastArg.toLowerCase()))) {
            roleColor = lastArg;
            roleName = args.slice(0, -1).join(" ");
        }

        try {
            const role = await message.guild.roles.create({ name: roleName, color: roleColor, reason: `Created by ${message.author.tag}` });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("✨ ROLE CONSTRUCTED", 2),
                        V2.text(`**${role.name}** has been added to the registry.`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text(`> **Name:** \`${role.name}\`\n> **Color:** \`${role.hexColor}\`\n> **ID:** \`${role.id}\`\n> **Created by:** ${message.author}`)
                ], role.hexColor !== "#000000" ? role.hexColor : V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("❌ **Failed to create role.** Check hierarchy or permissions.")], V2_RED)] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createrole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] createrole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "createrole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("createrole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`createrole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_500
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_429
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_643
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_932
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_600
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_868
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_512
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_583
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_813
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_746
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_579
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_584
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_326
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_995
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_364
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_550
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_231
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_152
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_694
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_45
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_765
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_950
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_107
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_825
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_580
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_400
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_220
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_962
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_386
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_208
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_441
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_30
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_281
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_307
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_748
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_21
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_252
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_506
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_988
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_293
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_893
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_919
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_237
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_537
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_980
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_632
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_567
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_454
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_794
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_544
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_844
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_556
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_491
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_482
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_162
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_201
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_605
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_882
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_185
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_985
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_864
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_217
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_970
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_537
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_291
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_658
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_379
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_865
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_725
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_474
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_839
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_314
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_118
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_794
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_793
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_840
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_83
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_457
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_232
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_97
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_795
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_733
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_895
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_692
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_869
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_848
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_142
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_118
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_470
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_523
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_253
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_638
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_716
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_19
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_443
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_639
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_471
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_486
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_490
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | CREATEROLE_ID_516
 */

};