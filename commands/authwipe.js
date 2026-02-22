const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_RED } = require("../config");

module.exports = {
    name: "authwipe",
    description: "Forcefully purge all security roles from the node",
    aliases: ["aw", "wipeauth"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const clientUser = message.client.user;
        const guild = message.guild;

        const roleNames = [
            "BlueSealPrime!",
            "BlueSealPrime! anti nuke",
            "BlueSealPrime! unbypassable",
            "BlueSealPrime! secure",
            "BlueSealPrime! anti-raid"
        ];

        const msg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🗑️ INITIATING GLOBAL PURGE", 2),
                V2.text("Fetching all node roles for decommissioning...")
            ], "#FFA500")]
        });

        try {
            // 1. Use cache to avoid rate limitations
            const allRoles = guild.roles.cache;
            let totalDeleted = 0;
            const wipeLogs = [];

            // 2. Loop through role names and find ALL instances in cache
            for (const name of roleNames) {
                const matching = allRoles.filter(r => r.name === name);
                if (matching.size > 0) {
                    wipeLogs.push(`🔹 Found **${matching.size}** instances of \`${name}\``);
                    for (const [id, role] of matching) {
                        try {
                            await role.delete("Global Security Purge Protocol");
                            totalDeleted++;
                        } catch (e) {
                            wipeLogs.push(`❌ Failed to delete instance of \`${name}\``);
                        }
                    }
                }
            }

            const completeContainer = V2.container([
                V2.section([
                    V2.heading("✅ GLOBAL PURGE COMPLETE", 2),
                    V2.text(`**Decommissioning Successful.**\nSuccessfully dissolved **${totalDeleted}** security role instances.`)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(wipeLogs.join("\n") || "*No residual security roles were found on the node.*"),
                V2.separator(),
                V2.text(`*Status: NODE_CLEANSED • Architect Mode*`)
            ], V2_RED);

            await msg.edit({ components: [completeContainer] });

        } catch (err) {
            console.error(err);
            await msg.edit({
                components: [V2.container([V2.text("❌ **CRITICAL_FAULT:** Failed to execute global purge.")], V2_RED)]
            });
        }
    }
};
