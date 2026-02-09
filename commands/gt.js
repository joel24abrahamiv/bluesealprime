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
        const commands = [...new Set(client.commands.values())]; // Get unique command objects

        // Dynamic categorization mapping
        const categoryMap = {
            "🛡️ SECURITY PROTOCOLS": ["audit", "antinuke", "antiraid", "blacklist", "whitelist", "panic", "qr", "uq", "vdefend", "vundefend"],
            "⚖️ MODERATION CORE": ["ban", "unban", "massban", "kick", "timeout", "warn", "mute", "unmute", "nuke", "purge", "clear", "lock", "unlock", "slowmode", "stick", "serverlock", "serverunlock"],
            "🎭 ROLE ARCHITECTURE": ["addrole", "removerole", "temprole", "massrole", "createrole", "deleterole", "reactionrole", "roleinfo", "autorole", "rolecopy"],
            "🔊 VOICE OPERATIONS": ["vmute", "vunmute", "vmuteall", "vunmuteall", "vmoveall", "muv", "muvu"],
            "⚙️ SYSTEM CONFIG": ["log", "automod", "welcome", "left", "ticketsetup", "setupverify", "backup", "restore", "rebuild", "serverstats", "gt", "help"],
            "📢 BROADCASTING": ["announce", "say"],
            "⛔ RESTRICTED OVERRIDES": ["eval", "exec", "enuke", "leaveserver", "dm", "masschannel"]
        };

        const categorizedNames = new Set(Object.values(categoryMap).flat());
        const data = {};

        // Initialize categories in data
        Object.keys(categoryMap).forEach(cat => data[cat] = []);
        data["📡 NETWORK DEPLOYMENT"] = []; // Default category

        commands.forEach(cmd => {
            let category = Object.keys(categoryMap).find(cat => categoryMap[cat].includes(cmd.name));
            if (!category) category = "📡 NETWORK DEPLOYMENT";

            // Extract aliases (filtering out the command name itself)
            const aliases = cmd.aliases ? cmd.aliases.filter(a => a !== cmd.name) : [];
            const aliasText = aliases.length > 0 ? ` [${aliases.join(", ")}]` : "";

            // Subcommand extraction from usage
            let subText = "";
            if (cmd.usage && (cmd.usage.includes("<") || cmd.usage.includes("|"))) {
                // Try to extract subcommands like <create|add|remove>
                const match = cmd.usage.match(/<([^>]+)>/);
                if (match) {
                    const subs = match[1].split("|").map(s => `\`${s}\``).join(", ");
                    subText = `\n> *Subcommands: ${subs}*`;
                }
            }

            data[category].push(`> **.${cmd.name}**${aliasText} — *${cmd.description}*${subText}`);
        });

        const embeds = [];
        const entries = Object.entries(data).filter(([cat, cmds]) => cmds.length > 0);

        // Chunk categories into groups of 3 to avoid embed overflow
        for (let i = 0; i < entries.length; i += 3) {
            const chunk = entries.slice(i, i + 3);
            const partNum = Math.floor(i / 3) + 1;
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(`👑 SOVEREIGN BRIEFING • PART ${partNum}`)
                .setDescription(partNum === 1 ? "Primary security and high-risk core protocols." : "Administrative operations and utility telemetry.")
                .setTimestamp();

            if (partNum === 1) embed.setThumbnail(client.user.displayAvatarURL());

            chunk.forEach(([catTitle, cmdLines]) => {
                // Sort lines for better readability
                cmdLines.sort();

                // Group lines into blocks to respect value limits (1024 chars)
                let value = "";
                cmdLines.forEach(line => {
                    if ((value + line).length > 1000) {
                        embed.addFields({ name: catTitle + " (Cont.)", value: value, inline: false });
                        value = "";
                    }
                    value += line + "\n";
                });

                if (value) {
                    embed.addFields({ name: catTitle, value: value, inline: false });
                }
            });

            if (i + 3 >= entries.length) {
                embed.setFooter({ text: "BlueSealPrime • Priority Alpha Access • End of Transmission" });
            }
            embeds.push(embed);
        }

        return message.channel.send({ embeds: embeds });
    }
};
