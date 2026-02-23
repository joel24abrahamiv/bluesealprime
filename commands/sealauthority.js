const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "sealauthority",
    description: "Manage Sovereign Security & Node Jurisdiction",
    aliases: ["seaauth", "sa"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const clientUser = message.client.user;
        const guild = message.guild;
        const action = args[0]?.toLowerCase();

        const roleNames = [
            "BlueSealPrime!",
            "BlueSealPrime! anti nuke",
            "BlueSealPrime! unbypassable",
            "BlueSealPrime! secure",
            "BlueSealPrime! anti-raid"
        ];

        const rolesToCreate = [
            { name: "BlueSealPrime!", type: "Primary Admin" },
            { name: "BlueSealPrime! anti-nuke", type: "Secondary Admin" },
            { name: "BlueSealPrime! unbypassable", type: "Hidden Admin" },
            { name: "BlueSealPrime! secure", type: "Security Admin" },
            { name: "BlueSealPrime! anti-raid", type: "Raid Specialist" }
        ];

        // 📊 ACTION: STATUS
        if (action === "status") {
            const me = guild.members.me;
            const activeRoles = me.roles.cache.filter(r => roleNames.includes(r.name));
            const statusLogs = roleNames.map(name => {
                const found = guild.roles.cache.find(r => r.name === name);
                const assigned = me.roles.cache.some(r => r.name === name);
                const isTooHigh = found && found.position >= me.roles.highest.position;

                return `${found ? (isTooHigh ? "⚠️" : "✅") : "❌"} **${name}**: ${found ? (isTooHigh ? "Hierarchically Locked" : (assigned ? "Armed" : "Detached")) : "Offline"} ${found ? `*[Pos: ${found.position}]*` : ""}`;
            });

            const statusContainer = V2.container([
                V2.section([
                    V2.heading("📡 AUTHORITY DISPATCH STATUS", 2),
                    V2.text(`**Node Integrity:** ${activeRoles.size === roleNames.length ? "MAXIMUM" : "DEGRADED"}\n**Target:** ${guild.name}\n**Bot Highest:** [Pos: ${me.roles.highest.position}]`)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(statusLogs.join("\n")),
                V2.separator(),
                V2.text(`*System Progress: [${activeRoles.size}/5] Security Nodes Active*`)
            ], activeRoles.size === roleNames.length ? V2_BLUE : "#FFA500");

            return message.reply({ content: null, flags: V2.flag, components: [statusContainer] });
        }

        // 🔴 ACTION: DISABLE / OFF
        if (action === "disable" || action === "off") {
            message.client.saBypass = true; // Block auto-restore
            const decommissionLogs = [];
            let deletedCount = 0;
            const me = guild.members.me;

            for (const name of roleNames) {
                const matching = guild.roles.cache.filter(r => r.name === name);
                if (matching.size > 0) {
                    for (const [id, role] of matching) {
                        try {
                            if (role.position >= me.roles.highest.position) {
                                decommissionLogs.push(`⚠️ **Hierarchy Block:** \`${name}\` is above me.`);
                                continue;
                            }
                            await role.delete("Sovereign Security Decommissioning");
                            deletedCount++;
                        } catch (e) {
                            decommissionLogs.push(`❌ **Fatal Error:** Could not dissolve \`${name}\`.`);
                        }
                    }
                    if (deletedCount > 0) decommissionLogs.push(`🗑️ Dissolved layer: \`${name}\``);
                }
            }

            const decommissionContainer = V2.container([
                V2.section([
                    V2.heading("🔓 AUTHORITY DE-INITIALIZED", 2),
                    V2.text(`**Sovereign Shield Disarmed.**\nAll administrative security layers have been purged from the node.`)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(deletedCount > 0 ? decommissionLogs.join("\n") : "*No active security layers found to dissolve.*"),
                V2.separator(),
                V2.text(`*Status: SYSTEM_UNPROTECTED • Node: ${guild.name}*`)
            ], V2_RED);

            message.client.saBypass = false;
            return message.reply({ content: null, flags: V2.flag, components: [decommissionContainer] });
        }

        // 🔵 ACTION: ENABLE / ON (AUTO-RUN REGULAR ON LOGIC)
        message.client.saBypass = true;
        // Check for "already armed" first
        const currentActive = guild.members.me.roles.cache.filter(r => roleNames.includes(r.name));
        if (currentActive.size === roleNames.length) {
            message.client.saBypass = false;
            const armedContainer = V2.container([
                V2.section([
                    V2.heading("🛡️ AUTHORITY ALREADY SEALED", 2),
                    V2.text(`**Jurisdiction Confirmed.**\nThe 5-tier security matrix is already synchronized and assigned. Redundant initialization bypassed.`)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(`*Status: SYSTEM_PROTECTED • Priority: MAXIMUM*`)
            ], V2_BLUE);
            return message.reply({ content: null, flags: V2.flag, components: [armedContainer] });
        }

        // Run Deployment
        let logs = [];
        const updatePanel = async (currentStep) => {
            const container = V2.container([
                V2.section([
                    V2.heading("⚡ SEALING NODE AUTHORITY", 2),
                    V2.text(`\`\`\`yml\nTime: ${new Date().toLocaleTimeString()}\nExecuted by: @${message.author.username}\n\`\`\``)
                ], clientUser.displayAvatarURL()),
                V2.separator(),
                V2.text(logs.join("\n")),
                V2.separator(),
                V2.text(`*Auth Sink: [${currentStep}/5] | ${currentStep === 5 ? "MAX_JURISDICTION" : "SEALING..."}*`)
            ], V2_BLUE);

            if (msg) await msg.edit({ content: null, components: [container] }).catch(() => { });
            else msg = await message.reply({ content: null, flags: V2.flag, components: [container] });
        };

        let msg = null;
        logs.push("🔵 **Synchronizing Sovereign Node...**");
        await updatePanel(0);

        // 🧹 PRE-CLEANSE
        try {
            const allRoles = guild.roles.cache;
            for (const name of roleNames) {
                const matching = allRoles.filter(r => r.name === name);
                if (matching.size > 0) {
                    for (const [id, r] of matching) {
                        try {
                            await r.delete("Consolidating Security Matrix");
                            await new Promise(r => setTimeout(r, 200));
                        } catch (e) { }
                    }
                }
            }
        } catch (e) { }

        for (let i = 0; i < rolesToCreate.length; i++) {
            const roleData = rolesToCreate[i];
            logs.push(`🔹 Sealing ${roleData.type}: \`${roleData.name}\``);
            try {
                let targetPerms = [];
                if (guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    targetPerms = [PermissionsBitField.Flags.Administrator];
                }

                const newRole = await guild.roles.create({
                    name: roleData.name,
                    color: "#5DADE2", // Sovereign Blue
                    permissions: targetPerms,
                    reason: "SealAuthority Initialization: Absolute Dominance"
                });

                // 👑 HIERARCHY DOMINANCE: Move to the top (just below bot's integration role)
                const me = guild.members.me;
                const topPos = me.roles.highest.position;
                if (topPos > 0) {
                    await newRole.setPosition(topPos - 1).catch(() => { });
                }

                await me.roles.add(newRole).catch(() => { });
                logs.push(`✅ ${roleData.type} locked [${i + 1}/5]`);
            } catch (err) {
                console.error(`[SealAuthority Error]:`, err);
                logs.push(`❌ Access Denied: Failed to seal ${roleData.name}`);
            }
            await updatePanel(i + 1);
            await new Promise(r => setTimeout(r, 800));
        }

        // 🚀 FINAL PHASE: SELF-POSITIONING
        logs.push(`\n🔱 **Enforcing Absolute Jurisdiction...**`);
        await updatePanel(5);
        try {
            const me = guild.members.me;
            const botRole = me.roles.botRole;
            if (botRole) {
                // Fetch for latest positions
                const allRoles = await guild.roles.fetch();
                const maxPos = allRoles.size - 1;
                if (botRole.position < maxPos) {
                    await botRole.setPosition(maxPos, { reason: "Sovereign Dominance: Manual Authority Enforced." }).catch(() => { });
                }
            }
        } catch (e) { }

        logs.push(`\n**Node Sealed:** Authority finalized under **BlueSealPrime!** logic.`);
        await updatePanel(5);
        message.client.saBypass = false;
    }
};
