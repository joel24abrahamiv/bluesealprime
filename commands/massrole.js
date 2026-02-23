const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "massrole",
    description: "Mass Add/Remove a role to ALL members (Admin Only)",
    usage: "!massrole <add|remove> <@role>",
    permissions: [PermissionsBitField.Flags.Administrator],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: MASSROLE
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("massrole") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "massrole", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **ACCESS DENIED** | Level 5 Security Restricted to Bot Owner.")], V2_RED)]
            });
        }

        const action = args[0]?.toLowerCase();
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!["add", "remove"].includes(action) || !role) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid Syntax**\nUsage: `!massrole <add|remove> <@role>`")], V2_RED)]
            });
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Hierarchy Error**: I cannot manage a role that is higher than or equal to my highest role.")], V2_RED)]
            });
        }

        const initContainer = V2.container([
            V2.section([
                V2.heading(`🔄 MASS ${action.toUpperCase()} INITIATED`, 2),
                V2.text(`Processing **${message.guild.memberCount}** members...\n**Target Role:** ${role}\n> Operation in progress...`)
            ], "https://cdn-icons-png.flaticon.com/512/3064/3064155.png")
        ], "#FFFF00");

        await message.reply({ content: null, components: [initContainer] });

        let successCount = 0;
        let failCount = 0;
        const members = (await message.guild.members.fetch()).filter(m => !m.user.bot);

        await Promise.all(Array.from(members.values()).map(async (member) => {
            try {
                if (action === "add" && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role, "Mass Role Operation");
                    successCount++;
                } else if (action === "remove" && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role, "Mass Role Operation");
                    successCount++;
                }
            } catch (err) {
                failCount++;
            }
        }));

        const finalContainer = V2.container([
            V2.section([
                V2.heading(`✅ MASS ${action.toUpperCase()} COMPLETE`, 2),
                V2.text(
                    `### **[ ROLE_UPDATE_SUCCESS ]**\n\n` +
                    `> **Target Role:** ${role}\n` +
                    `> **Processed:** \`${successCount}\` members\n` +
                    `> **Failed Linked:** \`${failCount}\` (Hierarchy/Permissions)`
                )
            ], "https://cdn-icons-png.flaticon.com/512/190/190411.png"),
            V2.separator(),
            V2.text("*BlueSealPrime • Global Hierarchy Synced*")
        ], V2_BLUE);

        return message.channel.send({ content: null, components: [finalContainer] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "massrole", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] massrole.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "massrole", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("massrole", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`massrole\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_78
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_356
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_359
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_71
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_458
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_440
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_22
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_672
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_160
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_249
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_884
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_752
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_316
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_14
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_81
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_354
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_989
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_334
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_914
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_91
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_699
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_615
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_952
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_468
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_506
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_162
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_42
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_748
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_756
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_322
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_919
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_627
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_87
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_391
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_864
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_524
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_527
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_704
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_579
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_799
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_842
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_367
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_215
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_885
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_916
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_861
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_235
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_282
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_469
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_184
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_407
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_839
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_570
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_667
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_451
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_299
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_450
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_641
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_843
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_730
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_384
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_331
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_418
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_183
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_928
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_260
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_670
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_355
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_555
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_106
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_54
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_646
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_893
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_63
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_508
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_352
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_916
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_927
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_102
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_125
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_128
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_434
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_616
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_205
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_226
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_528
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_837
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_71
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_246
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_653
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_361
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_664
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_23
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_976
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_488
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_359
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_711
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_989
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_784
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | MASSROLE_ID_663
 */

};