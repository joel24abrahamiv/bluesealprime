const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR } = require("../config");

module.exports = {
    name: "gt",
    description: "Elite Command Briefing (Owner Only)",
    aliases: ["briefing", "ownerhelp"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply("⚠️ **System Lockdown:** This terminal is restricted to the Bot Owner only.");
        }

        const client = message.client;
        const commands = client.commands;

        // Dynamic categorization
        const categories = {
            "🛡️ SECURITY PROTOCOLS": ["audit", "antinuke", "antiraid", "blacklist", "whitelist", "panic", "qr", "uq", "vdefend", "vundefend"],
            "⚖️ MODERATION CORE": ["ban", "unban", "massban", "kick", "timeout", "warn", "mute", "unmute", "nuke", "purge", "clear", "lock", "unlock", "slowmode", "stick", "serverlock", "serverunlock"],
            "🎭 ROLE ARCHITECTURE": ["addrole", "removerole", "temprole", "massrole", "createrole", "deleterole", "reactionrole", "roleinfo", "autorole", "rolecopy"],
            "🔊 VOICE OPERATIONS": ["vmute", "vunmute", "vmuteall", "vunmuteall", "vmoveall", "muv", "muvu"],
            "⚙️ SYSTEM CONFIG": ["log", "automod", "welcome", "left", "ticketsetup", "setupverify", "backup", "restore", "serverstats"],
            "📡 NETWORK DEPLOYMENT": [] // Everything else goes here
        };

        const categorizedNames = new Set(Object.values(categories).flat());

        // Fill Network Deployment with everything else
        commands.forEach(cmd => {
            if (!categorizedNames.has(cmd.name)) {
                categories["📡 NETWORK DEPLOYMENT"].push(cmd.name);
            }
        });

        const briefingData = Object.entries(categories).map(([name, cmds]) => ({ name, cmds }));
        const embeds = [];

        // Split into 2 chunks for spaciousness
        const chunks = [briefingData.slice(0, 3), briefingData.slice(3, 6)];

        chunks.forEach((chunk, index) => {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(index === 0 ? "👑 SOVEREIGN BRIEFING • PART I" : "👑 SOVEREIGN BRIEFING • PART II")
                .setDescription(index === 0 ? "Primary security and high-risk moderation protocols." : "Administrative operations and utility network telemetry.")
                .setTimestamp();

            if (index === 0) embed.setThumbnail(client.user.displayAvatarURL());

            chunk.forEach(cat => {
                let catText = "";
                // Sort commands alphabetically for the briefing
                cat.cmds.sort().forEach(cmdName => {
                    const cmd = commands.get(cmdName);
                    const desc = cmd ? cmd.description : "No telemetry available.";
                    catText += `> **.${cmdName}** — *${desc}*\n`;
                });

                if (catText) {
                    embed.addFields({
                        name: `\n${cat.name}`,
                        value: catText,
                        inline: false
                    });
                }
            });

            if (index === 1) embed.setFooter({ text: "BlueSealPrime • Priority Alpha Access • End of Transmission" });
            embeds.push(embed);
        });

        return message.channel.send({ embeds: embeds });
    }
};
