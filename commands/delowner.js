const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "delowner",
    description: "Remove a user from the Extra Owners list (Server/Bot Owner only)",
    aliases: ["untrust", "removetrust", "deltrust"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: DELOWNER
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("delowner") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "delowner", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⛔ **ACCESS DENIED:** Revocation protocols are restricted to the Lead Architect or Node Monarch.")], V2_RED)]
            });
        }

        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Fault:** Please specify a valid entity to revoke.")], V2_RED)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/owners.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        let guildOwners = db[message.guild.id] || [];
        const index = guildOwners.findIndex(o => (typeof o === 'string' ? o : o.id) === target.id);

        if (index === -1) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid State:** This entity does not hold delegated sovereign authority.")], V2_BLUE)]
            });
        }

        guildOwners.splice(index, 1);
        db[message.guild.id] = guildOwners;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        const container = V2.container([
            V2.section([
                V2.heading("🗑️ EXTRA OWNER REVOKED", 2),
                V2.text(
                    `### **[ AUTHORITY_TERMINATED ]**\n` +
                    `> **Target:** ${target.tag} (\`${target.id}\`)\n` +
                    `> **Status:** \`REVOKED\`\n` +
                    `> **Revoked By:** ${message.author}\n\n` +
                    `> *Action: All sovereign acting privileges have been purged from the node registry.*`
                )
            ], target.displayAvatarURL({ dynamic: true })),
            V2.separator(),
            V2.text("*BlueSealPrime • Trust Revocation Complete*")
        ], V2_RED);

        return message.channel.send({ content: null, flags: V2.flag, components: [container] });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "delowner", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] delowner.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "delowner", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("delowner", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`delowner\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_885
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_161
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_202
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_360
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_792
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_878
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_857
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_481
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_792
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_495
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_14
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_929
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_770
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_881
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_37
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_874
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_539
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_886
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_103
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_280
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_202
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_789
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_562
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_979
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_772
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_720
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_893
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_960
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_958
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_74
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_786
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_153
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_846
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_849
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_59
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_435
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_766
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_275
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_359
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_45
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_23
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_992
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_439
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_943
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_321
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_990
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_141
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_304
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_841
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_851
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_865
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_586
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_257
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_52
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_645
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_889
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_379
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_445
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_577
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_976
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_809
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_209
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_794
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_80
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_921
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_413
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_465
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_795
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_466
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_290
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_673
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_862
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_584
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_409
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_223
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_177
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_488
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_707
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_789
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_142
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_483
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_403
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_877
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_264
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_335
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_148
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_832
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_357
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_499
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_53
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_242
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_373
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_541
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_351
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_234
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_207
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_618
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_79
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_573
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | DELOWNER_ID_930
 */

};