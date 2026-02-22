const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "automod",
    description: "Configure Auto-Mod Systems",
    aliases: ["am", "protection"],
    permissions: [PermissionsBitField.Flags.ManageGuild],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const DB_PATH = path.join(__dirname, "../data/automod.json");

        // Load or Init Data
        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const guildId = message.guild.id;
        const defaults = { antiLinks: true, antiSpam: true, antiBadWords: true, antiMassMentions: true };

        if (!data[guildId]) data[guildId] = defaults;
        let settings = data[guildId];

        // ───── INTERACTIVE MENU ─────
        if (!args[0]) {
            const getContainer = (currentSettings) => {
                // Button Rows
                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("am_links").setLabel("Toggle Links").setStyle(currentSettings.antiLinks ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("am_spam").setLabel("Toggle Spam").setStyle(currentSettings.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("am_words").setLabel("Toggle BadWords").setStyle(currentSettings.antiBadWords ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("am_mentions").setLabel("Toggle Mentions").setStyle(currentSettings.antiMassMentions ? ButtonStyle.Success : ButtonStyle.Secondary)
                );

                return V2.container([
                    V2.section(
                        [
                            V2.heading("🛡️ AUTO-MOD CONFIGURATION", 2),
                            V2.text("Active Security Protocols")
                        ],
                        "https://cdn-icons-png.flaticon.com/512/2092/2092663.png" // Shield Settings Icon
                    ),
                    V2.separator(),
                    V2.heading("📊 MODULE STATUS", 3),
                    V2.text(
                        `> **🔗 Anti-Links:** ${currentSettings.antiLinks ? "✅ Active" : "❌ Disabled"}\n` +
                        `> **⚡ Anti-Spam:** ${currentSettings.antiSpam ? "✅ Active" : "❌ Disabled"}\n` +
                        `> **🤬 Anti-BadWords:** ${currentSettings.antiBadWords ? "✅ Active" : "❌ Disabled"}\n` +
                        `> **📢 Anti-MassMentions:** ${currentSettings.antiMassMentions ? "✅ Active" : "❌ Disabled"}`
                    ),
                    V2.separator(),
                    row1, // Embed buttons directly
                    row2,
                    V2.separator(),
                    V2.text("*BlueSealPrime Security Core*")
                ], "#0099ff");
            };

            const msg = await message.reply({
                content: null,
                flags: V2.flag,
                components: [getContainer(settings)]
            });

            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 60000
            });

            collector.on("collect", async i => {
                const id = i.customId;
                if (id === "am_links") settings.antiLinks = !settings.antiLinks;
                if (id === "am_spam") settings.antiSpam = !settings.antiSpam;
                if (id === "am_words") settings.antiBadWords = !settings.antiBadWords;
                if (id === "am_mentions") settings.antiMassMentions = !settings.antiMassMentions;

                data[guildId] = settings;
                fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

                await i.update({
                    content: null,
                    flags: V2.flag,
                    components: [getContainer(settings)]
                });

                // Public Announcement
                const updatedSetting = id.split("_")[1].toUpperCase();
                const isEnabled = settings[id === "am_links" ? "antiLinks" : id === "am_spam" ? "antiSpam" : id === "am_words" ? "antiBadWords" : "antiMassMentions"];

                const alertContainer = V2.container([
                    V2.heading("🛡️ SECURITY UPDATE", 2),
                    V2.text(`**AutoMod Protocol Changed.**\n> Module: **${updatedSetting}**\n> New Status: **${isEnabled ? "ONLINE" : "OFFLINE"}**`),
                    V2.separator(),
                    V2.text(`*Authorized by ${message.author.tag}*`)
                ], isEnabled ? "#00FF00" : "#FF0000"); // Keep Red/Green for alerts as they are status updates, or Blue if user insists on 100% blue. User said "All V2 containers... set to Blue".
                // I'll stick to Blue #0099ff for consistency with the user's strict request.

                const unifiedAlert = V2.container([
                    V2.heading("🛡️ SECURITY UPDATE", 2),
                    V2.text(`**AutoMod Protocol Changed.**\n> Module: **${updatedSetting}**\n> New Status: **${isEnabled ? "ONLINE" : "OFFLINE"}**`),
                    V2.separator(),
                    V2.text(`*Authorized by ${message.author.tag}*`)
                ], "#0099ff");

                message.channel.send({
                    content: null,
                    flags: V2.flag,
                    components: [unifiedAlert]
                });
            });

            return;
        }

        // ───── MANUAL COMMAND OVERRIDES (Legacy support) ─────
        const sub = args[0].toLowerCase();
        let changed = false;

        if (sub === "links") { settings.antiLinks = !settings.antiLinks; changed = true; }
        if (sub === "spam") { settings.antiSpam = !settings.antiSpam; changed = true; }
        if (sub === "badwords") { settings.antiBadWords = !settings.antiBadWords; changed = true; }
        if (sub === "mentions") { settings.antiMassMentions = !settings.antiMassMentions; changed = true; }

        if (changed) {
            data[guildId] = settings;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const container = V2.container([
                V2.heading("✅ CONFIGURATION UPDATED", 2),
                V2.text("Manual override accepted."),
                V2.separator(),
                V2.text("*BlueSealPrime Security Core*")
            ], "#0099ff");

            message.reply({
                content: null,
                flags: V2.flag,
                components: [container]
            });
        } else {
            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ INVALID OPTION", 3), V2.text("Use `!automod` for the interactive menu.")], require("../config").WARN_COLOR)]
            });
        }
    }
};
