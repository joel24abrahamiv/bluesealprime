const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "god_admin",
    description: "God Mode Administrative Commands",
    aliases: ["eannoc", "edelnuke", "enuke"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // EANNOC: Global Announcement
        if (commandName === "eannoc") {
            const announcement = args.join(" ");
            if (!announcement) return message.reply("Provide a message to broadcast globally.");

            await message.reply(`📢 **Broadcasting Global Announcement...**`);

            let sentCount = 0;
            // Iterate over all cached guilds
            message.client.guilds.cache.forEach(async guild => {
                // Find a suitable channel: first text channel where bot can send messages
                const channel = guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildText &&
                    c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
                );

                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor("#FFD700")
                        .setTitle("📢 GLOBAL SYSTEM ANNOUNCEMENT")
                        .setDescription(announcement)
                        .setFooter({ text: "BlueSealPrime • Global Broadcast" });

                    try {
                        await channel.send({ embeds: [embed] });
                        sentCount++;
                    } catch (e) {
                        // Ignore errors if can't send
                    }
                }
            });

            return message.channel.send(`✅ **Broadcast Complete:** Sent to \`${sentCount}\` servers.`);
        }

        // EDELNUKE: Delete All Channels (with confirmation)
        if (commandName === "edelnuke") {
            if (message.content.includes("--confirm")) {
                const channels = message.guild.channels.cache;
                await message.reply(`🧨 **NUKING ${channels.size} CHANNELS...**`);
                channels.forEach(c => c.delete().catch(() => { }));
            } else {
                return message.reply("⚠️ **SAFETY LOCK:** Run `!edelnuke --confirm` to delete ALL channels in this server.");
            }
        }

        // ENUKE: Wrapper
        if (commandName === "enuke") {
            const enukeCmd = message.client.commands.get("enuke");
            if (enukeCmd) return enukeCmd.execute(message, args);
            return message.reply("Enuke module not found.");
        }
    }
};
