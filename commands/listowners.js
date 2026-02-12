const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "listowners",
    description: "Interactive Sovereign Hierarchy Panel",
    aliases: ["owners", "elo", "authority"],

    async execute(message, args) {
        // 1. Fetch Data
        const globalOwner = await message.client.users.fetch(BOT_OWNER_ID).catch(() => null);
        const serverOwner = await message.guild.fetchOwner().catch(() => null);

        const OWNERS_DB = path.join(__dirname, "../data/owners.json");
        let extraOwnersRaw = [];
        if (fs.existsSync(OWNERS_DB)) {
            try {
                const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
                extraOwnersRaw = db[message.guild.id] || [];
            } catch (e) { }
        }

        // 2. Define Pages
        const pages = [];

        // --- PAGE 1: GLOBAL ARCHITECT ---
        pages.push(new EmbedBuilder()
            .setColor("#000000")
            .setTitle("🌐 PEAK AUTHORITY: GLOBAL ARCHITECT")
            .setDescription(
                `### **[ SUPREME_DEITY_FOUNDATION ]**\n\n\u200b\n` +
                `**The Architect** holds absolute dominion over the bot kernel and all connected server nodes.\n\n` +
                `> **Identity:** ${globalOwner ? `**${globalOwner.tag}**` : "Unknown"}\n` +
                `> **Sovereign ID:** \`${BOT_OWNER_ID}\`\n` +
                `> **Status:** ETERNAL ALPHA\n\n` +
                `> **Capabilities:** Total System Override, Kernel Access, Permission Nullification.\n\u200b`
            )
            .setThumbnail(globalOwner ? globalOwner.displayAvatarURL({ dynamic: true, size: 512 }) : null)
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setFooter({ text: "BlueSealPrime • Layer 0 - Core Foundation", iconURL: message.client.user.displayAvatarURL() })
        );

        // --- PAGE 2: SERVER OWNER ---
        pages.push(new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle("👑 DOMINION AUTHORITY: SERVER OWNER")
            .setDescription(
                `### **[ THE_KING_PROTOCOL ]**\n\n\u200b\n` +
                `The **Server Owner** reigns over this specific server shard with absolute delegated command.\n\n` +
                `> **Monarch:** ${serverOwner ? `**${serverOwner.user.tag}**` : "Unknown"}\n` +
                `> **Discord ID:** \`${message.guild.ownerId}\`\n` +
                `> **Ascension:** <t:${Math.floor(message.guild.createdTimestamp / 1000)}:R>\n\n` +
                `> **Status:** ACTIVE SOVEREIGN\n\u200b`
            )
            .setThumbnail(serverOwner ? serverOwner.user.displayAvatarURL({ dynamic: true, size: 512 }) : null)
            .setFooter({ text: `BlueSealPrime • Layer 1 - Server Authority`, iconURL: message.guild.iconURL() })
        );

        // --- PAGE 3: EXTRA OWNERS ---
        let extraOwnersList = "";
        if (extraOwnersRaw.length === 0) {
            extraOwnersList = "\n> *No individuals currently hold delegated sovereign authority.*";
        } else {
            const list = await Promise.all(extraOwnersRaw.map(async (o) => {
                const id = typeof o === 'string' ? o : o.id;
                const user = await message.client.users.fetch(id).catch(() => null);
                const tag = user ? user.tag : "Unknown Entity";
                const addedBy = o.addedBy ? `<@${o.addedBy}>` : "System/Legacy";
                const addedAt = o.addedAt ? `<t:${Math.floor(o.addedAt / 1000)}:R>` : "*Date Unknown*";

                return `### **${tag}**\n` +
                    `> • **ID:** \`${id}\`\n` +
                    `> • **Appointed By:** ${addedBy}\n` +
                    `> • **Promotion:** ${addedAt}\n\u200b`;
            }));
            extraOwnersList = list.join("\n\n");
        }

        pages.push(new EmbedBuilder()
            .setColor("#3498DB")
            .setTitle("🤝 DELEGATED AUTHORITY: EXTRA OWNERS")
            .setDescription(
                `### **[ TRUST_CHAIN_MANIFEST ]**\n\n\u200b\n` +
                `These entities possess **Acting Owner** status, granting them immunity and administrative parity.\n\n` +
                extraOwnersList
            )
            .setFooter({ text: "BlueSealPrime • Layer 2 - Trust Delegation" })
            .setTimestamp()
        );

        // 3. Navigation
        let currentPage = 0;
        const getRow = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId("page_info")
                .setLabel(`Page ${currentPage + 1} / ${pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === pages.length - 1)
        );

        const msg = await message.channel.send({
            embeds: [pages[currentPage]],
            components: [getRow()]
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 300000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "prev") currentPage--;
            if (i.customId === "next") currentPage++;

            await i.update({
                embeds: [pages[currentPage]],
                components: [getRow()]
            });
        });

        collector.on("end", () => {
            msg.edit({ components: [] }).catch(() => { });
        });
    }
};
