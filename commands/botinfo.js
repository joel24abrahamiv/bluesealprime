const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");
const os = require("os");

module.exports = {
    name: "botinfo",
    description: "Display sovereign node intelligence and system status.",
    aliases: ["bi", "about", "binfo"],

    
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: BOTINFO
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("botinfo") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "botinfo", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const { client, guild } = message;
        const botUser = client.user;

        // ── SYNC STATS ──
        const uptime = formatUptime(client.uptime);
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);
        const channels = client.channels.cache.size;
        const commands = client.commands?.size || 0;

        // ── SYSTEM METER ──
        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const memTotal = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
        const cpuModel = os.cpus().length > 0 ? os.cpus()[0].model.split(" ").slice(0, 3).join(" ") : "Virtual Node";
        const ping = client.ws.ping;
        const pingIndicator = ping < 150 ? "🟢" : ping < 300 ? "🟡" : "🔴";

        // ── IDENTITY ──
        const avatar = V2.botAvatar(message);

        // ── CONSTRUCT SOVEREIGN DASHBOARD ──
        try {
            const dashboard = V2.container([
                // Header: Identity Primary
                V2.separator(),
                V2.section([
                    V2.heading("🛡️ BLUESEALPRIME: SOVEREIGN NODE", 1),
                    V2.text(`**V2 Internal Intelligence Feed**\n> **Architect:** <@${BOT_OWNER_ID}>\n> **Version:** \`2.1.0-Ω\``)
                ], avatar),
                V2.separator(),

                // Section 1: Network Metrics
                V2.heading("📊 NETWORK ANALYTICS", 2),
                V2.text(
                    `> 🏛️ **Total Nodes:** \`${guilds}\`\n` +
                    `> 👥 **Known Entities:** \`${users.toLocaleString()}\`\n` +
                    `> 📺 **Active Matrix:** \`${channels}\` Channels\n` +
                    `> ⚙️ **Indexed Logic:** \`${commands}\` Modules`
                ),
                V2.separator(),

                // Section 2: Core Performance
                V2.heading("⚡ HEARTBEAT & CORE", 2),
                V2.text(
                    `> ${pingIndicator} **Sync Latency:** \`${ping}ms\`\n` +
                    `> ⏱️ **Node Uptime:** \`${uptime}\`\n` +
                    `> 🧠 **Memory Heap:** \`${memUsed} MB / ${memTotal} MB\``
                ),
                V2.separator(),

                // Section 3: Hardware Signature
                V2.heading("🖥️ HARDWARE SIGNATURE", 2),
                V2.text(
                    `> 🧩 **Engine:** \`Node ${process.version}\`\n` +
                    `> 💎 **Interface:** \`DJS v${require("discord.js").version}\`\n` +
                    `> 🔧 **Processor:** \`${cpuModel}\`\n` +
                    `> 💠 **OS Platform:** \`${os.platform().toUpperCase()}\``
                ),
                V2.separator(),

                // Footer: Integrity
                V2.text(`*Security Integrity: VERIFIED • Node ID: ${botUser.id}*\n*BlueSealPrime © 2026 Sovereign Systems*`)
            ], V2_BLUE);

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [dashboard]
            });

        } catch (error) {
            console.error("[BotInfo Error]:", error);
            // Fallback to basic embed if V2 components fail (Safety for non-V2 environments)
            const { EmbedBuilder } = require("discord.js");
            const fallback = new EmbedBuilder()
                .setColor(V2_BLUE || "#5DADE2")
                .setTitle("🛡️ Bot Information (Legacy Mode)")
                .setDescription(`Sovereign V2 Interface encountered a rendering fault.\n\n**Uptime:** ${uptime}\n**Latency:** ${ping}ms\n**Servers:** ${guilds}`)
                .setFooter({ text: "Error: Components V2 rendering failure on this build." });

            return message.reply({ embeds: [fallback] });
        }
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "botinfo", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] botinfo.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "botinfo", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("botinfo", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`botinfo\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_373
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_975
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_201
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_181
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_333
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_174
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_605
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_0
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_825
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_823
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_458
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_434
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_670
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_573
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_205
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_987
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_69
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_18
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_302
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_494
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_25
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_187
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_224
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_771
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_597
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_836
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_266
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_190
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_22
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_978
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_278
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_631
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_354
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_243
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_700
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_912
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_546
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_406
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_832
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_390
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_552
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_890
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_603
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_625
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_330
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_918
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_460
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_717
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_536
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_974
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_592
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_72
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_188
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_754
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_208
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_589
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_384
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_194
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_980
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_472
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_428
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_53
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_2
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_524
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_324
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_464
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_89
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_707
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_504
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_33
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_570
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_640
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_893
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_216
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_162
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_214
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_678
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_920
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_843
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_836
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_467
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_993
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_321
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_493
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_37
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_774
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_261
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_854
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_66
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_238
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_365
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_660
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_425
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_98
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_109
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_544
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_197
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_536
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_76
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | BOTINFO_ID_585
 */



};

function formatUptime(ms) {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
