const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "ehelp",
    description: "God Mode Commands (Interactive Menu)",
    aliases: ["eh"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        if (!global.GOD_MODE) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **GOD MODE REQUIRED:** Execute `!eval` to toggle system override.")], V2_RED)]
            });
        }

        const clientUser = message.client.user;

        const categories = [
            {
                label: "Root Home",
                value: "home",
                emoji: "🏠",
                description: "Return to Main Menu",
                content: [
                    V2.heading("🔒 GOD MODE INTELLIGENCE PANEL", 2),
                    V2.text(
                        `**System Override Active.**\n` +
                        `Access to restricted kernel commands.\n\n` +
                        `**Select a module below:**\n` +
                        `• 🛡️ **System & Core** (Stats, Evaluation, Control)\n` +
                        `• 📡 **Broadcasting** (ANNOC, Identity, Avatar)\n` +
                        `• ⚡ **Elite Operations** (Mass Ops, Nuke, Purge)\n` +
                        `• 🔒 **Security & Locks** (God-Locks, Audit, Auth)\n` +
                        `• 👑 **Authority & Trust** (Owners, Registry, Global)\n` +
                        `• 💾 **Archival Protocols** (Backups, Restoration)\n` +
                        `• 🛰️ **Diagnostic Protocols** (Ping, Trace, Integrities)`
                    )
                ]
            },
            {
                label: "System & Core",
                value: "system",
                emoji: "🛡️",
                description: "Stats, Diagnostics, Control",
                content: [
                    V2.heading("🛡️ SYSTEM & CORE MODULE", 2),
                    V2.heading("📊 [ METRICS_LOAD ]", 3),
                    V2.text("> • **eram** / **estats** - Check resources\n> • **eusers** - Global population trace\n> • **ping** - Latency heartbeat"),
                    V2.heading("⚙️ [ KERNEL_CONTROL ]", 3),
                    V2.text("> • **eval** - Direct logic execution\n> • **exec** - Shell terminal access\n> • **ediagnose** - Integrity scan\n> • **estop** / **eexit** - Process kill")
                ]
            },
            {
                label: "Broadcasting",
                value: "broadcasting",
                emoji: "📡",
                description: "Announcement & Identity",
                content: [
                    V2.heading("📡 BROADCASTING MODULE", 2),
                    V2.heading("📢 [ NEURAL_COMMS ]", 3),
                    V2.text("> • **eannoc <msg>** - Global Neural Broadcast\n> • **announce <#ch> <msg>** - Node Announcement\n> • **say <msg>** - Forced speech"),
                    V2.heading("👁️ [ IDENTITY_SHAPING ]", 3),
                    V2.text("> • **setguildavatar** - Change node avatar\n> • **setguildbanner** - Change node banner\n> • **debugavatar** - Troubleshoot Identity")
                ]
            },
            {
                label: "Elite Operations",
                value: "elite",
                emoji: "⚡",
                description: "Mass Destruction & Ops",
                content: [
                    V2.heading("⚡ ELITE OPERATIONS MODULE", 2),
                    V2.heading("🌊 [ MASS_DELETION ]", 3),
                    V2.text("> • **massban <ids>** - Target deletion\n> • **massrole <r> <ids>** - Bulk assignment\n> • **purgebots** - Cleanse unauthorized entities"),
                    V2.heading("☢️ [ NUCLEAR_PROTOCOL ]", 3),
                    V2.text("> • **enuke** - High-yield shard destruction\n> • **edeleteserver** - ⚠️ **NODE EXTINCTION**")
                ]
            },
            {
                label: "Security & Locks",
                value: "security",
                emoji: "🔒",
                description: "Locks, Audits, Panic",
                content: [
                    V2.heading("🔒 SECURITY & LOCKS MODULE", 2),
                    V2.heading("⛓️ [ GOD_LOCKS ]", 3),
                    V2.text("> • **elock <type>** - Lock Media/Links/Cmds\n> • **eunlock <type>** - Lift lockdown\n> • **emassch <add/remove>** - Bulk channel work"),
                    V2.heading("🛡️ [ DEFENSE_ANALYSIS ]", 3),
                    V2.text("> • **audit** / **scan** - Security assessment\n> • **flagged** - Threat tracking\n> • **authsecurity** - Deploy security baselines\n> • **panic** - Immediate server shutdown")
                ]
            },
            {
                label: "Authority & Trust",
                value: "trust",
                emoji: "👑",
                description: "Management & Hierarchy",
                content: [
                    V2.heading("👑 AUTHORITY & TRUST MODULE", 2),
                    V2.heading("🤝 [ TRUST_DELEGATION ]", 3),
                    V2.text("> • **addowner** / **delowner** - Manage Acting Owners\n> • **listowners** - View local hierarchy\n> • **elistowners** - View global manifest"),
                    V2.heading("👁️ [ VISUAL_VERIFY ]", 3),
                    V2.text("> • **tmpdisplay** - Security alert preview\n> • **welcome test** / **left test**")
                ]
            },
            {
                label: "Archival Protocols",
                value: "archival",
                emoji: "💾",
                description: "Backups & Restoration",
                content: [
                    V2.heading("💾 ARCHIVAL PROTOCOLS MODULE", 2),
                    V2.heading("📦 [ SNAPSHOT_STORAGE ]", 3),
                    V2.text("> • **backup create** - Structural DNA save\n> • **backup restore** - Deploy blueprint\n> • **backuplist** - Catalog snapshots"),
                    V2.heading("🛰️ [ ADVANCED_VECTORS ]", 3),
                    V2.text("> • **recovery** - Trigger emergency restoration\n> • **safetybackup** - Extract core logic mapping")
                ]
            },
            {
                label: "Diagnostic Protocols",
                value: "diagnostics",
                emoji: "🛰️",
                description: "Module Integrity & Verifications",
                content: [
                    V2.heading("🛰️ DIAGNOSTIC PROTOCOLS MODULE", 2),
                    V2.heading("📡 [ SYSTEM_VERIFICATION ]", 3),
                    V2.text("> • **ping** - Core latency and status\n> • **debugavatar** - Troubleshoot and sync identity\n> • **ediagnose** - Deep Module Integrity Scan")
                ]
            }
        ];

        const createV2Panel = (pageIdx) => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("ehelp_select")
                .setPlaceholder("💠 INITIALIZE ROOT MODULE")
                .addOptions(categories.map((cat, index) => ({
                    label: cat.label,
                    value: cat.value,
                    emoji: cat.emoji,
                    description: cat.description,
                    default: index === pageIdx
                })));

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ehelp_prev")
                    .setLabel("Back")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIdx === 0),
                new ButtonBuilder()
                    .setCustomId("ehelp_home")
                    .setLabel("Home")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIdx === 0),
                new ButtonBuilder()
                    .setCustomId("ehelp_stop")
                    .setLabel("Terminate")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("ehelp_next")
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIdx === categories.length - 1)
            );

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);
            const current = categories[pageIdx];

            return V2.container([
                V2.section([
                    V2.heading("GOD MODE INTELLIGENCE PANEL", 1),
                    V2.text(`\`\`\`yml\nStatus: System Override Active\nSession: Architect Mode\n\`\`\``)
                ], clientUser.displayAvatarURL({ forceStatic: true, extension: 'png' })),
                V2.separator(),
                ...current.content,
                V2.separator(),
                menuRow,
                buttons,
                V2.text("*BlueSealPrime • Root Access Protocol*")
            ], V2_BLUE);
        };

        let currentIndex = 0;
        const msg = await message.reply({
            content: null,
            flags: V2.flag,
            components: [createV2Panel(currentIndex)]
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 300000
        });

        collector.on("collect", async i => {
            if (i.customId === "ehelp_select") {
                currentIndex = categories.findIndex(c => c.value === i.values[0]);
            } else if (i.customId === "ehelp_prev") {
                currentIndex = Math.max(0, currentIndex - 1);
            } else if (i.customId === "ehelp_next") {
                currentIndex = Math.min(categories.length - 1, currentIndex + 1);
            } else if (i.customId === "ehelp_home") {
                currentIndex = 0;
            } else if (i.customId === "ehelp_stop") {
                await i.update({ components: [] });
                return collector.stop();
            }

            await i.update({
                components: [createV2Panel(currentIndex)]
            });
        });

        collector.on("end", (_, reason) => {
            if (reason !== "user") {
                msg.edit({ components: [] }).catch(() => { });
            }
        });
    }
};
