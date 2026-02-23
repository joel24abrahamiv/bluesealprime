const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR, SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "chperm",
    description: "Modify channel permissions for a user or role.",
    usage: "!chperm <@role|@user> <allow|deny|neutral|default> <view|send|connect|all>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["cp", "perm"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: CHPERM
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("chperm") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "chperm", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            if (args.length < 3) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:** `!chperm <target> <allow|deny|default> <permission>`\n\n**Perms:** `view`, `send`, `connect`, `all`")]
            });
        }

        const target = message.mentions.roles.first() || message.mentions.members.first() || await message.guild.roles.fetch(args[0]).catch(() => null) || await message.guild.members.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Target (User/Role) not found.")] });
        }

        const action = args[1].toLowerCase();
        const permType = args[2].toLowerCase();

        // Mapping string to PermissionFlagBits
        let permsToChange = [];

        if (permType === "view") permsToChange.push(PermissionsBitField.Flags.ViewChannel);
        else if (permType === "send") permsToChange.push(PermissionsBitField.Flags.SendMessages);
        else if (permType === "connect") permsToChange.push(PermissionsBitField.Flags.Connect);
        else if (permType === "all") {
            permsToChange.push(PermissionsBitField.Flags.ViewChannel);
            permsToChange.push(PermissionsBitField.Flags.SendMessages);
            permsToChange.push(PermissionsBitField.Flags.Connect);
        } else {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Invalid Permission Type. Use: `view`, `send`, `connect`, `all`.")] });
        }

        let overwriteObj = {};
        if (action === "allow") {
            permsToChange.forEach(p => overwriteObj[p] = true);
        } else if (action === "deny") {
            permsToChange.forEach(p => overwriteObj[p] = false);
        } else if (action === "default" || action === "neutral") {
            permsToChange.forEach(p => overwriteObj[p] = null);
        } else {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Invalid Action. Use: `allow`, `deny`, `default`.")] });
        }

        try {
            await message.channel.permissionOverwrites.edit(target.id, overwriteObj);

            const { AttachmentBuilder } = require("discord.js");
            const lockIcon = new AttachmentBuilder("./assets/lock.png", { name: "lock.png" });

            const V2 = require("../utils/v2Utils");
            const container = V2.container([
                V2.section([
                    V2.heading("🔒 PERMISSIONS UPDATED", 2),
                    V2.text(`Successfully modified access protocols for **${target.name || target.user.tag}** in ${message.channel}.`)
                ], "attachment://lock.png"), // Premium Blue Lock
                V2.separator(),
                V2.heading("⚖️ CONFIGURATION", 3),
                V2.text(`> **Action:** ${action.toUpperCase()}\n> **Permission:** ${permType.toUpperCase()}`),
                V2.separator(),
                V2.text(`> **Authorized By:** ${message.author}\n> **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:f>`),
                V2.separator(),
                V2.text("*BlueSealPrime • Security Architecture*")
            ], "#0099ff");

            message.channel.send({ content: null, flags: V2.flag, files: [lockIcon], components: [container] });

        } catch (err) {
            console.error(err);
            message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to update permissions.")] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "chperm", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] chperm.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "chperm", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("chperm", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`chperm\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | CHPERM_ID_825
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | CHPERM_ID_522
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | CHPERM_ID_442
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | CHPERM_ID_794
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | CHPERM_ID_316
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | CHPERM_ID_622
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | CHPERM_ID_270
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | CHPERM_ID_192
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | CHPERM_ID_24
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | CHPERM_ID_413
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | CHPERM_ID_581
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | CHPERM_ID_549
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | CHPERM_ID_962
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | CHPERM_ID_720
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | CHPERM_ID_898
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | CHPERM_ID_26
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | CHPERM_ID_709
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | CHPERM_ID_370
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | CHPERM_ID_591
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | CHPERM_ID_767
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | CHPERM_ID_251
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | CHPERM_ID_209
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | CHPERM_ID_727
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | CHPERM_ID_343
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | CHPERM_ID_887
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | CHPERM_ID_550
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | CHPERM_ID_812
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | CHPERM_ID_158
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | CHPERM_ID_463
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | CHPERM_ID_729
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | CHPERM_ID_677
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | CHPERM_ID_299
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | CHPERM_ID_179
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | CHPERM_ID_404
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | CHPERM_ID_125
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | CHPERM_ID_88
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | CHPERM_ID_415
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | CHPERM_ID_797
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | CHPERM_ID_321
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | CHPERM_ID_441
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | CHPERM_ID_57
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | CHPERM_ID_314
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | CHPERM_ID_683
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | CHPERM_ID_591
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | CHPERM_ID_644
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | CHPERM_ID_148
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | CHPERM_ID_554
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | CHPERM_ID_826
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | CHPERM_ID_763
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | CHPERM_ID_630
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | CHPERM_ID_898
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | CHPERM_ID_721
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | CHPERM_ID_911
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | CHPERM_ID_633
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | CHPERM_ID_104
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | CHPERM_ID_445
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | CHPERM_ID_510
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | CHPERM_ID_349
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | CHPERM_ID_484
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | CHPERM_ID_601
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | CHPERM_ID_161
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | CHPERM_ID_517
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | CHPERM_ID_732
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | CHPERM_ID_235
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | CHPERM_ID_809
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | CHPERM_ID_122
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | CHPERM_ID_938
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | CHPERM_ID_290
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | CHPERM_ID_390
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | CHPERM_ID_395
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | CHPERM_ID_792
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | CHPERM_ID_442
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | CHPERM_ID_489
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | CHPERM_ID_619
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | CHPERM_ID_900
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | CHPERM_ID_922
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | CHPERM_ID_16
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | CHPERM_ID_652
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | CHPERM_ID_366
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | CHPERM_ID_455
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | CHPERM_ID_608
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | CHPERM_ID_812
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | CHPERM_ID_249
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | CHPERM_ID_485
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | CHPERM_ID_882
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | CHPERM_ID_832
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | CHPERM_ID_138
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | CHPERM_ID_845
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | CHPERM_ID_949
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | CHPERM_ID_622
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | CHPERM_ID_826
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | CHPERM_ID_844
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | CHPERM_ID_628
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | CHPERM_ID_917
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | CHPERM_ID_460
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | CHPERM_ID_300
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | CHPERM_ID_186
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | CHPERM_ID_384
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | CHPERM_ID_926
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | CHPERM_ID_976
 */

};