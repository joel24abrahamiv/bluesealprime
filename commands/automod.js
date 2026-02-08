const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "automod",
    description: "Toggle auto-mod features like Anti-Spam and Anti-Links.",
    aliases: ["am", "protection"],
    permissions: [PermissionsBitField.Flags.ManageGuild],
    async execute(message, args) {
        const DB_PATH = path.join(__dirname, "../data/automod.json");

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        }

        const guildId = message.guild.id;
        if (!data[guildId]) {
            data[guildId] = {
                antiLinks: false,
                antiSpam: false,
                whitelist: [] // Whitelisted users/roles
            };
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const statusEmbed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("🛡️ AUTO-MOD CONTROL PANEL")
                .setDescription("Status of automated protection systems.")
                .addFields(
                    { name: "🔗 Anti-Links", value: data[guildId].antiLinks ? "✅ Enabled" : "❌ Disabled", inline: true },
                    { name: "⚡ Anti-Spam", value: data[guildId].antiSpam ? "✅ Enabled" : "❌ Disabled", inline: true }
                )
                .addFields(
                    { name: "📜 Commands", value: "`!automod links` - Toggle Link Protection\n`!automod spam` - Toggle Spam Protection", inline: false }
                )
                .setFooter({ text: "BlueSealPrime • Security Systems" });

            return message.reply({ embeds: [statusEmbed] });
        }

        if (subCommand === "links" || subCommand === "link") {
            data[guildId].antiLinks = !data[guildId].antiLinks;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
            return message.reply(`${data[guildId].antiLinks ? "✅" : "❌"} **Link Protection** has been ${data[guildId].antiLinks ? "enabled" : "disabled"}.`);
        }

        if (subCommand === "spam") {
            data[guildId].antiSpam = !data[guildId].antiSpam;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
            return message.reply(`${data[guildId].antiSpam ? "✅" : "❌"} **Spam Protection** has been ${data[guildId].antiSpam ? "enabled" : "disabled"}.`);
        }
    }
};
