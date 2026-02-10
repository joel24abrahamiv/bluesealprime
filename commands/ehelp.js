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
                `access to restricted kernel commands.\n\n` +
                `**Select a module below:**\n` +
                `• 🛡️ **System & Utils** (Stats, Logging, Scanning)\n` +
                `• ☢️ **Danger & Backup** (Nukes, Deletions, Recovery)`
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
                description: "Stats, Logs, Scans, Announcements",
                embed: new EmbedBuilder()
                    .setColor("#000000") // Black
                    .setTitle("🛡️ SYSTEM & UTILS MODULE")
                    .setDescription(
                        `### 📊 **[ SYSTEM_METRICS ]**\n` +
                        `> • **eram** - View hosting resources (RAM/CPU)\n` +
                        `> • **estats** - View bot latency & heartbeat\n` +
                        `> • **eusers** - Global user correlation stats\n\n` +
                        `### 📝 **[ LOGGING_INTERCEPT ]**\n` +
                        `> • **elogs** - Audit current server logs\n` +
                        `> • **eloggings <id>** - Bridge logs to channel\n` +
                        `> • **elogsbot** - Global cross-server spy\n` +
                        `> • **flagged** - Identify high-risk entities\n\n` +
                        `### 📡 **[ BROADCAST ]**\n` +
                        `> • **eannoc <msg>** - Global Neural Broadcast\n` +
                        `> • **scanserver** - Run Deep Scan Protocol\n` +
                        `> • **createabaseline** - Establish Security Baseline\n` +
                        `> • **eval** - Toggle Root Access\n` +
                        `> • **eexit** - Terminate Session`
                    )
                    .setFooter({ text: "BlueSealPrime • System Module" })
            },
            {
                label: "Danger & Backup",
                value: "danger",
                emoji: "☢️",
                description: "Nukes, Deletions, Restores",
                embed: new EmbedBuilder()
                    .setColor("#FF0000") // RED
                    .setTitle("☢️ DANGER & BACKUP MODULE")
                    .setDescription(
                        `### ⛔ **[ DESTRUCTIVE_OPS ]**\n` +
                        `> • **edeleteserver** - ⚠️ **TERMINATE SERVER**\n` +
                        `> • **enuke <id>** - Nuclear Option (Server)\n` +
                        `> • **edelnuke <id>** - Channel Annihilation\n` +
                        `> • **purgebots** - Unauthorized Bot Purge\n\n` +
                        `### 💾 **[ RECOVERY_SYSTEMS ]**\n` +
                        `> • **backup** - Create System Snapshot\n` +
                        `> • **restore <id>** - Restore from Snapshot\n` +
                        `> • **recovery** - Emergency Recovery Mode\n` +
                        `> • **rembck <id>** - Delete Snapshot\n` +
                        `> • **bckstatus** - View Snapshot Integrity\n` +
                        `> • **backuplist** - Global Snapshot Index\n` +
                        `> • **autobackup** - Toggle Auto-Archival`
                    )
                    .setFooter({ text: "BlueSealPrime • Danger Module" })
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
