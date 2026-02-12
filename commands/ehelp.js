const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "ehelp",
    description: "God Mode Commands (Interactive Menu)",
    aliases: ["eh"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // CHECK IF GOD MODE IS ENABLED
        if (!global.GOD_MODE) {
            return message.reply("⚠️ **GOD MODE REQUIRED:** Execute `!eval` to toggle system override.");
        }

        const clientUser = message.client.user;

        // 1. HOME EMBED
        const homeEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("🔒 GOD MODE INTELLIGENCE PANEL")
            .setDescription(
                `**System Override Active.**\n` +
                `Access to restricted kernel commands.\n\n` +
                `**Select a module below:**\n` +
                `• 🛡️ **System & Utils** (Stats, Session, Diagnostic)\n` +
                `• 📡 **Broadcasting** (Neural Comms, Say, Announce)\n` +
                `• ⚡ **Elite Operations** (Mass Ops, Meta Control)\n` +
                `• 🔒 **Security & Locks** (God-Locks, Baseline, Panic)\n` +
                `• 👑 **Authority & Trust** (Owners, Nukes, Backups)`
            )
            .setThumbnail(clientUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "BlueSealPrime • Root Access Granted" })
            .setTimestamp();

        // 2. CATEGORIES
        const categories = [
            {
                label: "Root Home",
                value: "home",
                emoji: "🏠",
                description: "Return to Main Menu",
                embed: homeEmbed
            },
            {
                label: "System & Utils",
                value: "system",
                emoji: "🛡️",
                description: "Stats, Logs, Diagnostics",
                embed: new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle("🛡️ SYSTEM & UTILS MODULE")
                    .setDescription(
                        `### 📊 **[ SYSTEM_METRICS ]**\n` +
                        `> • **eram** / **estats** - Resource & Latency check\n` +
                        `> • **eusers** - Global user correlation\n` +
                        `> • **devinfo** - Internal developer data\n\n` +
                        `### 📝 **[ LOGGING_INTERCEPT ]**\n` +
                        `> • **elogs** / **elogsbot** - server & global audit\n` +
                        `> • **flagged** - High-risk entity tracking\n\n` +
                        `### ⚙️ **[ SESSION_CONTROL ]**\n` +
                        `> • **eval** - Execute kernel logic\n` +
                        `> • **estop** / **eexit** - Terminate process`
                    )
                    .setFooter({ text: "BlueSealPrime • Diagnostic Core" })
            },
            {
                label: "Broadcasting",
                value: "broadcasting",
                emoji: "📡",
                description: "Global Comms & Announcements",
                embed: new EmbedBuilder()
                    .setColor("#00FFFF")
                    .setTitle("📡 BROADCASTING MODULE")
                    .setDescription(
                        `### 📢 **[ NEURAL_COMMUNICATION ]**\n` +
                        `> • **eannoc <msg>** - Global Neural Broadcast\n` +
                        `> • **announce <#ch> <msg>** - Standard Announcement\n` +
                        `> • **say <msg>** - Force bot speech in channel\n\n` +
                        `### 📡 **[ SIGNAL_CONTROL ]**\n` +
                        `> • **createticket** - Trigger ticket system\n` +
                        `> • **scanserver** - Run Deep Scan Protocol`
                    )
                    .setFooter({ text: "BlueSealPrime • Comms Hub" })
            },
            {
                label: "Elite Operations",
                value: "elite",
                emoji: "⚡",
                description: "Mass Ops & Control",
                embed: new EmbedBuilder()
                    .setColor("#FF00FF")
                    .setTitle("⚡ ELITE OPERATIONS MODULE")
                    .setDescription(
                        `### 🌊 **[ MASS_OPERATIONS ]**\n` +
                        `> • **massban <ids>** - Rapid multi-target deletion\n` +
                        `> • **massrole <r> <ids>** - Bulk role assignment\n\n` +
                        `### ⚙️ **[ META_CONTROL ]**\n` +
                        `> • **renamech <name>** - Stealth channel renaming\n` +
                        `> • **rolecopy <r1> <r2>** - Inherit role DNA/perms\n` +
                        `> • **hide** / **show** - Invisibility protocol`
                    )
                    .setFooter({ text: "BlueSealPrime • Alpha Operations" })
            },
            {
                label: "Security & Locks",
                value: "security",
                emoji: "🔒",
                description: "God-Locks & Baselines",
                embed: new EmbedBuilder()
                    .setColor("#2E8B57")
                    .setTitle("🔒 SECURITY & LOCKS MODULE")
                    .setDescription(
                        `### ⛓️ **[ GOD_LOCKS ]**\n` +
                        `> • **elock <type>** - Restrict Media/Links/Cmds\n` +
                        `> • **eunlock <type>** - Revoke God-Lock\n` +
                        `> • **emassch lock** - Global channel freeze\n\n` +
                        `### 🛡️ **[ DEFENSE_VECTORS ]**\n` +
                        `> • **serverlock** / **unlock** - Instant server closure\n` +
                        `> • **panic** - Immediate lockdown / Shutdown\n` +
                        `> • **createbaseline** - Establish security snapshot`
                    )
                    .setFooter({ text: "BlueSealPrime • Defense Kernel" })
            },
            {
                label: "Authority & Trust",
                value: "trust",
                emoji: "👑",
                description: "Owners, Nukes, Backups",
                embed: new EmbedBuilder()
                    .setColor("#FFD700")
                    .setTitle("☢️ AUTHORITY & TRUST MODULE")
                    .setDescription(
                        `### 👑 **[ ABSOLUTE_POWER ]**\n` +
                        `> • **addowner** / **delowner** - Manage Architect circle\n` +
                        `> • **listowners** - View authority hierarchy\n\n` +
                        `### ☢️ **[ NUCLEAR_OPTIONS ]**\n` +
                        `> • **enuke** - High-yield channel deletion\n` +
                        `> • **edeleteserver** - ⚠️ **FULL WIPEOUT**\n\n` +
                        `### 💾 **[ ARCHIVAL ]**\n` +
                        `> • **backup** / **restore** - DNA state preservation\n` +
                        `> • **backuplist** - View system snapshots`
                    )
                    .setFooter({ text: "BlueSealPrime • Omega Protocol" })
            }
        ];

        // 3. COMPONENTS
        const getComponents = (currentIndex) => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("ehelp_select")
                .setPlaceholder("💠 INITIALIZE ROOT MODULE")
                .addOptions(categories.map((cat, index) => ({
                    label: cat.label,
                    value: cat.value,
                    emoji: cat.emoji,
                    description: cat.description,
                    default: index === currentIndex
                })));

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ehelp_prev")
                    .setLabel("⬅️ Back")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === 0),
                new ButtonBuilder()
                    .setCustomId("ehelp_stop")
                    .setLabel("⏹️ Terminate")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("ehelp_next")
                    .setLabel("Next ➡️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentIndex === categories.length - 1)
            );

            return [new ActionRowBuilder().addComponents(selectMenu), buttons];
        };

        let currentIndex = 0;
        const msg = await message.reply({
            embeds: [categories[currentIndex].embed],
            components: getComponents(currentIndex)
        });

        // 4. COLLECTOR
        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        collector.on("collect", async i => {
            if (i.customId === "ehelp_select") {
                currentIndex = categories.findIndex(c => c.value === i.values[0]);
            } else if (i.customId === "ehelp_prev") {
                currentIndex = Math.max(0, currentIndex - 1);
            } else if (i.customId === "ehelp_next") {
                currentIndex = Math.min(categories.length - 1, currentIndex + 1);
            } else if (i.customId === "ehelp_stop") {
                await i.update({ content: "🔒 **Root Session Terminated.**", embeds: [], components: [] });
                return collector.stop();
            }

            await i.update({
                embeds: [categories[currentIndex].embed],
                components: getComponents(currentIndex)
            });
        });

        collector.on("end", (_, reason) => {
            if (reason !== "user") msg.edit({ components: [] }).catch(() => { });
        });
    }
};
