const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "stats",
    description: "Detailed Server & User Statistics with Pagination",
    aliases: ["botstats", "systeminfo", "users", "eusers"],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const mainProcess = require("../index");

        if (!message || !message.guild) return;

        // Permissions Check
        const botMember = message.guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
            }).catch(() => { });
        }

        try {
            const guilds = message.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);
            const totalServers = guilds.size;
            const totalUsers = guilds.reduce((acc, g) => acc + g.memberCount, 0);
            const averageServerSize = totalServers > 0 ? (totalUsers / totalServers).toFixed(0) : 0;
            const botAvatar = V2.botAvatar(message);

            let currentPage = 0;
            const serversPerPage = 10;
            const totalPages = Math.ceil(totalServers / serversPerPage);

            const generateStatsContainer = (page) => {
                const start = page * serversPerPage;
                const end = start + serversPerPage;
                const currentGuilds = guilds.toJSON().slice(start, end);

                const listText = currentGuilds.map((g, i) => {
                    const index = `${start + i + 1}.`.padEnd(3, " ");
                    return `**${index} ${g.name}**\n> 👥 Members: \`${g.memberCount.toLocaleString()}\`\n> 🆔 ID: \`${g.id}\`\n`;
                }).join("\n");

                return V2.container([
                    V2.section([
                        V2.heading("📊 BlueSealPrime Intelligence", 2),
                        V2.text(`\`Time: ${new Date().toLocaleTimeString()}\``),
                        V2.text(`🔴 **Access Granted:** <@${message.author.id}>`)
                    ], botAvatar),

                    V2.separator(),

                    V2.heading("📈 NETWORK ANALYTICS", 3),
                    V2.text(
                        `🌐 **Total Servers:** \` ${totalServers.toString().padEnd(4, " ")} \` nodes\n` +
                        `👥 **Total Users:**   \` ${totalUsers.toLocaleString().padEnd(8, " ")} \` entities\n` +
                        `📊 **Avg Node Size:** \` ${averageServerSize.toString().padEnd(4, " ")} \` units/node`
                    ),

                    V2.separator(),

                    V2.heading(`🏆 GLOBAL LEADERBOARD (Page ${page + 1}/${totalPages})`, 3),
                    V2.text(listText || "No more nodes found in this sector.")
                ], V2_BLUE);
            };

            const generateButtons = (page) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("stats_prev").setLabel("Previous").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
                    new ButtonBuilder().setCustomId("stats_next").setLabel("Next").setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1)
                );
            };

            const initialMessage = await message.reply({
                flags: V2.flag,
                components: [generateStatsContainer(currentPage), generateButtons(currentPage)]
            });

            const collector = initialMessage.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 300000
            });

            collector.on("collect", async (interaction) => {
                if (interaction.customId === "stats_prev") currentPage--;
                if (interaction.customId === "stats_next") currentPage++;

                await interaction.update({
                    components: [generateStatsContainer(currentPage), generateButtons(currentPage)]
                });
            });

            collector.on("end", () => {
                initialMessage.edit({ components: [] }).catch(() => { });
            });

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "stats", Date.now() - EXECUTION_START_TIME, "SUCCESS").catch(() => { });
            }

        } catch (err) {
            console.error(err);
            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logError("stats", err);
            }
        }
    }
};