const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "automod",
    description: "Configure Auto-Mod Systems",
    aliases: ["am", "protection"],
    permissions: [PermissionsBitField.Flags.ManageGuild],

    async execute(message, args) {
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
            const getEmbed = () => new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("🛡️ AUTO-MOD CONFIGURATION")
                .setDescription("Toggle active security protocols below.")
                .addFields(
                    { name: "🔗 Anti-Links", value: settings.antiLinks ? "✅ **Active**" : "❌ **Disabled**", inline: true },
                    { name: "⚡ Anti-Spam", value: settings.antiSpam ? "✅ **Active**" : "❌ **Disabled**", inline: true },
                    { name: "🤬 Anti-BadWords", value: settings.antiBadWords ? "✅ **Active**" : "❌ **Disabled**", inline: true },
                    { name: "📢 Anti-MassMentions", value: settings.antiMassMentions ? "✅ **Active**" : "❌ **Disabled**", inline: true }
                )
                .setFooter({ text: "BlueSealPrime • Security Core", iconURL: message.client.user.displayAvatarURL() });

            const getRows = () => {
                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("am_links").setLabel("Toggle Links").setStyle(settings.antiLinks ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("am_spam").setLabel("Toggle Spam").setStyle(settings.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("am_words").setLabel("Toggle BadWords").setStyle(settings.antiBadWords ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("am_mentions").setLabel("Toggle Mentions").setStyle(settings.antiMassMentions ? ButtonStyle.Success : ButtonStyle.Secondary)
                );
                return [row1, row2];
            };

            const msg = await message.reply({ embeds: [getEmbed()], components: getRows() });

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

                await i.update({ embeds: [getEmbed()], components: getRows() });

                // Public Announcement
                const updatedSetting = id.split("_")[1].toUpperCase();
                const isEnabled = settings[id === "am_links" ? "antiLinks" : id === "am_spam" ? "antiSpam" : id === "am_words" ? "antiBadWords" : "antiMassMentions"];

                message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(isEnabled ? "#00FF00" : "#FF0000")
                            .setTitle("🛡️ SECURITY UPDATE")
                            .setDescription(`**AutoMod Protocol Changed.**\nModule: **${updatedSetting}**\nNew Status: **${isEnabled ? "ONLINE" : "OFFLINE"}**`)
                            .setFooter({ text: `Authorized by ${message.author.tag}` })
                    ]
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
            message.reply(`✅ **Configuration Updated**`);
        } else {
            message.reply("⚠️ **Invalid Option.** Use `!automod` for the menu.");
        }
    }
};
