const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "god_security",
    description: "God Mode Security Commands",
    aliases: ["scanserver", "purgebots", "recovery", "flagged"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // SCANSERVER: Audit Wrapper
        if (commandName === "scanserver") {
            const auditCmd = message.client.commands.get("audit");
            if (auditCmd) return auditCmd.execute(message, args);
            else return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Module Fault:** Audit scanner module not found.")], V2_RED)]
            });
        }

        // PURGEBOTS: Kick all bots except me
        if (commandName === "purgebots") {
            const bots = message.guild.members.cache.filter(m => m.user.bot && m.id !== message.client.user.id);
            if (bots.size === 0) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("ℹ️ **Network Scan:** No unauthorized bot entities detected.")], V2_BLUE)]
            });

            const initContainer = V2.container([
                V2.section([
                    V2.heading("🚨 INITIATING BOT PURGE", 2),
                    V2.text(`Targeting **${bots.size}** detected bot entities for immediate termination.`)
                ], "https://cdn-icons-png.flaticon.com/512/3662/3662817.png")
            ], V2_RED);

            await message.reply({ content: null, flags: V2.flag, components: [initContainer] });

            let kicked = 0;
            await Promise.all(Array.from(bots.values()).map(async (bot) => {
                if (bot.kickable) {
                    await bot.kick("God Mode: Bot Purge Protocol");
                    kicked++;
                }
            }));

            const completeContainer = V2.container([
                V2.section([
                    V2.heading("✅ PURGE COMPLETE", 2),
                    V2.text(`Eliminated **${kicked}** unauthorized bot entities from the server node.`)
                ], "https://cdn-icons-png.flaticon.com/512/190/190411.png")
            ], V2_BLUE);

            return message.channel.send({ content: null, flags: V2.flag, components: [completeContainer] });
        }

        // FLAGGED: Check for dangerous users
        if (commandName === "flagged") {
            const dangerous = message.guild.members.cache.filter(m =>
                m.permissions.has(PermissionsBitField.Flags.Administrator) && !m.user.bot && m.id !== message.guild.ownerId
            );

            const dangerousList = dangerous.size > 0
                ? dangerous.map(m => `> • ${m.user.tag} (\`${m.id}\`) - **ADMIN**`).join("\n")
                : "> *No unauthorized administrators detected.*";

            const flaggedContainer = V2.container([
                V2.section([
                    V2.heading("🚩 THREAT ANALYSIS REPORT", 2),
                    V2.text(`### **[ FLAGGED_ENTITIES ]**\n\n${dangerousList}`)
                ], "https://cdn-icons-png.flaticon.com/512/179/179386.png"),
                V2.separator(),
                V2.text("*BlueSealPrime • Security Risk Assessment*")
            ], dangerous.size > 0 ? V2_RED : V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [flaggedContainer] });
        }

        if (commandName === "recovery") {
            const restoreCmd = message.client.commands.get("restore");
            if (restoreCmd) return restoreCmd.execute(message, args);
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **Module Fault:** Recovery engine not found.")], V2_RED)]
            });
        }
    }
};
